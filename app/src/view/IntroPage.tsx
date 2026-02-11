import { Post } from "@toss/tds-mobile";
import { AD_ID, ROUTES, TEXT } from "../common/constants";
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
import { theme } from "../styles/theme";

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const Root = styled.div`
  min-height: 100vh;
  position: relative;
`;

const AbsoluteCenter = styled.div`
  position: absolute;
  top: 46%; /* 살짝 아래로 */
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  justify-items: center;
  row-gap: 16px;
  margin-top: 20px;
`;

const SlideBox = styled.div`
  width: 250px; /* 최대 가로폭 제한 */
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);

  /* 내부 미디어가 박스를 넘치지 않도록 */
  & img,
  & video,
  & canvas {
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
  margin-bottom: 20px;
  text-align: center;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  z-index: 10;
  pointer-events: none;
`;

const StartText = styled.div`
  text-align: center;
  margin-bottom: 8px;
  color: ${theme.colors.primary};
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 3px;
  margin-top: 50px;
  cursor: pointer;
  animation: ${blink} 1.5s ease-in-out infinite;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.4);

  @media (max-width: 768px) {
    font-size: 24px;
    letter-spacing: 2px;
  }
`;

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
                setIsLoading(false);
                goNext();
              },
            });
            break;
          default:
            setIsLoading(false);
            break;
        }
      },
      onError: (error) => {
        console.log(`ad load error`, error);
        setIsLoading(false);
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
    setIsLoading(true);
    if (GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
      showAd();
    } else {
      goNext();
    }
  };

  if (isLoading) {
    return <Loading label={TEXT.MSG_MOVE_TO_LOGIN} />;
  }

  return (
    <>
      <Root>
        <AbsoluteCenter>
          <SlideBox>
            <SlideImages />
          </SlideBox>

          <StartText onClick={onStartClick}>{TEXT.START}</StartText>
        </AbsoluteCenter>

        <AdTextFixed>{TEXT.MSG_AD_GUIDE}</AdTextFixed>
        <Post.H1 color={theme.colors.primary}>{TEXT.APP_NAME}</Post.H1>
        <Post.Paragraph>{TEXT.MSG_APP_DESCRIPTION}</Post.Paragraph>
      </Root>
    </>
  );
};

export default IntroPage;
