import { Button } from '@toss/tds-mobile';
import styled from 'styled-components';
import { ROUTES, TEXT } from '../common/constants';
import { useState } from 'react';
import Loading from './common/Loading';
import { useNavigate } from 'react-router-dom';
import { appLogin } from '@apps-in-toss/web-framework';
import { requestUserInfo } from '../service/api';
import { decrypt } from '../service/decyrpt';

const Wrapper = styled.div`
    height:100vh;
    width:100%;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
`;

const LoginPage = () => {
    console.log(`LoginPage`)
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState<Boolean>()
    const onLoginClick = async () => {
        console.log(`onLoginClick`)
        setIsLoading(true)
        try {
            const { authorizationCode, referrer } = await appLogin();
            console.log(`authorizationCode=${authorizationCode} referrer=${referrer}`)
            const userInfo = await requestUserInfo(authorizationCode, referrer)
            if (userInfo) {
                console.log(`name=${decrypt(userInfo.name)}`)
            }

            // navigate(ROUTES.MAP, { replace: true })    
        } catch (e) {
            console.log(JSON.stringify(e))
            console.log(e)
        } finally {
            setIsLoading(false)
        }


    }

    if (isLoading) {
        return <Loading />
    }

    return <Wrapper>
        <Button onClick={onLoginClick}>{TEXT.LOGIN}</Button>
    </Wrapper>
}

export default LoginPage