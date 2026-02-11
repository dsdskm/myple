import { Card, Form, Input, Button, Typography, message } from "antd";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { PATH } from "@/constants/routes";
import { AUTH_ERROR_MSG, TEXT } from "@/constants/texts";
import styled from "styled-components";
import { useState } from "react";

const Center = styled.div`
  height: 100vh;
  display: grid;
  place-items: center;
`;

const CardWrap = styled(Card)`
  width: 400px;
`;

export default function LoginPage() {
    const navigate = useNavigate();
    const [resetEmail, setResetEmail] = useState("");

    const onFinish = async (values: { email: string; password: string }) => {
        try {
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

    return (
        <Center>
            <CardWrap title={TEXT.LOGIN.TITLE}>
                <Form layout="vertical" onFinish={onFinish}>
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
                            onChange={(e) => setResetEmail(e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item
                        label={TEXT.LOGIN.PASSWORD_LABEL}
                        name="password"
                        rules={[{ required: true, message: TEXT.LOGIN.NEED_PASSWORD }]}
                    >
                        <Input.Password
                            placeholder={TEXT.LOGIN.PLACEHOLDER_PASSWORD}
                            autoComplete="current-password"
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {TEXT.LOGIN.SUBMIT}
                    </Button>
                </Form>
                <Typography.Paragraph style={{ marginTop: 12, textAlign: "right" }}>
                    <Button type="link" onClick={onResetPassword}>
                        {TEXT.LOGIN.RESET_LINK}
                    </Button>
                </Typography.Paragraph>
            </CardWrap>
        </Center>
    );
}
