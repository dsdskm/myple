import { Button, Paragraph, Toast } from '@toss/tds-mobile';
import styled from 'styled-components';
import { AD_TEST_INTERSTITIAL_ID, ALT, PUBLIC_IMAGES, ROUTES, TEXT } from '../common/constants';
import { useState } from 'react';
import Loading from './common/Loading';
import { useNavigate } from 'react-router-dom';
import { appLogin, GoogleAdMob } from '@apps-in-toss/web-framework';
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

    const showAd = () => {
        const options = {
            adGroupId: AD_TEST_INTERSTITIAL_ID
        }
        GoogleAdMob.loadAppsInTossAdMob({
            options: options,
            onEvent: (event) => {
                console.log(`ad load event`, event)
                switch (event.type) {
                    case 'loaded':
                        console.log(`ad load success`)
                        GoogleAdMob.showAppsInTossAdMob({
                            options: options,
                            onEvent: (event) => {
                                console.log(`ad show event`, event)
                                switch (event.type) {
                                    case 'show':
                                        console.log('광고 컨텐츠 보여졌음');
                                        break;
                                    case 'requested':
                                        console.log('광고 보여주기 요청 완료');
                                        break;
                                    case 'impression':
                                        console.log('광고 노출');
                                        break;
                                    case 'clicked':
                                        console.log('광고 클릭');
                                        break;
                                    case 'userEarnedReward':  // 보상형 광고만 사용 가능
                                        console.log('광고 보상 획득 unitType:', event.data.unitType);
                                        console.log('광고 보상 획득 unitAmount:', event.data.unitAmount);
                                        break;
                                    case 'dismissed':
                                        console.log('광고 닫힘');
                                        navigate(ROUTES.MAP, { replace: true })
                                        break;
                                    case 'failedToShow':
                                        console.log('광고 보여주기 실패');
                                        navigate(ROUTES.MAP, { replace: true })
                                        break;
                                    default:
                                        break
                                }
                            },
                            onError: (error) => {
                                console.log(`ad show error`, error)
                            }
                        })
                        break
                    default:
                        break
                }
            },
            onError: (error) => {
                console.log(`ad load error`, error)
            }
        })
    }

    const onLoginClick = async () => {
        setIsLoading(true)
        try {
            const { authorizationCode, referrer } = await appLogin();
            const userInfo: Account | null = await requestUserInfo(authorizationCode, referrer)
            if (userInfo) {
                setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: userInfo })
                if (GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
                    showAd()
                } else {
                    navigate(ROUTES.MAP, { replace: true })
                }
                toastInfo.message = TEXT.MSG_LOGIN_SUCCESS
                toastInfo.show = true
                setToastInfo({ ...toastInfo })

            } else {
                setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: initialAccountState })
                toastInfo.message = TEXT.MSG_LOGIN_FAILED
                toastInfo.show = true
                setToastInfo({ ...toastInfo })
            }


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
        <Paragraph.Text style={{ marginTop: 15, marginBottom: 30 }}>{TEXT.LOOG_TITLE}</Paragraph.Text>
        <Button onClick={onLoginClick}>{TEXT.LOGIN}</Button>
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