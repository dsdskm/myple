import { Button, ConfirmDialog } from "@toss/tds-mobile";
import { LOGOUT_REFERRER, ROUTES, TEXT } from "../common/constants";
import BottomTabBar from "./BottomTabBar"
import styled from 'styled-components';
import { useState } from "react";
import { requestLogout } from "../service/api";
import { useNavigate } from 'react-router-dom';
import { useApp } from "../context/AppContext";
import { ACTION_TYPE_SET_ACCOUNT, initialAccountState } from "../types/account";

const MenuButton = styled(Button)`
  background-color: white;
  border: none;
  cursor: pointer;
`;

const ButtonArea = styled.div`
  flex: 1;
  height:100vh;
  display: flex;
  justify-content: center;
  align-items: center;
 
`;

const MyPage = () => {
    const navigate = useNavigate();
    const { account, setAccount } = useApp()
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);


    const onLogoutClick = async () => {
        console.log(`onLogoutClick`)
        try {
            await requestLogout(account.userKey, LOGOUT_REFERRER.UNLINK);
            setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: initialAccountState })
            navigate(ROUTES.LOGIN, { replace: true })
        } catch (e) {
            console.log(e);
        } finally {
            setIsLogoutDialogOpen(false);
        }
    };

    const logoutDialog = () => {
        return (
            <ConfirmDialog
                open={isLogoutDialogOpen}
                title={<ConfirmDialog.Title>{TEXT.MSG_LOGOUT_CONFIRM}</ConfirmDialog.Title>}
                cancelButton={
                    <ConfirmDialog.CancelButton
                        onClick={() => setIsLogoutDialogOpen(false)}
                    >
                        {TEXT.NO}
                    </ConfirmDialog.CancelButton>
                }
                confirmButton={
                    <ConfirmDialog.ConfirmButton onClick={onLogoutClick}>
                        {TEXT.YES}
                    </ConfirmDialog.ConfirmButton>
                }
                onClose={() => setIsLogoutDialogOpen(false)}
            />
        );
    };

    return <div>
        <BottomTabBar />
        <ButtonArea>
            <MenuButton size="medium" onClick={() => setIsLogoutDialogOpen(true)}>
                {TEXT.LOGOUT}
            </MenuButton>
        </ButtonArea>
        {logoutDialog()}
    </div>
}


export default MyPage