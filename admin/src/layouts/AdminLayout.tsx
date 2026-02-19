// src/layouts/AdminLayout.tsx
import { Layout, Menu, Button, Avatar, Drawer, Grid } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useAuth } from "@/store/auth";
import { PATH } from "@/constants/routes";
import { TEXT } from "@/constants/texts";
import styled from "styled-components";
import { useMemo, useState } from "react";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const Wrap = styled(Layout)`
  min-height: 100dvh;
`;

const StyledHeader = styled(Header)`
  background: ${({ theme }) => theme.colors.headerBg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  /* 모바일에서 이메일 길면 잘리게 */
  span {
    max-width: 45vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StyledSider = styled(Sider)`
  background: ${({ theme }) => theme.colors.sidebarBg} !important;
`;

const StyledContent = styled(Content)`
  padding: ${({ theme }) => theme.layout.contentPadding}px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const menuItems: MenuProps["items"] = [
  { key: PATH.ACCOUNT, label: "유저 관리" },
  { key: PATH.PLACE, label: "장소 목록" },
  { key: PATH.BILLING, label: "결제 내역" },
  { key: PATH.NOTICE, label: "공지사항" },
  { key: PATH.FEEDBACK, label: "피드백" },
  { key: PATH.TERMS, label: "약관 관리" },
];

// pathname이 /account/123 처럼 detail로 내려가도 "유저 관리"가 선택되도록 보정
function getSelectedKey(pathname: string) {
  if (pathname.startsWith(PATH.ACCOUNT.split("/:")[0])) return PATH.ACCOUNT; // /account
  if (pathname.startsWith(PATH.NOTICE.split("/:")[0])) return PATH.NOTICE; // /notice
  // 나머지는 단순 매칭
  return pathname;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuth((s) => s.user);

  const screens = useBreakpoint();
  const isMobile = !screens.md; // md 미만이면 모바일 취급

  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey = useMemo(() => getSelectedKey(location.pathname), [location.pathname]);

  const onLogout = async () => {
    await signOut(auth);
    navigate(PATH.LOGIN, { replace: true });
  };

  const onMenuClick: MenuProps["onClick"] = (info) => {
    navigate(info.key);
    setDrawerOpen(false); // 모바일일 때 메뉴 클릭 후 닫기
  };

  const MenuView = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={onMenuClick}
      style={{ borderInlineEnd: 0 }}
    />
  );

  return (
    <Wrap>
      {/* ✅ 데스크톱: 기존 Sider 유지 */}
      {!isMobile && <StyledSider width={220}>{MenuView}</StyledSider>}

      <Layout>
        <StyledHeader>
          {/* ✅ 모바일: 햄버거 버튼 + 타이틀(선택) */}
          <HeaderLeft>
            {isMobile && <Button onClick={() => setDrawerOpen(true)}>메뉴</Button>}
            {/* 필요 없으면 제거 가능 */}
            {/* <strong style={{ color: "#fff" }}>Admin</strong> */}
          </HeaderLeft>

          <HeaderRight>
            <Avatar size="small" src={user?.photoURL ?? undefined}>
              {user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <span>{user?.email}</span>
            <Button onClick={onLogout}>{TEXT.HEADER.LOGOUT}</Button>
          </HeaderRight>
        </StyledHeader>

        {/* ✅ 모바일: Drawer로 메뉴 */}
        <Drawer
          title="메뉴"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          bodyStyle={{ padding: 0 }}
        >
          {MenuView}
        </Drawer>

        <StyledContent>
          <Outlet />
        </StyledContent>
      </Layout>
    </Wrap>
  );
}
