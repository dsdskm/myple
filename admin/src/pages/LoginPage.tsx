import { Card, Form, Input, Button, Typography, message, Switch, Space, Spin } from "antd";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/constants/routes";
import { AUTH_ERROR_MSG, TEXT } from "@/constants/texts";
import styled from "styled-components";
import { useEffect, useState } from "react";

const Center = styled.div`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #f5f5f5;
`;

const CardWrap = styled(Card)`
  width: min(420px, 100%);
  border-radius: 14px;

  .ant-card-head-title {
    font-size: 18px;
    font-weight: 700;
  }

  @media (max-width: 480px) {
    border-radius: 12px;

    .ant-card-body {
      padding: 16px;
    }

    .ant-card-head-title {
      font-size: 16px;
    }

    .ant-input,
    .ant-input-password,
    .ant-btn {
      height: 44px;
      font-size: 15px;
    }

    .ant-btn-link {
      height: auto;
      padding: 0;
    }
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [resetEmail, setResetEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  
  // ✅ 인증 상태 확인 중인지 여부 (초기값 true)
  const [loading, setLoading] = useState(true);

  // 1️⃣ [추가] 접속 시 로그인 여부 확인 및 리다이렉트
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 이미 로그인된 상태라면 바로 이동
        navigate(PATH.ACCOUNT, { replace: true });
      } else {
        // 로그인이 안 되어 있다면 로그인 폼 표시
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 2️⃣ 로그인 유지 설정 로드
  useEffect(() => {
    const v = localStorage.getItem("rememberMe");
    if (v === "0") setRememberMe(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("rememberMe", rememberMe ? "1" : "0");
  }, [rememberMe]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      // ✅ 세션 유지 방식 설정 (Local vs Session)
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success(TEXT.LOGIN.SUCCESS);
      navigate(PATH.ACCOUNT, { replace: true });
    } catch (e: any) {
      const msg = AUTH_ERROR_MSG[e?.code] ?? TEXT.LOGIN.FAIL_GENERIC;
      message.error(msg);
      console.error(e);
    }
  };

  const onResetPassword = async () => {
    if (!resetEmail) return message.warning(TEXT.LOGIN.NEED_EMAIL);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      message.success("비밀번호 재설정 메일을 보냈습니다.");
    } catch (e) {
      message.error("메일 발송에 실패했습니다.");
      console.error(e);
    }
  };

  // ✅ 인증 확인 중일 때는 아무것도 보여주지 않거나 로딩 스피너를 보여줌
  if (loading) {
    return (
      <Center>
        <Spin size="large" />
      </Center>
    );
  }

  return (
    <Center>
      <CardWrap title={TEXT.LOGIN.TITLE}>
        <Form 
          layout="vertical" 
          onFinish={onFinish} 
          requiredMark={false} 
          initialValues={{ rememberMe: true }}
        >
          <Form.Item
            label={TEXT.LOGIN.EMAIL_LABEL}
            name="email"
            rules={[
              { required: true, message: TEXT.LOGIN.NEED_EMAIL },
              { type: "email", message: TEXT.LOGIN.INVALID_EMAIL },
            ]}
          >
            <Input
              placeholder={TEXT.LOGIN.PLACEHOLDER_EMAIL}
              autoComplete="username"
              inputMode="email"
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label={TEXT.LOGIN.PASSWORD_LABEL}
            name="password"
            rules={[{ required: true, message: TEXT.LOGIN.NEED_PASSWORD }]}
          >
            <Input.Password placeholder={TEXT.LOGIN.PLACEHOLDER_PASSWORD} autoComplete="current-password" />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Space size={8}>
              <Switch checked={rememberMe} onChange={setRememberMe} />
              <Typography.Text>로그인 유지</Typography.Text>
            </Space>

            <Button type="link" onClick={onResetPassword}>
              {TEXT.LOGIN.RESET_LINK}
            </Button>
          </div>

          <Button type="primary" htmlType="submit" block>
            {TEXT.LOGIN.SUBMIT}
          </Button>
        </Form>
      </CardWrap>
    </Center>
  );
}