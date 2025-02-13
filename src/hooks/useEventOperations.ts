import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm, RepeatingEvent } from '../types';
import { getClosestStartDate, getNextRepeatingDate } from '../utils/repeatingEventUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      toast({
        title: editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      toast({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const saveRepeatingEvent = async (eventData: RepeatingEvent) => {
    try {
      let response;

      if (editing) {
        const { events } = await (await fetch('/api/events')).json();
        const repeatingEvents = events.filter(
          (event: Event) => event.repeat.id === eventData.repeat.id
        );

        const updatedRepeatingEvents = repeatingEvents.map((event: Event) => {
          return { ...eventData, id: event.id, date: event.date };
        });

        response = await fetch('/api/events-list', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: updatedRepeatingEvents }),
        });
      } else {
        const repeatingEvents = [];

        const targetDays =
          eventData.repeat.type === 'weekly' && eventData.repeat.days?.length
            ? eventData.repeat.days
            : null;

        const startDates = targetDays?.map((day) =>
          getClosestStartDate(new Date(eventData.date), day)
        ) ?? [new Date(eventData.date)];

        for (const startDate of startDates) {
          let i = 0;
          for (
            let date = startDate;
            date <= new Date(eventData.repeat.endDate ?? '2025-06-30');
            date = getNextRepeatingDate(
              new Date(startDate),
              eventData.repeat.type,
              eventData.repeat.interval,
              i
            )
          ) {
            repeatingEvents.push({
              ...eventData,
              date: date.toISOString().split('T')[0],
            });
            i++;
          }
        }

        response = await fetch('/api/events-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: repeatingEvents }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save repeating event');
      }

      await fetchEvents();
      onSave?.();
    } catch (error) {
      console.error('Error saving repeating event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
      });
    }
  };

  const deleteRepeatingEvent = async (repeatId: string) => {
    try {
      const { events } = await (await fetch('/api/events')).json();
      const repeatingEventIds = events
        .filter((event: Event) => event.repeat.id === repeatId)
        .map((event: Event) => event.id);

      const response = await fetch('/api/events-list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds: repeatingEventIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete repeating event');
      }

      await fetchEvents();
      toast({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  async function init() {
    await fetchEvents();
    toast({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent, saveRepeatingEvent, deleteRepeatingEvent };
};
