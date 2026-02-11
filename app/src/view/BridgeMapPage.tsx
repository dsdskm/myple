import styled from "styled-components";
import { Asset, Button, Post, Text } from "@toss/tds-mobile";
import { useNavigate } from "react-router-dom";
import { PUBLIC_IMAGES, ROUTES, TEXT } from "../common/constants"; // 로그인 라우트 맞게 수정
import { theme } from "../styles/theme";

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const Content = styled.div`
  margin-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Desc = styled.div`
  margin-top: 32px;
  text-align: center;
`;

const Spacer = styled.div`
  height: 8px;
`;

const Bottom = styled.div`
  padding: 16px 24px 28px;
  background: #fff;
  justify-content: center;
  align-items: center;
  display: flex;
`;

const BridgeMapPage = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Post.H1 color={theme.colors.primary}>{TEXT.BRIDGE_MAP_NAME}</Post.H1>
      <Content>
        <Asset.Image src={PUBLIC_IMAGES.SHOT_MAP} alt="mapShot" style={{ width: "50%" }} />
        <Desc>
          <Text typography="t6" fontWeight="bold">
            {TEXT.MSG_BRIDGE_MAP_DESCRIPTION}
          </Text>
          <Spacer />
          <Text typography="t7" color="gray600">
            {TEXT.MSG_LOGIN_GUIDE}
          </Text>
        </Desc>
      </Content>

      <Bottom>
        <Button size="large" onClick={() => navigate(ROUTES.LOGIN, { replace: true })}>
          {TEXT.GO_LOGIN}
        </Button>
      </Bottom>
    </Wrapper>
  );
};

export default BridgeMapPage;
