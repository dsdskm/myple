import { Button, Toast } from '@toss/tds-mobile';
import styled from 'styled-components';
import { ROUTES, TEXT } from '../common/constants';
import { useState } from 'react';
import Loading from './common/Loading';
import { useNavigate } from 'react-router-dom';
import { appLogin } from '@apps-in-toss/web-framework';
import { requestUserInfo } from '../service/api';
import { Account, ACTION_TYPE_SET_ACCOUNT, initialAccountState } from '../types/account';
import { useApp } from '../context/AppContext';

const Wrapper = styled.div`
    height:100vh;
    width:100%;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
`;

interface ToastInfo {
    show: boolean;
    message: string;
}

const LoginPage = () => {
    console.log(`LoginPage`)
    const navigate = useNavigate()
    const { setAccount } = useApp()
    const [toastInfo, setToastInfo] = useState<ToastInfo>({
        show: false,
        message: ""
    })
    const [showToast, setShowToast] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>()
    const onLoginClick = async () => {
        setIsLoading(true)
        try {
            const { authorizationCode, referrer } = await appLogin();
            const userInfo: Account | null = await requestUserInfo(authorizationCode, referrer)
            console.log(`userInfo`, userInfo)
            if (userInfo) {
                setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: userInfo })
                navigate(ROUTES.MAP, { replace: true })
                toastInfo.message = TEXT.MSG_LOGIN_SUCCESS
            } else {
                setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: initialAccountState })
                toastInfo.message = TEXT.MSG_LOGIN_FAILED
            }

            toastInfo.show = true
            setToastInfo({ ...toastInfo })
        } catch (e) {
            console.log(e)
            toastInfo.show = true
            toastInfo.message = TEXT.MSG_LOGIN_FAILED
            setToastInfo({ ...toastInfo })
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <Loading />
    }

    return <Wrapper>
        <Button onClick={onLoginClick}>{TEXT.LOGIN}</Button>
        <Toast
            position="bottom"
            open={showToast}
            text="하단 토스트 메시지이에요"
            duration={3000}
            onClose={() => setShowToast(false)}
        />
    </Wrapper>
}

export default LoginPage