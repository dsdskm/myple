import { Button, ConfirmDialog, Paragraph, Toast } from "@toss/tds-mobile";
import styled from "styled-components";
import { AD_ID, ALT, PUBLIC_IMAGES, ROUTES, TEXT } from "../common/constants";
import { useEffect, useState } from "react";
import Loading from "./common/Loading";
import { useNavigate } from "react-router-dom";
import { appLogin, GoogleAdMob } from "@apps-in-toss/web-framework";
import { requestUserInfo } from "../service/api";
import { Account, ACTION_TYPE_SET_ACCOUNT, initialAccountState } from "../types/account";
import { useApp } from "../context/AppContext";
import { ToastInfo } from "../types/toast";
import { closeView, graniteEvent } from '@apps-in-toss/web-framework'

const Wrapper = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 300px;
  height: 300px;
`;

const Creator = styled.div`
  margin-bottom: 20px;
  position: absolute;
  bottom: 0;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAccount } = useApp();
  const [toastInfo, setToastInfo] = useState<ToastInfo>({
    show: false,
    message: "",
  });
  const [exitDialogOpen, setExitDialogOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscription = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        setExitDialogOpen(true)
      },
      onError: (error) => {
        alert(TEXT.MSG_ERROR);
        setExitDialogOpen(false)
      },
    });

    return unsubscription;
  }, []);

  const showAd = () => {
    const options = {
      adGroupId: AD_ID,
    };
    GoogleAdMob.loadAppsInTossAdMob({
      options: options,
      onEvent: (event) => {
        console.log(`ad load event`, event);
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

                toastInfo.message = TEXT.MSG_LOGIN_SUCCESS;
                toastInfo.show = true;
                setToastInfo({ ...toastInfo });
                setIsLoading(false);
              },
              onError: (error) => {
                console.log(`ad show error`, error);
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

  const onLoginClick = async () => {
    setIsLoading(true);
    try {
      const { authorizationCode, referrer } = await appLogin();
      console.log(`authorizationCode ${authorizationCode}, referrer ${referrer}`)
      const userInfo: Account | null = await requestUserInfo(authorizationCode, referrer);
      console.log(`userInfo ${userInfo}`)
      if (userInfo) {
        setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: userInfo });
        navigate(ROUTES.MAP, { replace: true });
        toastInfo.message = TEXT.MSG_LOGIN_SUCCESS;
        toastInfo.show = true;
        setToastInfo({ ...toastInfo });
        // 이슈
        // if (GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
        //   showAd();
        // } else {
        //   navigate(ROUTES.MAP, { replace: true });
        //   toastInfo.message = TEXT.MSG_LOGIN_SUCCESS;
        //   toastInfo.show = true;
        //   setToastInfo({ ...toastInfo });
        // }
      } else {
        setAccount({
          type: ACTION_TYPE_SET_ACCOUNT,
          payload: initialAccountState,
        });
        toastInfo.message = TEXT.MSG_LOGIN_FAILED;
        toastInfo.show = true;
        setToastInfo({ ...toastInfo });
        setIsLoading(false);
      }
    } catch (e) {
      console.log(`login error`, e);
      toastInfo.show = true;
      toastInfo.message = TEXT.MSG_LOGIN_FAILED;
      setToastInfo({ ...toastInfo });
      setIsLoading(false);
    }
  };

  const exitDialog = () => {
    const onExitClick = () => {
      closeView();
      setExitDialogOpen(false);
    }
    return (
      <ConfirmDialog
        open={exitDialogOpen}
        title={<ConfirmDialog.Title>{TEXT.MSG_BACK_KEY_EVENT}</ConfirmDialog.Title>}
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setExitDialogOpen(false)}>
            {TEXT.NO}
          </ConfirmDialog.CancelButton>
        }
        confirmButton={<ConfirmDialog.ConfirmButton onClick={onExitClick}>{TEXT.YES}</ConfirmDialog.ConfirmButton>}
        onClose={() => setExitDialogOpen(false)}
      />
    );
  };


  if (isLoading) {
    return <Loading />;
  }

  return (
    <Wrapper>
      <LogoImage alt={ALT.LOGO} src={PUBLIC_IMAGES.LOGO} />
      <Paragraph.Text style={{ marginTop: 15, marginBottom: 30 }}>{TEXT.LOOG_TITLE}</Paragraph.Text>
      <Button onClick={onLoginClick}>{TEXT.LOGIN}</Button>
      <Toast
        position="bottom"
        open={toastInfo.show}
        text={toastInfo.message}
        duration={2000}
        onClose={() => {
          toastInfo.show = false;
          setToastInfo({ ...toastInfo });
        }}
      />
      <Creator>{TEXT.CREATOR}</Creator>
      {exitDialog()}
    </Wrapper>
  );
};

export default LoginPage;
