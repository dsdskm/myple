import { useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import styled from 'styled-components';
import { BottomSheet, Button, SearchField } from '@toss/tds-mobile';
import { TEXT } from '../common/constants';
import BottomTabBar from './BottomTabBar';

const MapWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: calc(100vh - 60px); /* 하단 탭바 높이만큼 빼기 */
`;

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const MenuButton = styled(Button)`
  background-color: white;
  border: none;
  cursor: pointer;
`;

const SubmitWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
`;

const SubmitButton = styled(Button)`
  flex: 1;
`;

const ButtonArea = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;


export const initialCenter = {
    lat: 37.5665, // 서울의 위도
    lng: 126.9780, // 서울의 경도
};

export default function MapPage() {
    console.log(`MapPage`);
    const [isSearchFieldOpen, setIsSearchFieldOpen] = useState<boolean>(false);


    const searchFieldComponent = () => {
        return (
            <BottomSheet
                UNSAFE_disableFocusLock
                open={isSearchFieldOpen}
                onClose={() => setIsSearchFieldOpen(false)}
                header={<BottomSheet.Header>{TEXT.SEARCH_TITLE}</BottomSheet.Header>}
            >
                <SearchField placeholder={TEXT.SEARCH_PLACE_HOLDER} />
                <SubmitWrapper>
                    <SubmitButton>{TEXT.SEARCH}</SubmitButton>
                </SubmitWrapper>
            </BottomSheet>
        );
    };




    return (
        <div>
            <BottomTabBar />
            <MapWrapper>
                <ButtonArea>
                    <MenuButton size="medium" onClick={() => setIsSearchFieldOpen(true)}>
                        {TEXT.SEARCH}
                    </MenuButton>
                </ButtonArea>

                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={initialCenter}
                    zoom={13}
                >
                </GoogleMap>
            </MapWrapper>

            {searchFieldComponent()}
        </div>
    );
}