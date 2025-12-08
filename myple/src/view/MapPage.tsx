import { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styled from 'styled-components';
import { BottomSheet, Button, SearchField } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';
import { ROUTES, TEXT } from '../common/constants';

const MapWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
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
    alignItems: center;
    margin-left:10px;
    margin-right:10px;
    margin-bottom:10px;
`

const SubmitButton = styled(Button)`
    flex:1
`;

const ButtonArea = styled.div`
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1;
    display:flex;
    flex-direction:column;
    gap:10px

`;
/**
 * 맵
 * 추가 버튼
 * 검색 버튼
 * 마커 표시
 */

export const initialCenter = {
    lat: 37.5665, // 서울의 위도
    lng: 126.9780, // 서울의 경도
};

export default function MapPage() {
    console.log(`MapPage`)
    const navigate = useNavigate()
    const [isSearchFieldOpen, setIsSearchFieldOpen] = useState<boolean>(false)
    const [markerPosition, setMarkerPosition] = useState(initialCenter);

    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            const newPosition = { lat, lng };

            setMarkerPosition(newPosition);
            console.log(`newPosition ${newPosition}`);
        }
    }, []);

    const searchFieldComponent = () => {
        return <BottomSheet
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
    }

    return (
        <div>
            <MapWrapper>
                <ButtonArea>
                    <MenuButton size={"medium"} onClick={() => { navigate(ROUTES.PLACE_EDIT) }}>{TEXT.ADD}</MenuButton>
                    <MenuButton size={"medium"} onClick={() => setIsSearchFieldOpen(true)}>{TEXT.SEARCH}</MenuButton>
                </ButtonArea>
                <LoadScript
                    id="google-maps-script"
                    googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}
                >

                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={initialCenter}
                        zoom={13}
                        onClick={handleMapClick}
                    >
                        <Marker position={markerPosition} />
                    </GoogleMap>
                </LoadScript>
            </MapWrapper>
            {searchFieldComponent()}
        </div >
    );
}