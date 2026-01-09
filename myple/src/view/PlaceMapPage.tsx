import { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import styled from 'styled-components';
import { BottomSheet, Button, Text, Paragraph, Rating, Toast } from '@toss/tds-mobile';
import { NETWORK_STATUS, PERMISSIONS, ROUTES, TEXT } from '../common/constants';
import BottomTabBar from './BottomTabBar';
import { getCategory, getPlaces } from '../service/api';
import { useApp } from '../context/AppContext';
import { Media, Place } from '../types/place';
import { Accuracy, getCurrentLocation, getNetworkStatus, startUpdateLocation, } from '@apps-in-toss/web-framework';
import { useLocation, useNavigate } from 'react-router-dom';
import ImagePreview, { ImagePreviewContainer } from './common/ImagePreview';
import { ToastInfo } from '../types/toast';

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

const PlaceInfoHeader = styled.div`
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
`

const PlaceInfoContents = styled.div`
    align-items: flex-start;
    justify-content: center;
    display: flex;
    flex-direction: column;
    margin-left:20px;
    margin-right:20px;
    gap:5px
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
    const [toast, setToast] = useState<ToastInfo>({ show: false, message: "" })
    const allMakerList = [...myPlaceList, { id: "curloc", name: "current", latitude: currentLocation[0], longitude: currentLocation[1] }]


    useEffect(() => {
        startUpdateLocation({
            options: {
                accuracy: Accuracy.Balanced,
                timeInterval: 30 * 1000,
                distanceInterval: 10,
            }, onEvent: (location) => {
                setCurrentLocation([location.coords.latitude, location.coords.longitude])
            }, onError: (error) => {
                console.log(error)
            }
        })
    }, [])

    useEffect(() => {
        const loadPlaces = async () => {
            const list = await getPlaces(account.id)
            setMyPlaceList(list)
        }

        const loadCategories = async () => {

            const categoryData = await getCategory(account.id)
            if (categoryData) {
                const map = new Map<number, string>()
                categoryData.list.forEach((c) => map.set(c.id, c.title))
                setCategoryMap(map)
            }
        }
        const load = async () => {
            const networkStatus = await getNetworkStatus();
            if (networkStatus !== NETWORK_STATUS.OFFLINE && networkStatus !== NETWORK_STATUS.UNKNOWN && networkStatus !== NETWORK_STATUS.WWAN) {
                loadPlaces()
                loadCategories()
            } else {
                setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR })
            }
        }
        if (account) {
            load()
        }

    }, [account])


    useEffect(() => {
        const initMapCenter = async () => {
            try {
                if (paramPlace) {
                    setMapCenterLocation({ lat: paramPlace.latitude, lng: paramPlace.longitude })
                } else {
                    const currentPermission = await getCurrentLocation.getPermission()
                    if (currentPermission === PERMISSIONS.ALLOWED) {
                        onCurrentLocationClick()
                    }

                }
            } catch (err) {
                console.log(err)
            }
        }

        initMapCenter()


    }, [paramPlace])

    const placeInfoComponent = () => {
        if (!selectedPlace) {
            return <></>
        }

        const placeHistoryList = selectedPlace.historyList
        const tags = new Set<string>()
        let images: Media[] = []
        selectedPlace.historyList.forEach((history) => {
            history.tags.forEach((tag) => {
                tags.add(tag)
            })
            if (history.medias) {
                images = images.concat(history.medias as Media[])
            }
        })
        const recentHistory = selectedPlace.historyList.length > 0 ? selectedPlace.historyList[0] : null
        return selectedPlace && categoryMap && <BottomSheet
            UNSAFE_disableFocusLock
            open={isPlaceInfoOpen}
            onClose={() => setIsPlaceInfoOpen(false)}
            header={
                <PlaceInfoHeader>
                    <BottomSheet.Header>{selectedPlace.name}</BottomSheet.Header>
                </PlaceInfoHeader>
            }>
            <PlaceInfoContents>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "space-between", width: "100%" }}>
                    <Paragraph.Text>{categoryMap.get(selectedPlace.category)}</Paragraph.Text>
                    {placeHistoryList.length > 0 && <Rating readOnly={true} value={placeHistoryList[0].rating} max={placeHistoryList[0].rating} size="medium" variant="iconOnly" aria-label={TEXT.RATING} />}
                </div>

                {selectedPlace.address && <Paragraph.Text >{selectedPlace.address}</Paragraph.Text>}
                <ImagePreviewContainer>
                    {images.map((image: any) => {
                        return <ImagePreview
                            key={image.fileName}
                            src={image.url}
                            id={image.fileName}
                            onClick={() => { }} onDelete={null} />
                    })}
                </ImagePreviewContainer>
                {recentHistory && <Text>{recentHistory.memo}</Text>}
                {recentHistory && <Text style={{ fontStyle: "italic", fontSize: 14, marginTop: 5 }}>{Array.from(tags)}</Text>}
                {recentHistory && <Text style={{ fontSize: 14, marginTop: 5, alignSelf: "flex-end" }}>{TEXT.RECENT_VISIT_AT} {recentHistory.visitAt}</Text>}
                <Text style={{ fontSize: 14, marginTop: 5, alignSelf: "flex-end" }}>총 {selectedPlace.historyList.length}회 방문</Text>
            </PlaceInfoContents>
            <SubmitWrapper>
                <SubmitButton size="medium" onClick={() => navigate(ROUTES.PLACE_EDIT, {
                    state: {
                        selectedPlace: selectedPlace
                    }
                })}> {TEXT.DETAILS}</SubmitButton>
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
        const currentPermission = await getCurrentLocation.getPermission()
        if (currentPermission === PERMISSIONS.ALLOWED) {
            const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
            setCurrentLocation([response.coords.latitude, response.coords.longitude])
            setMapCenterLocation({ lat: response.coords.latitude, lng: response.coords.longitude })
        } else {
            const locationPermssion = await getCurrentLocation.openPermissionDialog();
            console.log(`locationPermssion ${locationPermssion}`)
        }

    }

    const mapView = () => {
        return <GoogleMap
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
    }

    const buttonView = () => {
        return <ButtonArea>
            <Button size='small' onClick={onCurrentLocationClick}>{TEXT.CURRENT_LOCATION}</Button>
        </ButtonArea>
    }

    return (
        <div>
            <BottomTabBar />
            <MapWrapper>
                {buttonView()}
                {mapView()}
            </MapWrapper>

            {selectedPlace && placeInfoComponent()}
            <Toast
                position="bottom"
                open={toast.show}
                text={toast.message}
                duration={2000}
                onClose={() => {
                    setToast({ show: true, message: "" })

                }}
            />
        </div>
    );
}