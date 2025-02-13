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

const REPEAT_ID = randomUUID();

let REPEATING_INIT_EVENTS: Event[] = [
  {
    id: '1',
    title: '격일 일정',
    date: '2025-02-10',
    startTime: '11:00',
    endTime: '12:00',
    description: '격일 일정',
    location: '회의실',
    category: '업무 회의',
    repeat: { type: 'daily', interval: 2, id: REPEAT_ID },
    notificationTime: 5,
  },
  {
    id: '2',
    title: '격일 일정',
    date: '2025-02-12',
    startTime: '11:00',
    endTime: '12:00',
    description: '격일 일정',
    location: '회의실',
    category: '업무 회의',
    repeat: { type: 'daily', interval: 2, id: REPEAT_ID },
    notificationTime: 5,
  },
  {
    id: '3',
    title: '격일 일정',
    date: '2025-02-14',
    startTime: '11:00',
    endTime: '12:00',
    description: '격일 일정',
    location: '회의실',
    category: '업무 회의',
    repeat: { type: 'daily', interval: 2, id: REPEAT_ID },
    notificationTime: 5,
  },
  {
    id: '4',
    title: '격일 일정',
    date: '2025-02-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '격일 일정',
    location: '회의실',
    category: '업무 회의',
    repeat: { type: 'daily', interval: 2, id: REPEAT_ID },
    notificationTime: 5,
  },
];

export const setupMockHandlerRepeatCreation = () => {
  const mockEvents: Event[] = [];

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

      const repeatId = randomUUID();

      const createdEvents = newEventsList.map((event: Event) => {
        const isRepeatEvent = event.repeat.type !== 'none';

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

export const setupMockHandlerRepeatUpdating = () => {
  let mockEvents: Event[] = [...REPEATING_INIT_EVENTS];

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
    }),
    http.put('/api/events-list', async ({ request }) => {
      const { events } = (await request.json()) as { events: Event[] };

      mockEvents = mockEvents.map((event) => {
        const matchingEvent = events.find((e) => e.id === event.id);
        return matchingEvent ? { ...event, ...matchingEvent } : event;
      });

      return HttpResponse.json(mockEvents);
    })
  );
};

export const setupMockHandlerRepeatDeletion = () => {
  let mockEvents: Event[] = [...REPEATING_INIT_EVENTS];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }),
    http.delete('/api/events-list', async ({ request }) => {
      const { eventIds } = (await request.json()) as { eventIds: string[] };

      mockEvents = mockEvents.filter((event) => {
        return !eventIds.includes(event.id);
      });

      return HttpResponse.json(mockEvents);
    })
  );
};
