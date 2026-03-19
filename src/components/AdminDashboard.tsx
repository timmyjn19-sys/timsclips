import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Calendar, Clock, Users, Mail, ChevronDown, ChevronUp, CalendarDays, CheckCircle } from 'lucide-react';
import { 
  createAvailabilityWindow, 
  getAvailabilityWindows, 
  deleteAvailabilityWindow,
  getAllBookings,
  getPendingUsers,
  approveUser,
  AppUser,
  AvailabilityWindow,
  Booking
} from '../services/bookingService';
import { format, startOfDay, addDays, isSameDay, parseISO } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingUsers, setPendingUsers] = useState<AppUser[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  const [newWindow, setNewWindow] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    capacity: 1
  });

  useEffect(() => {
    const unsubscribeWindows = getAvailabilityWindows(setWindows);
    const unsubscribeBookings = getAllBookings(setBookings);
    const unsubscribePendingUsers = getPendingUsers(setPendingUsers);
    return () => {
      unsubscribeWindows();
      unsubscribeBookings();
      unsubscribePendingUsers();
    };
  }, []);

  // Compute 7 days
  const today = startOfDay(new Date());
  const next7Days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  // Group subscribers
  const subscribersMap: Record<string, { id: string; name: string; email: string; bookings: Booking[] }> = bookings.reduce((acc, booking) => {
    if (!acc[booking.userId]) {
      acc[booking.userId] = {
        id: booking.userId,
        name: booking.userName,
        email: booking.userEmail,
        bookings: []
      };
    }
    acc[booking.userId].bookings.push(booking);
    return acc;
  }, {} as Record<string, { id: string; name: string; email: string; bookings: Booking[] }>);
  
  const subscribers: { id: string; name: string; email: string; bookings: Booking[] }[] = Object.values(subscribersMap);

  const handleAddWindow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAvailabilityWindow(newWindow);
      alert('Availability window added');
    } catch (error) {
      console.error(error);
      alert('Error adding window');
    }
  };

  const handleApproveUser = async (uid: string) => {
    try {
      await approveUser(uid);
    } catch (error) {
      console.error(error);
      alert('Error approving user');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-12 text-brand-burgundy">Admin Dashboard</h1>

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 text-yellow-500">
              <CheckCircle className="w-6 h-6" /> Pending Account Approvals ({pendingUsers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map(user => (
                <div key={user.uid} className="glass p-6 rounded-2xl flex justify-between items-center bg-yellow-500/5 border border-yellow-500/20">
                  <div>
                    <div className="font-bold text-lg text-brand-cream">{user.displayName}</div>
                    <div className="text-sm text-brand-cream/60 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {user.email}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApproveUser(user.uid)}
                    className="bg-brand-burgundy text-brand-cream font-bold px-6 py-2 rounded-full hover:bg-brand-burgundy/80 transition-colors shadow-lg"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weekly Schedule */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-burgundy" /> 7-Day Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {next7Days.map((day, idx) => {
              const dayBookings = bookings.filter(b => b.status === 'confirmed' && isSameDay(parseISO(b.startTime), day));
              return (
                <div key={idx} className="glass p-4 rounded-2xl flex flex-col min-h-[150px]">
                  <div className="text-brand-cream/60 text-xs uppercase tracking-widest mb-1">{format(day, 'EEE')}</div>
                  <div className="text-xl font-bold text-brand-cream mb-4">{format(day, 'MMM d')}</div>
                  <div className="flex-1 flex flex-col gap-2">
                    {dayBookings.length === 0 ? (
                      <div className="text-brand-cream/20 text-sm italic mt-auto mb-auto text-center">No bookings</div>
                    ) : (
                      dayBookings.map(b => (
                        <div key={b.id} className="bg-brand-burgundy/20 border border-brand-burgundy/30 rounded-lg p-2 text-xs">
                          <div className="font-bold text-brand-cream">{format(parseISO(b.startTime), 'h:mm a')}</div>
                          <div className="text-brand-cream/80 truncate" title={b.userName}>{b.userName}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Subscribers & Appointments */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-burgundy" /> Subscribers ({subscribers.length})
          </h2>
          <div className="flex flex-col gap-4">
            {subscribers.length === 0 ? (
              <div className="glass p-8 rounded-2xl text-center text-brand-cream/40">No subscribers yet.</div>
            ) : (
              subscribers.map(sub => (
                <div key={sub.id} className="glass rounded-2xl overflow-hidden transition-all">
                  <div 
                    onClick={() => setExpandedUser(expandedUser === sub.id ? null : sub.id)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-brand-cream/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-burgundy/20 rounded-full flex items-center justify-center text-brand-burgundy font-bold text-xl">
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{sub.name}</div>
                        <div className="text-sm text-brand-cream/60 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {sub.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-brand-burgundy">{sub.bookings.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-brand-cream/40">Bookings</div>
                      </div>
                      {expandedUser === sub.id ? <ChevronUp className="w-5 h-5 text-brand-cream/40" /> : <ChevronDown className="w-5 h-5 text-brand-cream/40" />}
                    </div>
                  </div>
                  
                  {/* Expanded content */}
                  {expandedUser === sub.id && (
                    <div className="p-6 pt-0 border-t border-brand-cream/10 bg-black/20">
                      <h4 className="text-xs uppercase tracking-widest text-brand-cream/40 mb-4 mt-4">Appointment History</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sub.bookings.sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).map(b => (
                          <div key={b.id} className="bg-brand-cream/5 border border-brand-cream/10 rounded-xl p-3">
                            <div className="font-bold text-brand-cream">{format(parseISO(b.startTime), 'MMM d, yyyy')}</div>
                            <div className="text-brand-burgundy text-sm mb-2">{format(parseISO(b.startTime), 'h:mm a')}</div>
                            <div className="text-xs text-brand-cream/40 uppercase tracking-widest inline-block px-2 py-1 bg-brand-cream/5 rounded-full">
                              {b.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Separator before Settings */}
        <hr className="border-brand-cream/10 my-12" />
        <h2 className="text-3xl font-display font-bold mb-8 text-brand-cream/90 flex items-center gap-3">
          Schedule Management
        </h2>
        
        <section className="glass p-8 rounded-3xl mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" /> Create Availability Window
          </h2>
          <form onSubmit={handleAddWindow} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-cream/40 mb-2">Date</label>
              <input 
                type="date" 
                value={newWindow.date}
                onChange={(e) => setNewWindow({...newWindow, date: e.target.value})}
                className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-xl p-3 text-brand-cream focus:border-brand-burgundy outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-cream/40 mb-2">Start Time</label>
              <input 
                type="time" 
                value={newWindow.startTime}
                onChange={(e) => setNewWindow({...newWindow, startTime: e.target.value})}
                className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-xl p-3 text-brand-cream focus:border-brand-burgundy outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-cream/40 mb-2">End Time</label>
              <input 
                type="time" 
                value={newWindow.endTime}
                onChange={(e) => setNewWindow({...newWindow, endTime: e.target.value})}
                className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-xl p-3 text-brand-cream focus:border-brand-burgundy outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-cream/40 mb-2">Capacity</label>
              <input 
                type="number" 
                min="1"
                value={newWindow.capacity}
                onChange={(e) => setNewWindow({...newWindow, capacity: parseInt(e.target.value)})}
                className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-xl p-3 text-brand-cream focus:border-brand-burgundy outline-none"
                required
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button 
                type="submit"
                className="w-full bg-brand-burgundy text-brand-cream font-bold py-4 rounded-xl hover:bg-brand-burgundy/80 transition-colors"
              >
                Add Window
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Current Availability</h2>
          <div className="grid grid-cols-1 gap-4">
            {windows.map((w) => (
              <div key={w.id} className="glass p-6 rounded-2xl flex justify-between items-center">
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-burgundy" />
                    <span>{w.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-burgundy" />
                    <span>{w.startTime} - {w.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-burgundy" />
                    <span>Capacity: {w.capacity}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteAvailabilityWindow(w.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
