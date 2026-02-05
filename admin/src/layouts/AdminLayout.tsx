import { Layout, Menu, Button, Avatar, Space } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useAuth } from "@/store/auth";
import { PATH } from "@/constants/routes";
import { TEXT } from "@/constants/texts";
import styled from "styled-components";

const { Header, Sider, Content } = Layout;

const Wrap = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  background: ${({ theme }) => theme.colors.headerBg};
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const StyledSider = styled(Sider)`
  background: ${({ theme }) => theme.colors.sidebarBg} !important;
`;

const StyledContent = styled(Content)`
  padding: ${({ theme }) => theme.layout.contentPadding}px;
`;

const menuItems: MenuProps["items"] = [
    { key: PATH.ROOT, label: "대시보드" },
    { key: PATH.USERS, label: "계정 관리" },
    { key: PATH.BILLING, label: "결제 내역" },
    { key: PATH.TERMS, label: "약관 관리" },
    { key: PATH.NOTICE, label: "공지사항" },
    { key: PATH.FEEDBACK, label: "피드백" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuth((s) => s.user);

    const onLogout = async () => {
        await signOut(auth);
        navigate(PATH.LOGIN, { replace: true });
    };

    return (
        <Wrap>
            <StyledSider width={220}>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={(info) => navigate(info.key)}
                />
            </StyledSider>
            <Layout>
                <StyledHeader>
                    <Space>
                        <Avatar size="small" src={user?.photoURL ?? undefined}>
                            {user?.email?.[0]?.toUpperCase()}
                        </Avatar>
                        <span>{user?.email}</span>
                        <Button onClick={onLogout}>{TEXT.HEADER.LOGOUT}</Button>
                    </Space>
                </StyledHeader>
                <StyledContent>{children}</StyledContent>
            </Layout>
        </Wrap>
    );
}