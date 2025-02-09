import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

describe('반복 일정 생성', () => {
  it('반복 일정을 체크하면 반복 유형을 선택할 수 있다.', async () => {});

  it('입력한 반복 유형, 반복 주기, 반복 종료일에 따라 반복 일정이 저장된다.', async () => {
    it('2월 10일부터 반복 유형 매일, 반복 유형 2일, 반복 종료일 2월 15일로 저장한 경우 2/10, 2/12, 2/14일 일정이 저장된다.', async () => {});

    it('2월 10일부터 반복 유형 매주, 반복 주기 1주일, 반복 종료일 2월 28일로 저장한 경우 2/10, 2/17, 2/24일 일정이 저장된다.', async () => {});

    it('2월 10일부터 반복 유형 매월, 반복 주기 1개월, 반복 종료일 6월 30일로 저장한 경우 2/10, 3/10, 4/10, 5/10, 6/10일 일정이 저장된다.', async () => {});

    it('2월 10일부터 반복 유형 매년, 반복 주기 1년, 반복 종료일 2027년 12월 31일로 저장한 경우 2025/2/10, 2026/2/10, 2027/2/10일 일정이 저장된다.', async () => {});
  });

  it('말일, 윤년 자동 변환 테스트', async () => {
    it('1월 31일부터 6월 30일까지 매월 반복 일정을 저장한 경우 1/31, 2/28, 3/31, 4/30, 5/31, 6/30일 일정이 저장된다.', async () => {});

    it('2024년 2월 29일부터 2028년 2월 29일까지 매년 반복 일정을 저장한 경우 2024/2/29, 2025/2/28, 2026/2/28, 2027/2/28, 2028/2/29일 일정이 저장된다.', async () => {});
  });

  it('캘린더뷰에서 반복일정이 단일일정과 구분된다.', async () => {});
});

describe('반복 일정 수정/삭제', () => {
  it('반복 일정 수정 시 단일 일정으로 변경된다.', async () => {});

  it('반복 일정 삭제 시 해당 일정만 삭제된다.', async () => {});
});
