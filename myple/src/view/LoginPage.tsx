import { Button, Paragraph, Toast } from '@toss/tds-mobile';
import styled from 'styled-components';
import { ALT, PUBLIC_IMAGES, ROUTES, TEXT } from '../common/constants';
import { useState } from 'react';
import Loading from './common/Loading';
import { useNavigate } from 'react-router-dom';
import { appLogin } from '@apps-in-toss/web-framework';
import { requestUserInfo } from '../service/api';
import { Account, ACTION_TYPE_SET_ACCOUNT, initialAccountState } from '../types/account';
import { useApp } from '../context/AppContext';
import { ToastInfo } from '../types/toast';

const Wrapper = styled.div`
    height:100vh;
    width:100%;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
`;

const LogoImage = styled.img`
    width:300px;
    height:300px;
`

const Creator = styled.div`
    margin-bottom:20px;
    position: absolute;
    bottom: 0 ;
`

const LoginPage = () => {
    const navigate = useNavigate()
    const { setAccount } = useApp()
    const [toastInfo, setToastInfo] = useState<ToastInfo>({
        show: false,
        message: ""
    })

    const [isLoading, setIsLoading] = useState<boolean>()

    const onLoginClick = async () => {
        setIsLoading(true)
        try {
            const { authorizationCode, referrer } = await appLogin();
            const userInfo: Account | null = await requestUserInfo(authorizationCode, referrer)
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
            console.log(`login error`, e)
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
        <LogoImage
            alt={ALT.LOGO}
            src={PUBLIC_IMAGES.LOGO} />
        <Button onClick={onLoginClick}>{TEXT.LOGIN}</Button>
        <Paragraph.Text style={{ marginTop: 15 }}>{TEXT.LOOG_TITLE}</Paragraph.Text>
        <Toast
            position="bottom"
            open={toastInfo.show}
            text={toastInfo.message}
            duration={2000}
            onClose={() => {
                toastInfo.show = false
                setToastInfo({ ...toastInfo })
            }}
        />
        <Creator>{TEXT.CREATOR}</Creator>
    </Wrapper>
}

export default LoginPage