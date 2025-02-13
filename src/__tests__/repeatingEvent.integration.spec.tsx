import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerRepeatCreation,
  setupMockHandlerRepeatDeletion,
  setupMockHandlerRepeatUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const saveRepeatingSchedule = async (user: UserEvent, form: Omit<Event, 'id'>) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    notificationTime,
    repeat,
  } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('알림 설정'), notificationTime.toString());
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.click(screen.getByLabelText('반복 일정'));
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  for (const day of repeat.days ?? []) {
    await user.selectOptions(screen.getByLabelText('반복 요일'), DAY_LABELS[day]);
  }
  await user.clear(screen.getByLabelText('반복 간격'));
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate ?? '');
  await user.click(screen.getByTestId('event-submit-button'));
};

const clickNextButtonTwelveTimes = async (user: UserEvent) => {
  const nextButton = screen.getByLabelText('Next');

  for (let i = 0; i < 12; i++) {
    await user.click(nextButton);
  }
};

beforeEach(() => {
  vi.setSystemTime('2025-02-10');
  setupMockHandlerRepeatCreation();
});

describe('반복 일정 생성', () => {
  it('반복 일정을 체크하면 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByLabelText('반복 일정'));

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  describe('입력한 반복 유형, 반복 주기, 반복 종료일에 따라 반복 일정이 저장된다.', () => {
    it('2월 10일부터 반복 유형 매일, 반복 유형 2일, 반복 종료일 2월 15일로 저장한 경우 2/10, 2/12, 2/14일 일정이 저장된다.', async () => {
      const { user } = setup(<App />);

      await saveRepeatingSchedule(user, {
        title: '격일 일정',
        date: '2025-02-10',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'daily',
          interval: 2,
          endDate: '2025-02-15',
        },
      });

      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('2025-02-10')).toBeInTheDocument();
      expect(eventList.getByText('2025-02-12')).toBeInTheDocument();
      expect(eventList.getByText('2025-02-14')).toBeInTheDocument();
    });

    it('2월 10일부터 반복 유형 매주, 반복 주기 1주일, 반복 종료일 2월 28일로 저장한 경우 2/10, 2/17, 2/24일 일정이 저장된다.', async () => {
      const { user } = setup(<App />);

      await saveRepeatingSchedule(user, {
        title: '매주 일정',
        date: '2025-02-10',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-02-28',
        },
      });

      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('2025-02-10')).toBeInTheDocument();
      expect(eventList.getByText('2025-02-17')).toBeInTheDocument();
      expect(eventList.getByText('2025-02-24')).toBeInTheDocument();
    });

    it('2월 10일부터 반복 유형 매월, 반복 주기 1개월, 반복 종료일 6월 30일로 저장한 경우 2/10, 3/10, 4/10, 5/10, 6/10일 일정이 저장된다.', async () => {
      const { user } = setup(<App />);

      await saveRepeatingSchedule(user, {
        title: '매월 일정',
        date: '2025-02-10',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-06-30',
        },
      });

      const eventList = within(screen.getByTestId('event-list'));
      const nextButton = screen.getByLabelText('Next');

      expect(eventList.getByText('2025-02-10')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-03-10')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-04-10')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-05-10')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-06-10')).toBeInTheDocument();
    });

    it('2월 10일부터 반복 유형 매년, 반복 주기 1년, 반복 종료일 2027년 12월 31일로 저장한 경우 2025/2/10, 2026/2/10, 2027/2/10일 일정이 저장된다.', async () => {
      const { user } = setup(<App />);

      await saveRepeatingSchedule(user, {
        title: '매년 일정',
        date: '2025-02-10',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-12-31',
        },
      });

      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('2025-02-10')).toBeInTheDocument();

      await clickNextButtonTwelveTimes(user);

      expect(eventList.getByText('2026-02-10')).toBeInTheDocument();

      await clickNextButtonTwelveTimes(user);

      expect(eventList.getByText('2027-02-10')).toBeInTheDocument();
    });
  });

  describe('말일, 윤년 자동 변환 테스트', () => {
    it('1월 31일부터 6월 30일까지 매월 반복 일정을 저장한 경우 1/31, 2/28, 3/31, 4/30, 5/31, 6/30일 일정이 저장된다.', async () => {
      vi.setSystemTime('2025-01-31');

      const { user } = setup(<App />);

      await saveRepeatingSchedule(user, {
        title: '매월 말일 일정',
        date: '2025-01-31',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-06-30',
        },
      });

      const eventList = within(screen.getByTestId('event-list'));

      const nextButton = screen.getByLabelText('Next');
      expect(eventList.getByText('2025-01-31')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-02-28')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-03-31')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-04-30')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-05-31')).toBeInTheDocument();

      await userEvent.click(nextButton);
      expect(eventList.getByText('2025-06-30')).toBeInTheDocument();
    });

    it('2024년 2월 29일부터 2028년 2월 29일까지 매년 반복 일정을 저장한 경우 2024/2/29, 2025/2/28, 2026/2/28, 2027/2/28, 2028/2/29일 일정이 저장된다.', async () => {
      vi.setSystemTime('2024-02-29');

      const { user } = setup(<App />);

      await saveRepeatingSchedule(user, {
        title: '매년 2월 말일 일정',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-02-29',
        },
      });

      const eventList = within(screen.getByTestId('event-list'));

      expect(eventList.getByText('2024-02-29')).toBeInTheDocument();

      await clickNextButtonTwelveTimes(user);
      expect(eventList.getByText('2025-02-28')).toBeInTheDocument();

      await clickNextButtonTwelveTimes(user);
      expect(eventList.getByText('2026-02-28')).toBeInTheDocument();

      await clickNextButtonTwelveTimes(user);
      expect(eventList.getByText('2027-02-28')).toBeInTheDocument();

      await clickNextButtonTwelveTimes(user);
      expect(eventList.getByText('2028-02-29')).toBeInTheDocument();
    });
    // 오래 걸리는 테스트이므로 timeout 시간 연장
  }, 15000);

  it('캘린더뷰에서 반복일정이 단일일정과 구분된다.', async () => {
    setupMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveRepeatingSchedule(user, {
      title: '격일 일정',
      date: '2025-02-10',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2025-02-15',
      },
    });

    const monthView = within(screen.getByTestId('month-view'));
    const alternativeDayEvent = monthView.getAllByText('격일 일정')[0];
    expect(alternativeDayEvent).toBeInTheDocument();

    const upperDiv = alternativeDayEvent.closest('td');
    const repeatIcon = within(upperDiv!).getByTestId('repeat-icon');

    expect(repeatIcon).toBeInTheDocument();
  });
});

