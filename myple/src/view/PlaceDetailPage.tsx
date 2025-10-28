import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { Post, Text } from "@toss/tds-mobile"
import { useEffect, useState } from "react";

/**
 * 장소 이름
 * 카테고리
 * 주소
 * 위도, 경도 + 지도
 * 메모
 * 별점
 * 방문 날짜
 * 사진 / 영상
 * 수정 / 삭제 / 공유
 * @returns 
 */

const SAMPLE_DATA = {
    name: "모수",
    category: "식당",
    address: "서울특별시 용산구 이태원동 258-14",
    latitude: 37.541307,
    longitude: 126.996140,
    memo: "비싸고 맛있지만 내 스타일은 아닌 집",
    rating: 4,
    visitAt: "2025-10-11 14:00",
    pictures: [],
    videos: []
}

const mapContainerStyle = {
    width: '100%',
    height: '300px',
};

const PlaceDetailPage = () => {
    const initialCenter = {
        lat: SAMPLE_DATA.latitude,
        lng: SAMPLE_DATA.longitude,
    }

    const [markerPosition, setMarkerPosition] = useState(initialCenter)
    useEffect(() => {
        const lat = SAMPLE_DATA.latitude
        const lng = SAMPLE_DATA.longitude
        console.log(`lat=${lat}, lng=${lng}`)
        setMarkerPosition({ lat: lat, lng: lng })
    }, [])

    console.log(`markerPosition ${JSON.stringify(markerPosition)}`)
    return <>
        <div style={{ padding: 10 }}>
            <Post.H3>장소 이름</Post.H3>
            <Post.Paragraph>{SAMPLE_DATA.name}</Post.Paragraph>
            <Post.H3>카테고리</Post.H3>
            <Post.Paragraph>{SAMPLE_DATA.category}</Post.Paragraph>
            <Post.H3>주소</Post.H3>
            <Post.Paragraph>{SAMPLE_DATA.address}</Post.Paragraph>
            <Post.H3>위도, 경도</Post.H3>

            <Post.Paragraph>{SAMPLE_DATA.latitude},{SAMPLE_DATA.longitude}</Post.Paragraph>
            <LoadScript
                id="google-maps-script"
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}
            >

                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={initialCenter}
                    zoom={20}
                >
                    <Marker position={markerPosition} />
                </GoogleMap>
            </LoadScript>
        </div>
    </>
}

export default PlaceDetailPage