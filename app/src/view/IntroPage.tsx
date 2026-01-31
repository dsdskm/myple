import { Asset, Post } from "@toss/tds-mobile";
import { AD_ID, PUBLIC_VIDEOS, ROUTES } from "../common/constants";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import SlideImages from "./common/SlideImages";
import { useApp } from "../context/AppContext";
import { useEffect } from "react";
import { loadId } from "../common/utils";
import { getUser, sendLog } from "../service/api";
import { ACTION_TYPE_SET_ACCOUNT } from "../types/account";
import { GoogleAdMob } from "@apps-in-toss/web-framework";

/* ---------- animation ---------- */

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

/* ---------- styled components ---------- */

const Root = styled.div``;

const VideoWrapper = styled.div``;

const AbsoluteCenter = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  object-fit: contain;
`;

const StartText = styled.div`
  align-self: center;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 40px;

  color: #000000;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: 4px;

  cursor: pointer;
  animation: ${blink} 1.5s ease-in-out infinite;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
`;

/* ---------- component ---------- */
const TAG = "IntroPage";
const IntroPage = () => {
  const navigate = useNavigate();
  const { setAccount } = useApp();
  useEffect(() => {
    const loadData = async () => {
      const id = loadId();
      if (id) {
        const account = await getUser(id);
        if (account) {
          setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: account });
          if (GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
            showAd();
          } else {
            navigate(ROUTES.MAP, { replace: true });
          }
        }
      }
    };

    loadData();
  }, []);

  const showAd = () => {
    const options = {
      adGroupId: AD_ID,
    };
    GoogleAdMob.loadAppsInTossAdMob({
      options: options,
      onEvent: (event) => {
        console.log(`ad load event`, event);
        sendLog(TAG, `ad load event ${JSON.stringify(event)}`);
        switch (event.type) {
          case "loaded":
            console.log(`ad load success`);
            GoogleAdMob.showAppsInTossAdMob({
              options: options,
              onEvent: (event) => {
                console.log(`ad show event`, event);
                switch (event.type) {
                  case "show":
                    break;
                  case "requested":
                    break;
                  case "impression":
                    break;
                  case "clicked":
                    break;
                  case "userEarnedReward": // 보상형 광고만 사용 가능
                    break;
                  case "dismissed":
                    navigate(ROUTES.MAP, { replace: true });
                    break;
                  case "failedToShow":
                    navigate(ROUTES.MAP, { replace: true });
                    break;
                  default:
                    break;
                }
              },
              onError: (error) => {
                console.log(`ad show error`, error);
                sendLog(TAG, `ad show error ${JSON.stringify(error)}`);
                navigate(ROUTES.MAP, { replace: true });
              },
            });
            break;
          default:
            break;
        }
      },
      onError: (error) => {
        console.log(`ad load error`, error);
      },
    });
  };

  const onStartClick = () => {
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <>
      <Root>
        <Asset.Video
          as="video"
          src={PUBLIC_VIDEOS.INTRO}
          autoPlay={true}
          loop={true}
          muted={true}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: -1, // 배경처럼 뒤로
          }}
        />

        <VideoWrapper>
          <AbsoluteCenter>
            <SlideImages />
            <StartText onClick={onStartClick}>START</StartText>
          </AbsoluteCenter>

          <Post.H1>마이플 - 나만의 장소</Post.H1>
          <Post.Paragraph>나만 알고 싶은 장소를 기록해보세요.</Post.Paragraph>
        </VideoWrapper>
      </Root>
    </>
  );
};

export default IntroPage;
