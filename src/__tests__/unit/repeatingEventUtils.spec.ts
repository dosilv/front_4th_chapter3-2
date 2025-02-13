import { Event, RepeatingEvent } from '../../types';
import { isRepeatingEvent, getNextRepeatingDate } from '../../utils/repeatingEventUtils';

describe('repeatingEventUtils 테스트', () => {
  describe('isRepeatingEvent 테스트', () => {
    it('반복 일정인 경우 true를 반환한다', () => {
      const REPEATING_EVENT: RepeatingEvent = {
        id: '1',
        title: '반복 이벤트',
        date: '2025-02-13',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정입니다',
        location: '',
        category: '업무',
        notificationTime: 10,
        repeat: {
          id: '1',
          type: 'daily',
          interval: 1,
        },
      };

      expect(isRepeatingEvent(REPEATING_EVENT)).toBe(true);
    });

    it('일반 일정인 경우 false를 반환한다', () => {
      const NON_REPEATING_EVENT: Event = {
        id: '1',
        title: '일반 일정',
        date: '2025-02-13',
        startTime: '10:00',
        endTime: '11:00',
        description: '일반 일정입니다',
        location: '',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'none',
          interval: 0,
        },
      };

      expect(isRepeatingEvent(NON_REPEATING_EVENT)).toBe(false);
    });
  });

  describe('getNextRepeatingDate 테스트', () => {
    const BASE_DATE = new Date('2025-02-13T10:00:00');

    describe('daily repeat', () => {
      it('2/13일부터 매일 반복인 경우 2/14일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'daily', 1, 1);
        expect(result).toEqual(new Date('2025-02-14T10:00:00'));
      });

      it('2/13일부터 2일 간격으로 반복인 경우 2/15일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'daily', 2, 1);
        expect(result).toEqual(new Date('2025-02-15T10:00:00'));
      });

      it('2/13일부터 3일 간격으로 반복인 경우 2/16일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'daily', 3, 1);
        expect(result).toEqual(new Date('2025-02-16T10:00:00'));
      });
    });

    describe('weekly repeat', () => {
      it('2/13일부터 매주 반복인 경우 2/20일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'weekly', 1, 1);
        expect(result).toEqual(new Date('2025-02-20T10:00:00'));
      });

      it('2/13일부터 2주 간격으로 반복인 경우 2/27일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'weekly', 2, 1);
        expect(result).toEqual(new Date('2025-02-27T10:00:00'));
      });
    });

    describe('monthly repeat', () => {
      it('2/13일부터 매월 반복인 경우 3/13일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'monthly', 1, 1);
        expect(result).toEqual(new Date('2025-03-13T10:00:00'));
      });

      it('2/13일부터 2개월 간격으로 반복인 경우 4/13일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'monthly', 2, 1);
        expect(result).toEqual(new Date('2025-04-13T10:00:00'));
      });

      it('1/31일부터 매월 반복인 경우 2/28일을 다음 일정 날짜로 반환한다', () => {
        const endOfMonthDate = new Date('2025-01-31T10:00:00');
        const result = getNextRepeatingDate(endOfMonthDate, 'monthly', 1, 1);
        expect(result).toEqual(new Date('2025-02-28T10:00:00'));
      });
    });

    describe('yearly repeat', () => {
      it('2/13일부터 매년 반복인 경우 2026년 2/13일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'yearly', 1, 1);
        expect(result).toEqual(new Date('2026-02-13T10:00:00'));
      });

      it('2/13일부터 2년 간격으로 반복인 경우 2027년 2/13일을 다음 일정 날짜로 반환한다', () => {
        const result = getNextRepeatingDate(BASE_DATE, 'yearly', 2, 1);
        expect(result).toEqual(new Date('2027-02-13T10:00:00'));
      });
    });
  });
});
