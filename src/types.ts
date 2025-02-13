export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  id?: string;
  type: RepeatType;
  interval: number;
  endDate?: string;
  days?: number[];
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위로 저장
}

export interface Event extends EventForm {
  id: string;
}

export interface RepeatingEvent extends Omit<EventForm, 'repeat'> {
  id?: string;
  repeat: {
    id: string;
    type: Exclude<RepeatType, 'none'>;
    interval: number;
    endDate?: string | undefined;
    days?: number[];
  };
}
