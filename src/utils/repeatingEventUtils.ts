import { Event, RepeatType, RepeatingEvent } from '../types';

export const isRepeatingEvent = (event: unknown): event is RepeatingEvent => {
  return (event as Event).repeat.type !== 'none';
};

const getNextDailyDate = (date: Date, interval: number, index: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + interval * index);
  return newDate;
};

const getNextMonthlyDate = (date: Date, interval: number, index: number) => {
  const newDate = new Date(
    date.getFullYear(),
    date.getMonth() + interval * index,
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );

  if (newDate.getMonth() !== (date.getMonth() + interval * index) % 12) {
    return new Date(
      date.getFullYear(),
      date.getMonth() + interval * index + 1,
      0,
      date.getHours(),
      date.getMinutes()
    );
  }

  return newDate;
};

export const getNextRepeatingDate = (
  date: Date,
  type: Exclude<RepeatType, 'none'>,
  interval: number,
  index: number
): Date => {
  switch (type) {
    case 'daily':
      return getNextDailyDate(date, interval, index);
    case 'weekly':
      return getNextDailyDate(date, interval * 7, index);
    case 'monthly':
      return getNextMonthlyDate(date, interval, index);
    case 'yearly':
      return getNextMonthlyDate(date, interval * 12, index);
  }
};

export const getClosestStartDate = (date: Date, targetDay: number): Date => {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(date);
    day.setDate(day.getDate() + i);
    return day;
  });

  const targetDayIndex = weekDays.findIndex((day) => day.getDay() == targetDay);
  console.log(weekDays[targetDayIndex]);
  return weekDays[targetDayIndex];
};
