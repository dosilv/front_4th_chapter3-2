import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const { events: newEventsList } = (await request.json()) as { events: Event[] };
      console.log('newEventsList');
      console.log(newEventsList);
      const createdEvents = newEventsList.map((event: Event) => {
        const isRepeatEvent = event.repeat.type !== 'none';
        const repeatId = randomUUID();

        return {
          ...event,
          id: randomUUID(),
          repeat: {
            ...event.repeat,
            id: isRepeatEvent ? repeatId : undefined,
          },
        };
      });
      mockEvents.push(...createdEvents);
      return HttpResponse.json(createdEvents, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '격일 일정',
      date: '2025-02-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '격일 일정',
      location: '회의실',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 5,
    },
    {
      id: '4',
      title: '격일 일정',
      date: '2025-02-12',
      startTime: '11:00',
      endTime: '12:00',
      description: '격일 일정',
      location: '회의실',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 5,
    },
    {
      id: '5',
      title: '격일 일정',
      date: '2025-02-14',
      startTime: '11:00',
      endTime: '12:00',
      description: '격일 일정',
      location: '회의실',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = {
        ...mockEvents[index],
        ...updatedEvent,
        repeat: { type: 'none', interval: 0, id: undefined },
      };
      return HttpResponse.json(mockEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '격일 일정',
      date: '2025-02-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '격일 일정',
      location: '회의실',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '격일 일정',
      date: '2025-02-12',
      startTime: '11:00',
      endTime: '12:00',
      description: '격일 일정',
      location: '회의실',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 5,
    },
    {
      id: '4',
      title: '격일 일정',
      date: '2025-02-14',
      startTime: '11:00',
      endTime: '12:00',
      description: '격일 일정',
      location: '회의실',
      category: '업무 회의',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
