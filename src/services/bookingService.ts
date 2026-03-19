import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  orderBy,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { format, parse, addMinutes, isBefore, isAfter, isEqual, startOfDay } from 'date-fns';

export interface AvailabilityWindow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface Booking {
  id: string;
  windowId: string;
  userId: string;
  userName: string;
  userEmail: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  status?: string;
  createdAt: string;
}

export const createAvailabilityWindow = async (window: Omit<AvailabilityWindow, 'id'>) => {
  return await addDoc(collection(db, 'availability'), {
    ...window,
    createdAt: new Date().toISOString()
  });
};

export const deleteAvailabilityWindow = async (id: string) => {
  return await deleteDoc(doc(db, 'availability', id));
};

export const getAvailabilityWindows = (callback: (windows: AvailabilityWindow[]) => void) => {
  const q = query(collection(db, 'availability'), orderBy('date', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const windows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AvailabilityWindow));
    callback(windows);
  });
};

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
  const docRef = await addDoc(collection(db, 'bookings'), {
    ...booking,
    createdAt: new Date().toISOString()
  });

  // Send to webhook
  try {
    await fetch('https://hook.us2.make.com/ymqk7tlo9x3397h3knkssycwkvkcyr9n', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: docRef.id,
        ...booking,
        readableTime: format(new Date(booking.startTime), 'PPPPp')
      }),
    });
  } catch (error) {
    console.error('Webhook failed:', error);
  }

  return docRef;
};

export const getBookingsForWindow = async (windowId: string) => {
  const q = query(collection(db, 'bookings'), where('windowId', '==', windowId), where('status', 'in', ['confirmed', 'pending']));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
};

export const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
  const docRef = doc(db, 'bookings', bookingId);
  return await updateDoc(docRef, { status });
};

export const getUserBookings = (userId: string, callback: (bookings: Booking[]) => void) => {
  const q = query(collection(db, 'bookings'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    callback(bookings);
  });
};

export const getAllBookings = (callback: (bookings: Booking[]) => void) => {
  const q = query(collection(db, 'bookings'), orderBy('startTime', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    callback(bookings);
  });
};

export const getPendingUsers = (callback: (users: AppUser[]) => void) => {
  const q = query(collection(db, 'users'), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ ...doc.data() } as AppUser));
    callback(users);
  });
};

export const approveUser = async (uid: string) => {
  const docRef = doc(db, 'users', uid);
  return await updateDoc(docRef, { status: 'approved' });
};

// Logic to generate valid start times
export const generateAvailableSlots = (
  window: AvailabilityWindow,
  existingBookings: Booking[],
  durationMinutes: number = 90 // Default duration
) => {
  const slots: string[] = [];
  const windowDate = parse(window.date, 'yyyy-MM-dd', new Date());
  const windowStart = parse(`${window.date} ${window.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const windowEnd = parse(`${window.date} ${window.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

  // Last valid start time
  const lastValidStart = addMinutes(windowEnd, -durationMinutes);

  const now = new Date();
  const minAllowedStart = addMinutes(now, 720);

  let current = windowStart;
  while (isBefore(current, lastValidStart) || isEqual(current, lastValidStart)) {
    const slotStart = current;
    const slotEnd = addMinutes(current, durationMinutes);

    // Check capacity
    const overlapping = existingBookings.filter(b => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      return isBefore(slotStart, bEnd) && isAfter(slotEnd, bStart);
    });

    if (overlapping.length < window.capacity) {
      if (isAfter(current, minAllowedStart) || isEqual(current, minAllowedStart)) {
        slots.push(format(current, 'HH:mm'));
      }
    }

    current = addMinutes(current, 15); // 15-minute increments
  }

  return slots;
};
