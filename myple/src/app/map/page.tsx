"use client"

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styled from 'styled-components';
import { Button, SearchField, Button as TDSButton } from '@toss/tds-mobile';

const MapWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const initialCenter = {
    lat: 37.5665, // 서울의 위도
    lng: 126.9780, // 서울의 경도
};

const AddButton = styled(TDSButton)`
    position: fixed;
    z-index: 99;
    background-color: white;
    border: none;
    cursor: pointer;
`;

const ButtonArea = styled.div`
    padding:10px;
    width:100%
    felx:1;
    justify-content:flex-end;
    display:flex;
`;


export default function MapPage() {
    const [markerPosition, setMarkerPosition] = useState(initialCenter);

    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            const newPosition = { lat, lng };

            setMarkerPosition(newPosition);
            console.log('클릭한 위치의 위경도:', newPosition);
            // 필요하다면 Geocoding API를 사용하여 주소 정보로 변환할 수 있습니다.
        }
    }, []);

    useEffect(() => {
    }, []);

    return (
        <div>
            <div>
                <SearchField placeholder="장소를 입력하세요." onDeleteClick={() => alert('delete')} fixed />
            </div>
            <ButtonArea>
                <AddButton>ADD</AddButton>
            </ButtonArea>
            <MapWrapper>
                <LoadScript
                    id="google-maps-script"
                    googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
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

        </div >
    );
}