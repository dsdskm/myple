import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ROUTES, TEXT } from '../common/constants';

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

const TabImage = styled.img`
    width:24px;
    height:24px;
    object-fit:contain
`

const tabs = [
    {
        label: `${TEXT.TAB_MAP}`,
        icon: <TabImage
            src="/tab_map.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
        />,   // 이미지 컴포넌트를 직접 넣어줍니다
        path: ROUTES.MAP,
    },
    {
        label: `${TEXT.TAB_LIST}`,
        icon: <TabImage
            src="/tab_list.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
        />,
        path: ROUTES.PLACE_LIST,
    },
    {
        label: `${TEXT.TAB_ADD}`,
        icon: <TabImage
            src="/tab_add.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
        />,
        path: ROUTES.PLACE_EDIT,
    },
    {
        label: `${TEXT.TAB_MY}`,
        icon: <TabImage
            src="/tab_info.png"          /* public/search.png 가 자동으로 /search.png 로 매핑됩니다 */
            alt="search"
        />,
        path: ROUTES.MY,
    },
];

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