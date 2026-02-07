import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { BottomSheet, Button, Paragraph, Text } from "@toss/tds-mobile";
import { Notice } from "../types/notice";

const Container = styled.div`
  margin: 0 20px 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TitleBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const PageText = styled(Text)`
  flex: 1;
  text-align: center;
  opacity: 0.7;
`;

const DontShowRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
`;

const FooterRow = styled.div`
  display: flex;
  width: 100%;
`;

const SubmitButton = styled(Button)`
  flex: 1;
`;

const NOTICE_HIDE_KEY = (id: string) => `notice-hide-${id}`;

// YYYYMMDD -> KST 기준 해당 날짜 00:00:00
const parseYYYYMMDDToKSTStart = (yyyymmdd: string): Date | null => {
  if (!/^\d{8}$/.test(yyyymmdd)) return null;

  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));

  // KST(UTC+9) 00:00을 UTC로 환산 (전날 15:00Z)
  return new Date(Date.UTC(y, m - 1, d, -9, 0, 0));
};

const addDaysUTC = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

// 숨김 만료 시각: endAt 다음날 00:00(KST)
const calcHideUntilByEndAt = (endAt: string): number => {
  const endStart = parseYYYYMMDDToKSTStart(endAt);
  if (!endStart) return Date.now() + 30 * 24 * 60 * 60 * 1000; // 안전 기본값(30일)
  const endExclusive = addDaysUTC(endStart, 1);
  return endExclusive.getTime();
};

// 숨김 여부 확인 (만료됐으면 자동 삭제)
export const isNoticeHiddenNow = (noticeId: string): boolean => {
  try {
    const raw = localStorage.getItem(NOTICE_HIDE_KEY(noticeId));
    if (!raw) return false;

    const until = Number(raw);
    if (!Number.isFinite(until)) {
      localStorage.removeItem(NOTICE_HIDE_KEY(noticeId));
      return false;
    }

    if (Date.now() >= until) {
      localStorage.removeItem(NOTICE_HIDE_KEY(noticeId));
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

type Props = {
  notices: Notice[];
  open: boolean;
  onClose: () => void;
};

export default function NoticePopup({ notices, open, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [dontShowChecked, setDontShowChecked] = useState(false);

  const current = useMemo(() => notices[index], [notices, index]);
  const hasNav = notices.length > 1;

  useEffect(() => {
    if (open) {
      setIndex(0);
      setDontShowChecked(false);
    }
  }, [open, notices.length]);

  useEffect(() => {
    setDontShowChecked(false);
  }, [index]);

  const persistDontShowIfChecked = () => {
    if (!current || !dontShowChecked) return;
    try {
      const hideUntil = calcHideUntilByEndAt(current.endAt);
      localStorage.setItem(NOTICE_HIDE_KEY(current.id), String(hideUntil));
    } catch {
      // ignore
    }
  };

  const close = () => {
    persistDontShowIfChecked();
    onClose();
  };

  const prev = () => {
    persistDontShowIfChecked();
    setIndex((i) => (i <= 0 ? notices.length - 1 : i - 1));
  };

  const next = () => {
    persistDontShowIfChecked();
    setIndex((i) => (i >= notices.length - 1 ? 0 : i + 1));
  };

  if (!open || notices.length === 0 || !current) return null;

  return (
    <BottomSheet
      UNSAFE_disableFocusLock
      open={open}
      onClose={close}
      header={
        <TitleBox>
          {/* ✅ 공지사항 제목 */}
          <BottomSheet.Header>{current.title}</BottomSheet.Header>
        </TitleBox>
      }
    >
      <Container>
        {/* ✅ 공지사항 내용 */}
        <ContentBox>
          <Paragraph.Text>{current.content}</Paragraph.Text>
        </ContentBox>

        {/* ✅ 이전 + 페이지표시 + 다음 (1개일 경우 생략) */}
        {hasNav ? (
          <NavRow>
            <Button size="small" onClick={prev} color="light">
              이전
            </Button>
            <PageText style={{ fontSize: 12 }}>
              {index + 1} / {notices.length}
            </PageText>
            <Button size="small" onClick={next} color="light">
              다음
            </Button>
          </NavRow>
        ) : null}

        {/* ✅ 다시 보지 않기 체크 */}
        <DontShowRow>
          <input type="checkbox" checked={dontShowChecked} onChange={(e) => setDontShowChecked(e.target.checked)} />
          <Text>다시 보지 않기</Text>
        </DontShowRow>

        {/* ✅ 확인 버튼 */}
        <FooterRow>
          <SubmitButton size="medium" onClick={close}>
            확인
          </SubmitButton>
        </FooterRow>
      </Container>
    </BottomSheet>
  );
}
