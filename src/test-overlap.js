const { parse, addMinutes, isBefore, isAfter, isEqual, format } = require('date-fns');

const window = {
  date: '2025-03-20',
  startTime: '09:00',
  endTime: '17:00',
  capacity: 1
};

const existingBookings = [
  {
    startTime: parse('2025-03-20 10:00', 'yyyy-MM-dd HH:mm', new Date()).toISOString(),
    endTime: parse('2025-03-20 10:45', 'yyyy-MM-dd HH:mm', new Date()).toISOString(),
  }
];

const durationMinutes = 90;
const slots = [];
const windowStart = parse(`${window.date} ${window.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
const windowEnd = parse(`${window.date} ${window.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
const lastValidStart = addMinutes(windowEnd, -durationMinutes);

// Use old date to bypass minAllowedStart
const minAllowedStart = new Date(0); 

let current = windowStart;
while (isBefore(current, lastValidStart) || isEqual(current, lastValidStart)) {
  const slotStart = current;
  const slotEnd = addMinutes(current, durationMinutes);

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
  } else {
    console.log('Skipped due to overlap:', format(current, 'HH:mm'), 'Overlapping count:', overlapping.length);
  }

  current = addMinutes(current, 15);
}

console.log('Available slots:', slots);
