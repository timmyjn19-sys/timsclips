import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Calendar, Clock, Users } from 'lucide-react';
import { 
  createAvailabilityWindow, 
  getAvailabilityWindows, 
  deleteAvailabilityWindow,
  AvailabilityWindow 
} from '../services/bookingService';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [newWindow, setNewWindow] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    capacity: 1
  });

  useEffect(() => {
    const unsubscribe = getAvailabilityWindows(setWindows);
    return () => unsubscribe();
  }, []);

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

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-12 text-brand-burgundy">Admin Dashboard</h1>
        
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
