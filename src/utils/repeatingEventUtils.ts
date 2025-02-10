import { Event, RepeatType, RepeatingEvent } from '../types';

export const isRepeatingEvent = (event: unknown): event is RepeatingEvent => {
  return (event as Event).repeat.type !== 'none';
};

const getNextDailyDate = (date: Date, interval: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + interval);
  return newDate;
};

const getNextMonthlyDate = (date: Date, interval: number) => {
  const newDate = new Date(date);
  let refinedDate: Date | null = null;
  newDate.setMonth(newDate.getMonth() + interval);
  if (newDate.getMonth() !== date.getMonth() + interval) {
    refinedDate = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 0);
  }
  return refinedDate ?? newDate;
};

const getNextYearlyDate = (date: Date, interval: number) => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + interval);
  return newDate;
};

export const getNextRepeatingDate = (
  date: Date,
  type: Exclude<RepeatType, 'none'>,
  interval: number
): Date => {
  switch (type) {
    case 'daily':
      return getNextDailyDate(date, interval);
    case 'weekly':
      return getNextDailyDate(date, interval * 7);
    case 'monthly':
      return getNextMonthlyDate(date, interval);
    case 'yearly':
      return getNextYearlyDate(date, interval);
  }
};
