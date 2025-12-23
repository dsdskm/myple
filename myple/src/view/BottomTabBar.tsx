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

const tabs = [
    {
        label: 'Map',
        icon: <img
            src="/tab_map.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
        />,   // 이미지 컴포넌트를 직접 넣어줍니다
        path: ROUTES.MAP,
    },
    {
        label: 'List',
        icon: <img
            src="/tab_list.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
        />,
        path: ROUTES.PLACE_LIST,
    },
    {
        label: 'Add',
        icon: <img
            src="/tab_add.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
        />,
        path: ROUTES.PLACE_EDIT,
    },
    {
        label: 'My',
        icon: <img
            src="/tab_info.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
        />,
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