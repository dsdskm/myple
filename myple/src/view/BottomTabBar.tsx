import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ROUTES } from '../common/constants';

/* ---------- Styled Components ---------- */
const TabBarWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
`;

const TabButton = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  color: #999;
  text-decoration: none;

  &.active,
  &:hover {
    color: #ff6b6b;
  }
`;

const TabIcon = styled.div`
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TabLabel = styled.div`
  font-size: 12px;
  margin-top: 4px;
`;

/* ---------- 아이콘 정의 ---------- */
/* public 폴더에 있는 search.png 를 아이콘으로 사용합니다.
   여기서는 같은 이미지를 모든 탭에 사용했지만,
   필요에 따라 각각 다른 이미지를 지정해도 됩니다. */
const SearchIcon = () => (
    <img
        src="/search.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
        alt="search"
        style={{ width: 24, height: 24, objectFit: 'contain' }}
    />
);

/* ---------- 탭 데이터 ---------- */
const tabs = [
    {
        label: 'Map',
        icon: <SearchIcon />,   // 이미지 컴포넌트를 직접 넣어줍니다
        path: ROUTES.MAP,
    },
    {
        label: 'List',
        icon: <SearchIcon />,
        path: ROUTES.PLACE_LIST,
    },
    {
        label: 'Add',
        icon: <SearchIcon />,
        path: ROUTES.PLACE_EDIT,
    },
    {
        label: 'My',
        icon: <SearchIcon />,
        path: ROUTES.MY,
    },
];

/* ---------- BottomTabBar 컴포넌트 ---------- */
export default function BottomTabBar() {
    return (
        <TabBarWrapper>
            {tabs.map((tab) => (
                <TabButton
                    key={tab.path}
                    to={tab.path}
                    className={window.location.pathname === tab.path ? 'active' : ''}
                >
                    <TabIcon>{tab.icon}</TabIcon>
                    <TabLabel>{tab.label}</TabLabel>
                </TabButton>
            ))}
        </TabBarWrapper>
    );
}