import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ALT, PUBLIC_IMAGES, ROUTES, TEXT } from '../common/constants';

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
            src={PUBLIC_IMAGES.TAB_MAP}
            alt={ALT.TAB_MAP}
        />,
        path: ROUTES.MAP,
    },
    {
        label: `${TEXT.TAB_LIST}`,
        icon: <TabImage
            src={PUBLIC_IMAGES.TAB_LIST}
            alt={ALT.TAB_LIST}
        />,
        path: ROUTES.PLACE_LIST,
    },
    {
        label: `${TEXT.TAB_ADD}`,
        icon: <TabImage
            src={PUBLIC_IMAGES.TAB_ADD}
            alt={ALT.TAB_ADD}
        />,
        path: ROUTES.PLACE_EDIT,
    },
    {
        label: `${TEXT.TAB_MY}`,
        icon: <TabImage
            src={PUBLIC_IMAGES.TAB_MY}
            alt={ALT.TAB_MY}
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