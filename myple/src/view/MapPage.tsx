import { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import styled from 'styled-components';
import { BottomSheet, Button, Post, Rating } from '@toss/tds-mobile';
import { ROUTES, TEXT } from '../common/constants';
import BottomTabBar from './BottomTabBar';
import { getCategory, getPlaces } from '../service/api';
import { useApp } from '../context/AppContext';
import { Place } from '../types/place';
import { Accuracy, getCurrentLocation } from '@apps-in-toss/web-framework';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDPlusTime, slicingVisitAtTime } from '../common/utils';

const MapWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: calc(100vh - 60px); /* 하단 탭바 높이만큼 빼기 */
`;

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const SubmitWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  margin-top:10px;
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

const ImagePreviewContainer = styled.div`
    height: 270px;
    display: flex;
    justify-content: flex-start; /* 왼쪽 정렬 */
    align-items: center;
    overflow-x: auto;
    gap: 10px;
    padding: 10px;
    margin-bottom: 10px;
    width: 100%; /* 전체 너비 확보 */
`;

const ImagePreview = styled.img`
    width: 250px;
    height: 250px;
    object-fit: cover;
    border-radius: 8px;
    margin: 0 10px 0 0;
`;

const PlaceInfoHeader = styled.div`
    alignItems: center;
    justifyContent: center;
    display: flex;
    flexDirection: column;
`
const DEFAULT_ZOOM = 12
export default function MapPage() {
    const navigate = useNavigate()
    const location = useLocation();
    const paramPlace: Place = location.state && location.state.selectedPlace ? location.state.selectedPlace : null
    const { account } = useApp()
    const [isPlaceInfoOpen, setIsPlaceInfoOpen] = useState<boolean>(false);
    const [myPlaceList, setMyPlaceList] = useState<Place[] | []>([])
    const [mapCenterLocation, setMapCenterLocation] = useState<any>({ lat: 37.5665, lng: 126.9780 })
    const [currentLocation, setCurrentLocation] = useState<number[]>([37.5665, 126.9780])
    const [selectedPlace, setSelectedPlace] = useState<Place | null>()
    const [zoom, setZoome] = useState<number>(DEFAULT_ZOOM)
    const [categoryMap, setCategoryMap] = useState<Map<number, string>>()

    useEffect(() => {
        const loadPlaces = async () => {
            const list = await getPlaces(account.id)
            setMyPlaceList(list)
        }

        loadPlaces()
    }, [account.id])

    useEffect(() => {
        const loadCategories = async () => {
            if (account) {
                const categoryData = await getCategory(account.id)
                if (categoryData) {
                    const map = new Map<number, string>()
                    categoryData.list.forEach((c) => map.set(c.id, c.title))
                    setCategoryMap(map)
                }
            }
        }

        loadCategories()

    }, [account])

    useEffect(() => {
        const initMapCenter = async () => {
            try {
                if (paramPlace) {
                    setMapCenterLocation({ lat: paramPlace.latitude, lng: paramPlace.longitude })
                } else {
                    onCurrentLocationClick()
                }
            } catch (err) {
                console.log(err)
            }
        }

        initMapCenter()


    }, [paramPlace])

    const placeInfoComponent = () => {
        return selectedPlace && categoryMap && <BottomSheet
            UNSAFE_disableFocusLock
            open={isPlaceInfoOpen}
            onClose={() => setIsPlaceInfoOpen(false)}
            header={
                <PlaceInfoHeader>
                    <div>
                        <BottomSheet.Header>{selectedPlace.name}</BottomSheet.Header>
                        <Post.Paragraph>{categoryMap.get(selectedPlace.category)}</Post.Paragraph>
                        {selectedPlace.visitAt && <Post.Paragraph>{slicingVisitAtTime(selectedPlace.visitAt)}, {getDPlusTime(selectedPlace.visitAt)}</Post.Paragraph>}
                    </div>
                    <Rating readOnly={false} value={selectedPlace.rating} max={selectedPlace.rating} size="medium" aria-label={TEXT.RATING} />
                </PlaceInfoHeader>
            }>

            <Post.Paragraph>{selectedPlace.memo}</Post.Paragraph>
            {selectedPlace.address && <Post.Paragraph style={{ marginTop: 10 }}>{selectedPlace.address}</Post.Paragraph>}
            {selectedPlace.medias.length > 0 && <ImagePreviewContainer>
                {selectedPlace.medias.map((image) => {
                    return <ImagePreview src={image.url} key={image.url} alt="" />;
                })}
            </ImagePreviewContainer>}

            <SubmitWrapper>
                <SubmitButton size="medium" onClick={() => navigate(ROUTES.PLACE_EDIT, {
                    state: {
                        selectedPlace: selectedPlace
                    }
                })}> {TEXT.MODIFY}</SubmitButton>
            </SubmitWrapper>
        </BottomSheet >
    }



    const onMarkerClick = (id: string) => {
        if (myPlaceList) {
            const filteredList = myPlaceList.filter(p => p.id === id)
            if (filteredList && filteredList.length > 0) {
                const marker = filteredList[0]
                setSelectedPlace(marker)
                setIsPlaceInfoOpen(true)
                setMapCenterLocation({ lat: marker.latitude, lng: marker.longitude })
                setZoome(DEFAULT_ZOOM)
                return
            }
        }

        setSelectedPlace(null)
    }

    const onCurrentLocationClick = async () => {
        const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
        setCurrentLocation([response.coords.latitude, response.coords.longitude])
        setMapCenterLocation({ lat: response.coords.latitude, lng: response.coords.longitude })
    }
    const allMakerList = [...myPlaceList, { id: "curloc", name: "current", latitude: currentLocation[0], longitude: currentLocation[1] }]

    return (
        <div>
            <BottomTabBar />
            <MapWrapper>
                <ButtonArea>
                    <Button size='small' onClick={onCurrentLocationClick}>{TEXT.CURRENT_LOCATION}</Button>
                </ButtonArea>

                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenterLocation}
                    zoom={zoom}
                >
                    {allMakerList.map((marker) => {
                        const isCurrent = marker.id === "curloc"
                        return <Marker
                            key={marker.id}
                            label={marker.name}
                            title={marker.name}
                            icon={isCurrent ? {
                                url: "current_location.png", scaledSize: new google.maps.Size(40, 40)
                            } : undefined}
                            position={{
                                lat: marker.latitude, lng: marker.longitude
                            }}
                            onClick={() => isCurrent ? undefined : onMarkerClick(marker.id)}
                        />
                    })}

                </GoogleMap>
            </MapWrapper>

            {selectedPlace && placeInfoComponent()}
        </div>
    );
}