describe('반복 일정 수정/삭제', () => {
  it('반복 일정 개별 수정 시 단일 일정으로 변경된다.', async () => {
    setupMockHandlerRepeatUpdating();

    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    const editModeBtn = await within(eventList).findAllByRole('button', { name: 'Edit event' });
    await userEvent.click(editModeBtn[0]);

    const popover = within(screen.getAllByTestId('edit-popover')[0]);
    const singleEditBtn = popover.getByText('개별 일정 수정');
    await userEvent.click(singleEditBtn);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '일정 이름을 바꾸자');

    const submitBtn = screen.getByTestId('event-submit-button');
    await userEvent.click(submitBtn);

    const editedEvent = within(screen.getByTestId('month-view')).getByText('일정 이름을 바꾸자');
    const editedEventBox = editedEvent.closest('td');
    expect(editedEventBox).toBeInTheDocument();
    expect(within(editedEventBox!).queryByTestId('repeat-icon')).not.toBeInTheDocument();

    const originalEvent = within(screen.getByTestId('month-view')).getAllByText('격일 일정')[0];
    const originalEventBox = originalEvent.closest('td');
    expect(originalEventBox).toBeInTheDocument();
    expect(within(originalEventBox!).queryByTestId('repeat-icon')).toBeInTheDocument();
  });

  it('반복 일정 개별 삭제 시 해당 일정만 삭제된다.', async () => {
    setupMockHandlerRepeatDeletion();

    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    const deleteModeBtn = await within(eventList).findAllByRole('button', { name: 'Delete event' });
    await user.click(deleteModeBtn[0]);

    const popover = within(screen.getAllByTestId('delete-popover')[0]);
    const singleDeleteBtn = popover.getByText('개별 일정 삭제');
    await userEvent.click(singleDeleteBtn);

    const deleteBtn = screen.getByTestId('event-submit-button');
    await user.click(deleteBtn);

    expect(screen.queryByText('2025-02-10')).not.toBeInTheDocument();
    expect(screen.queryByText('2025-02-12')).toBeInTheDocument();
  });

  it('반복 일정 일괄 수정 시 모든 일정이 변경된다.', async () => {
    setupMockHandlerRepeatUpdating();

    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    const editModeBtn = await within(eventList).findAllByRole('button', { name: 'Edit event' });
    await userEvent.click(editModeBtn[0]);

    const popover = within(screen.getAllByTestId('edit-popover')[0]);
    const bulkEditBtn = popover.getByText('반복 일정 수정');
    await userEvent.click(bulkEditBtn);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 이름');

    const submitBtn = screen.getByTestId('event-submit-button');
    await userEvent.click(submitBtn);

    const editedEvents = await within(screen.getByTestId('month-view')).findAllByText(
      '수정된 이름'
    );
    expect(editedEvents.length).toBeGreaterThan(1);
  });

  it('반복 일정 일괄 삭제 시 모든 일정이 삭제된다.', async () => {
    setupMockHandlerRepeatDeletion();

    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    const deleteModeBtn = await within(eventList).findAllByRole('button', { name: 'Delete event' });
    await user.click(deleteModeBtn[0]);

    const popover = within(screen.getAllByTestId('delete-popover')[0]);
    const bulkDeleteBtn = popover.getByText('반복 일정 삭제');
    await userEvent.click(bulkDeleteBtn);

    const deleteBtn = screen.getByTestId('event-submit-button');
    await user.click(deleteBtn);

    expect(screen.queryByText('2025-02-10')).not.toBeInTheDocument();
    expect(screen.queryByText('2025-02-12')).not.toBeInTheDocument();
  });
});

