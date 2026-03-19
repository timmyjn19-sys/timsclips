import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import {
  getAvailabilityWindows,
  getBookingsForWindow,
  generateAvailableSlots,
  createBooking,
  AvailabilityWindow,
  Booking
} from '../services/bookingService';
import { auth } from '../firebase';
import { format, parse, addMinutes, isAfter, isEqual } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<AvailabilityWindow | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = getAvailabilityWindows(setWindows);
      return () => unsubscribe();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedWindow) {
        setLoading(true);
        const existing = await getBookingsForWindow(selectedWindow.id);
        const slots = generateAvailableSlots(selectedWindow, existing);
        setAvailableSlots(slots);
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selectedWindow]);

  const handleBooking = async () => {
    if (!selectedWindow || !selectedSlot || !auth.currentUser) return;

    setLoading(true);
    try {
      const start = parse(`${selectedWindow.date} ${selectedSlot}`, 'yyyy-MM-dd HH:mm', new Date());
      const end = addMinutes(start, 90); // Fixed duration for now

      const bookingData: Omit<Booking, 'id'> = {
        windowId: selectedWindow.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        userEmail: auth.currentUser.email || '',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'confirmed'
      };

      if (notes.trim()) {
        bookingData.notes = notes.trim();
      }

      await createBooking(bookingData);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Booking failed');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const now = new Date();
  const minAllowedStart = addMinutes(now, 15);
  const validWindows = windows.filter(w => {
    try {
      const windowEnd = parse(`${w.date} ${w.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const lastValidStart = addMinutes(windowEnd, -90); // Assuming 90 min duration
      return isAfter(lastValidStart, minAllowedStart) || isEqual(lastValidStart, minAllowedStart);
    } catch {
      return false;
    }
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-brand-dark border border-brand-cream/10 rounded-[40px] overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-brand-cream/5 rounded-full transition-colors text-brand-cream/40 hover:text-brand-cream"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-12">
            {!success ? (
              <>
                <h2 className="text-4xl font-display font-bold mb-8 text-brand-cream">
                  Book Your <span className="text-brand-burgundy">Chair.</span>
                </h2>

                <div className="space-y-8">
                  {/* Step 1: Select Date/Window */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-brand-cream/40 mb-4">Select a Date</label>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {validWindows.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => {
                            setSelectedWindow(w);
                            setSelectedSlot(null);
                          }}
                          className={`flex-shrink-0 p-6 rounded-3xl border transition-all ${selectedWindow?.id === w.id
                            ? "bg-brand-burgundy border-brand-burgundy text-brand-cream"
                            : "bg-brand-cream/5 border-brand-cream/10 text-brand-cream/60 hover:border-brand-cream/20"
                            }`}
                        >
                          <Calendar className="w-5 h-5 mb-2" />
                          <div className="font-bold">{format(parse(w.date, 'yyyy-MM-dd', new Date()), 'MMM dd')}</div>
                          <div className="text-xs opacity-60">{w.startTime} - {w.endTime}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Time Slot */}
                  {selectedWindow && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-xs uppercase tracking-widest text-brand-cream/40 mb-4">Available Times (15-Min Increments)</label>
                      {loading ? (
                        <div className="text-brand-cream/40 italic">Calculating availability...</div>
                      ) : (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-2 text-sm rounded-xl border transition-all ${selectedSlot === slot
                                ? "bg-brand-cream text-brand-black border-brand-cream"
                                : "bg-brand-cream/5 border-brand-cream/10 text-brand-cream/60 hover:border-brand-cream/20"
                                }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Add Notes */}
                  {selectedSlot && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-xs uppercase tracking-widest text-brand-cream/40 mb-4">Any special requests? (Optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="E.g. Just a trim on top, keeping the length..."
                        className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-xl p-4 text-brand-cream focus:outline-none focus:border-brand-burgundy/50 min-h-[100px] resize-none"
                      />
                    </motion.div>
                  )}

                  {/* Step 4: Confirm */}
                  <div className="pt-8">
                    <button
                      disabled={!selectedSlot || loading}
                      onClick={handleBooking}
                      className="w-full bg-brand-burgundy text-brand-cream font-bold py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-burgundy/80 transition-all shadow-[0_0_30px_rgba(74,14,14,0.3)]"
                    >
                      {loading ? 'Processing...' : selectedSlot ? `Confirm Appointment at ${selectedSlot}` : 'Select a Time'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-brand-burgundy/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-10 h-10 text-brand-burgundy" />
                </div>
                <h2 className="text-4xl font-display font-bold mb-4 text-brand-cream">Booking Confirmed!</h2>
                <div className="bg-brand-cream/5 border border-brand-cream/10 rounded-3xl p-6 mb-8 max-w-sm mx-auto">
                  <div className="text-brand-cream/40 text-xs uppercase tracking-widest mb-2">Appointment Details</div>
                  <div className="text-brand-cream font-bold text-lg mb-1">
                    {selectedWindow && format(parse(selectedWindow.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM do')}
                  </div>
                  <div className="text-brand-burgundy font-bold text-2xl">
                    {selectedSlot}
                  </div>
                  <div className="text-brand-cream/40 text-sm mt-4">
                    90 Minute Max Session
                  </div>
                </div>
                <p className="text-brand-cream/60 mb-12">We've reserved your chair. A confirmation has been sent to your email.</p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setSelectedWindow(null);
                    setSelectedSlot(null);
                    setNotes('');
                    onClose();
                  }}
                  className="bg-brand-cream text-brand-black font-bold px-12 py-4 rounded-full hover:scale-105 transition-transform"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
