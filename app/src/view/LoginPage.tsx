import { Button, ConfirmDialog, Paragraph, Toast } from "@toss/tds-mobile";
import styled from "styled-components";
import { ALT, PUBLIC_IMAGES, ROUTES, TEXT } from "../common/constants";
import { useEffect, useState } from "react";
import Loading from "./common/Loading";
import { useNavigate } from "react-router-dom";
import { appLogin } from "@apps-in-toss/web-framework";
import { requestUserInfo, sendLog } from "../service/api";
import { Account, ACTION_TYPE_SET_ACCOUNT, initialAccountState } from "../types/account";
import { useApp } from "../context/AppContext";
import { ToastInfo } from "../types/toast";
import { closeView, graniteEvent } from "@apps-in-toss/web-framework";
import { saveId } from "../common/utils";

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


const CreatorTextFixed = styled.div`
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

const Creator = styled.div`
  margin-bottom: 20px;
  position: absolute;
  bottom: 0;
`;
const TAG = "LoginPage";
const LoginPage = () => {
  const navigate = useNavigate();
  const { setAccount } = useApp();
  const [toastInfo, setToastInfo] = useState<ToastInfo>({
    show: false,
    message: "",
  });
  const [exitDialogOpen, setExitDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscription = graniteEvent.addEventListener("backEvent", {
      onEvent: () => {
        setExitDialogOpen(true);
      },
      onError: (error) => {
        alert(TEXT.MSG_ERROR);
        setExitDialogOpen(false);
      },
    });

    return unsubscription;
  }, []);

  const onLoginClick = async () => {
    setIsLoading(true);
    try {
      const { authorizationCode, referrer } = await appLogin();
      sendLog(TAG, `authorizationCode ${authorizationCode}, referrer ${referrer}`);
      const userInfo: Account | null = await requestUserInfo(authorizationCode, referrer);
      sendLog(TAG, `userInfo ${JSON.stringify(userInfo)}`);
      if (userInfo) {
        saveId(userInfo.id);
        setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: userInfo });
        navigate(ROUTES.MAP, { replace: true });
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
    };
    return (
      <ConfirmDialog
        open={exitDialogOpen}
        title={<ConfirmDialog.Title>{TEXT.MSG_BACK_KEY_EVENT}</ConfirmDialog.Title>}
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setExitDialogOpen(false)}>{TEXT.NO}</ConfirmDialog.CancelButton>
        }
        confirmButton={<ConfirmDialog.ConfirmButton onClick={onExitClick}>{TEXT.YES}</ConfirmDialog.ConfirmButton>}
        onClose={() => setExitDialogOpen(false)}
      />
    );
  };

  if (isLoading) {
    return <Loading label={TEXT.MSG_LOGIN} />;
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
      <CreatorTextFixed>{TEXT.CREATOR}</CreatorTextFixed>
      {exitDialog()}
    </Wrapper>
  );
};

export default LoginPage;
