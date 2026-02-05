import { Asset, Post } from "@toss/tds-mobile";
import { AD_ID, PUBLIC_VIDEOS, ROUTES } from "../common/constants";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import SlideImages from "./common/SlideImages";
import { useApp } from "../context/AppContext";
import { loadId } from "../common/utils";
import { getUser, sendLog } from "../service/api";
import { ACTION_TYPE_SET_ACCOUNT } from "../types/account";
import { GoogleAdMob } from "@apps-in-toss/web-framework";
import { useState } from "react";
import Loading from "./common/Loading";

/* ---------- animation ---------- */
const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

/* ---------- styled components ---------- */

const Root = styled.div`
  min-height: 100vh;
  position: relative;
`;

const VideoWrapper = styled.div`
  min-height: 100vh;
  position: relative;
`;

/** ✅ 중앙 정렬만 담당 (크기 지정 제거) */
const AbsoluteCenter = styled.div`
  position: absolute;
  top: 46%; /* 살짝 아래로 */
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  justify-items: center;
  row-gap: 16px;
`;

/** ✅ 슬라이드 크기를 확실히 제한하는 박스 */
const SlideBox = styled.div`
  width: 250px;        /* 최대 가로폭 제한 */
  height:400px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);

  /* 내부 미디어가 박스를 넘치지 않도록 */
  & img, & video, & canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;

const AdTextFixed = styled.div`
  position: fixed;
  left: 50%;
  bottom: max(16px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: 100%;
  max-width: 960px;
  margin-bottom:20px;
  text-align: center;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  z-index: 10;
  pointer-events: none;  
`;

const StartText = styled.div`
  text-align: center;
  margin-bottom: 8px;
  color: #1976d2;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 3px;
  margin-top:10px;
  cursor: pointer;
  animation: ${blink} 1.5s ease-in-out infinite;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.4);

  @media (max-width: 768px) {
    font-size: 24px;
    letter-spacing: 2px;
  }
`;

/* ---------- component ---------- */
const TAG = "IntroPage";
const IntroPage = () => {

  const navigate = useNavigate();
  const { setAccount } = useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const showAd = () => {
    const options = { adGroupId: AD_ID };
    GoogleAdMob.loadAppsInTossAdMob({
      options,
      onEvent: (event) => {
        console.log(`ad load event`, event);
        sendLog(TAG, `ad load event ${JSON.stringify(event)}`);
        switch (event.type) {
          case "loaded":
            GoogleAdMob.showAppsInTossAdMob({
              options,
              onEvent: (event) => {
                console.log(`ad show event`, event);
                switch (event.type) {
                  case "dismissed":
                  case "failedToShow":
                    goNext();
                    break;
                  default:
                    break;
                }
              },
              onError: (error) => {
                console.log(`ad show error`, error);
                sendLog(TAG, `ad show error ${JSON.stringify(error)}`);
                setIsLoading(false)
                goNext();
              },
            });
            break;
          default:
            setIsLoading(false)
            break;
        }
      },
      onError: (error) => {
        console.log(`ad load error`, error);
        setIsLoading(false)
      },
    });
  };

  const goNext = async () => {
    const id = loadId();
    if (id) {
      const account = await getUser(id);
      if (account) {
        setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: account });
        navigate(ROUTES.MAP, { replace: true });
        return;
      }
    }
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const onStartClick = async () => {
    setIsLoading(true)
    if (GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
      showAd();
    } else {
      goNext();
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Root>
        {/* 필요 시 배경 비디오 */}
        {/* 
        <Asset.Video
          as="video"
          src={PUBLIC_VIDEOS.INTRO}
          autoPlay
          loop
          muted
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: -1,
          }}
        />
        */}

        <VideoWrapper>
          {/* 중앙: 슬라이드/영상 박스를 작게 제한 */}
          <AbsoluteCenter>
            <SlideBox>
              <SlideImages />
              {/*
                SlideImages가 내부에서 자체 크기 스타일을 강제한다면
                해당 컴포넌트의 최상위 래퍼에
                width: 100%; height: 100%; object-fit: contain; 
                을 적용하세요.
              */}
            </SlideBox>

            <StartText onClick={onStartClick}>START</StartText>
          </AbsoluteCenter>

          {/* 하단 고정 문구 */}
          <AdTextFixed>*앱 진입 후 광고가 표시됩니다.</AdTextFixed>

          {/* 본문 텍스트 (상단/하단과 겹치면 여백 조정하세요) */}
          <Post.H1 color="#1976d2">마이플 - 나만의 장소</Post.H1>
          <Post.Paragraph>나만 알고 싶은 장소를 기록해보세요.</Post.Paragraph>
        </VideoWrapper>
      </Root>
    </>
  );
};

export default IntroPage;