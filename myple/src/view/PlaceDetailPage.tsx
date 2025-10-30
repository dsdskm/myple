import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { Button, ConfirmDialog, FixedBottomCTA, IconButton, Post, Rating, } from "@toss/tds-mobile"
import { useEffect, useState } from "react";
import { formatDate } from "../common/utils";
import styled from "styled-components";
import { TEXT } from "../common/constants";

/**
 * 장소 이름
 * 카테고리
 * 주소
 * 위도, 경도 + 지도
 * 메모
 * 별점
 * 방문 날짜
 * 생성 날짜
 * 사진 / 영상(TBD)
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
    visitAt: "2025-10-14 14:00",
    created: "2025-10-11 14:00",
    pictures: [],
    videos: [],
    tags: []
}

const mapContainerStyle = {
    width: '100%',
    height: '300px',
};

const TopButtonArea = styled.div`
    display:flex;
    justify-content:flex-end;
    align-items:center;
`;

const PlaceDetailPage = () => {
    const initialCenter = {
        lat: SAMPLE_DATA.latitude,
        lng: SAMPLE_DATA.longitude,
    }

    const [markerPosition, setMarkerPosition] = useState(initialCenter)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
    useEffect(() => {
        const lat = SAMPLE_DATA.latitude
        const lng = SAMPLE_DATA.longitude
        setMarkerPosition({ lat: lat, lng: lng })
    }, [])

    const handleShareClick = () => {

    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true)
    };

    const deleteDialog = () => {

        return (
            <ConfirmDialog
                open={isDeleteDialogOpen}
                title={<ConfirmDialog.Title>{TEXT.MSG_DELETE_CONFORM}</ConfirmDialog.Title>}
                cancelButton={<ConfirmDialog.CancelButton onClick={() => setIsDeleteDialogOpen(false)}>{TEXT.NO}</ConfirmDialog.CancelButton>}
                confirmButton={<ConfirmDialog.ConfirmButton onClick={() => setIsDeleteDialogOpen(false)}>{TEXT.YES}</ConfirmDialog.ConfirmButton>}
                onClose={() => setIsDeleteDialogOpen(false)}
            />
        );
    }

    return <>
        <div style={{ padding: 10 }}>
            <TopButtonArea>
                <IconButton onClick={handleShareClick} src="/share.png" aria-label={TEXT.SHARE} />
                <IconButton onClick={handleDeleteClick} src="/delete.png" aria-label={TEXT.DELETE} />
            </TopButtonArea>

            <Post.H3>{TEXT.PLACE_NAME}</Post.H3>
            <Post.Paragraph>{SAMPLE_DATA.name}</Post.Paragraph>
            <Post.H3>{TEXT.LOCATION}</Post.H3>
            <Post.Paragraph>
                <LoadScript
                    id="google-maps-script"
                    googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}
                >
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={initialCenter}
                        zoom={20}
                    >
                        {/* 더미 마커 */}
                        <Marker position={{ lat: 0, lng: 0 }} />
                        <Marker position={markerPosition} />
                    </GoogleMap>
                </LoadScript>
            </Post.Paragraph>
            <Post.H3>{TEXT.LATITUDE_LONGITUDE}</Post.H3>
            <Post.Paragraph>{SAMPLE_DATA.latitude},{SAMPLE_DATA.longitude}</Post.Paragraph>
            <Post.H3>{TEXT.ADDRESS}</Post.H3>
            <Post.Paragraph>{SAMPLE_DATA.address}</Post.Paragraph>
            <Post.H3>{TEXT.MEMO}</Post.H3>
            <Post.Paragraph>{SAMPLE_DATA.memo}</Post.Paragraph>
            <Post.H3>{TEXT.RATING}</Post.H3>
            <Post.Paragraph>
                <Rating readOnly={true} value={SAMPLE_DATA.rating} max={5} size="medium" variant="iconOnly" aria-label={TEXT.RATING} />
            </Post.Paragraph>
            <Post.H3>{TEXT.VISIT_AT}</Post.H3>
            <Post.Paragraph>{formatDate(SAMPLE_DATA.visitAt)}</Post.Paragraph>
            <Post.H3>{TEXT.CREATED}</Post.H3>
            <Post.Paragraph>{formatDate(SAMPLE_DATA.created)}</Post.Paragraph>
            <FixedBottomCTA.Double
                leftButton={<Button style={{ flex: 1 }}>{TEXT.MODIFY}</Button>}
                rightButton={<Button style={{ flex: 1 }}>{TEXT.OK}</Button>}
            />
        </div>
        {deleteDialog()}
    </>
}

export default PlaceDetailPage