describe('주간 일정 요일 지정 테스트', () => {
  beforeEach(() => {
    setupMockHandlerRepeatCreation();
  });

  it('반복 일정을 매주로 선택한 경우 요일 지정 옵션이 표시된다.', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByLabelText('반복 일정'));
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');

    expect(screen.getByLabelText('반복 요일')).toBeInTheDocument();
  });

  it('2/1일부터 2/28일까지 매주 월요일 반복 일정을 저장한 경우 2/3, 2/10, 2/17, 2/24일 일정이 저장된다.', async () => {
    const { user } = setup(<App />);

    await saveRepeatingSchedule(user, {
      title: '월요일 반복 일정',
      date: '2025-02-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-02-28',
        days: [1],
      },
    });

    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('2025-02-03')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-10')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-17')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-24')).toBeInTheDocument();
  });

  it('2/1일부터 2/28일까지 매주 화, 목 반복 일정을 저장한 경우 2/4, 2/6, 2/11, 2/13, 2/18, 2/20, 2/25, 2/27일 일정이 저장된다.', async () => {
    const { user } = setup(<App />);

    await saveRepeatingSchedule(user, {
      title: '화목 반복 일정',
      date: '2025-02-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-02-28',
        days: [2, 4],
      },
    });

    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('2025-02-04')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-06')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-11')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-13')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-18')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-20')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-25')).toBeInTheDocument();
    expect(eventList.getByText('2025-02-27')).toBeInTheDocument();
  });
});
