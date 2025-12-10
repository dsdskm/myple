import { Button, FixedBottomCTA, Menu, Post, Rating, TextArea, TextField } from "@toss/tds-mobile"
import { CATEGORY_LIST, ROUTES, TEXT } from "../common/constants"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { useCallback, useState } from "react";
import { initialCenter } from "./MapPage";
import { formatDateWithDay, roundToFour } from "../common/utils";
import { fetchAlbumPhotos, ImageResponse } from "@apps-in-toss/web-bridge";
import styled from "styled-components";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/ko';
import { Place } from "../types/place";
import Loading from "./common/Loading";
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = {
    width: '100%',
    height: '300px',
};

const ImagePreviewContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const ImagePreview = styled.img`
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
`;

const CommonentWrapper = styled.div`
    margin-left:20px`

const PlaceEditPage = () => {
    const navigate = useNavigate()
    const [name, setName] = useState<string>("")
    const [nameError, setNameError] = useState<boolean>(false)
    const [category, setCategory] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    const [latitude, setLatitude] = useState<number>(0)
    const [longitude, setLongitude] = useState<number>(0)
    const [memo, setMemo] = useState<string>("")
    const [rating, setRating] = useState<number>(0)
    const [pictures, setPictures] = useState<ImageResponse[]>([]);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false)
    const [visitDate, setVisitDate] = useState<Dayjs | null>(dayjs(new Date()))
    const [isLoading, setIsLoading] = useState<boolean>(false)


    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        console.log(`handleMapClick event`, event)
        if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng }, language: 'ko' }, (results, status) => {
                if (status === 'OK') {
                    if (results && results[0]) {
                        console.log(`results`, results)
                        setAddress(results[0].formatted_address)
                        setLatitude(roundToFour(lat))
                        setLongitude(roundToFour(lng))
                    } else {
                        console.log('No results found');
                    }
                } else {
                    console.log('Geocoder failed due to: ' + status);
                }
            });
        }
    }, []);

    const handlePictureUpload = async () => {
        try {
            const response = await fetchAlbumPhotos({
                maxCount: 10,
                base64: true,
            });
            setPictures(prev => [...prev, ...response]);
        } catch (error) {
            console.log(error)
        }
    };

    const categoryView = () => {
        return <CommonentWrapper>
            <Menu.Trigger
                open={categoryMenuOpen}
                onOpen={() => setCategoryMenuOpen(true)}
                onClose={() => setCategoryMenuOpen(false)}
                placement="bottom"
                dropdown={
                    <Menu.Dropdown header={<Menu.Header>{TEXT.MENU_CHOICE_ITEMS}</Menu.Header>}>
                        {CATEGORY_LIST.map((item) => (
                            <Menu.DropdownCheckItem
                                key={item}
                                checked={category === item}
                                onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                        setCategory(item)
                                    } else {
                                        return null
                                    }
                                    setCategoryMenuOpen(false)
                                }}
                            >
                                {item}
                            </Menu.DropdownCheckItem>
                        ))}
                    </Menu.Dropdown>
                }
            >
                <Button color="light">{category ? category : TEXT.MENU_CATEGORY_CHOICE}</Button>
            </Menu.Trigger >
        </CommonentWrapper >
    }

    const imageView = () => {
        return <>
            <Post.H3>{TEXT.PICTURE}</Post.H3>
            <CommonentWrapper>
                <Button onClick={handlePictureUpload} color="light" style={{ marginBottom: '10px' }}>{TEXT.GET_POHOTO}</Button>
                <ImagePreviewContainer>
                    {pictures.map((image) => {
                        const imageUri = 'data:image/jpeg;base64,' + image.dataUri;
                        return <ImagePreview src={imageUri} key={image.id} alt="" />;
                    })}
                </ImagePreviewContainer>
            </CommonentWrapper>
        </>
    }

    const visitTimeView = () => {
        return <>
            <Post.H3>{TEXT.VISIT_AT}</Post.H3>
            <CommonentWrapper>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                    <DateTimePicker
                        value={visitDate}
                        onChange={(newValue) => setVisitDate(newValue)}
                    />
                </LocalizationProvider>
            </CommonentWrapper>
        </>
    }

    const onCreateClick = async () => {
        console.log(`onCreateClick`)
        // 파일 업로드 후에 파일 url을 삽입해야함
        const data: Place = {
            id: "",
            name: name,
            category: category,
            latitude: latitude,
            longitude: longitude,
            address: address,
            memo: memo,
            rating: rating,
            visitAt: formatDateWithDay(visitDate),
            created: formatDateWithDay(dayjs(new Date())),
            updated: formatDateWithDay(dayjs(new Date())),
            medias: [],
            tags: []
        }

        console.log(`pictures`, pictures)
        console.log(`data`, data)

        try {
            setIsLoading(true)
            // const res = await createPlace(data)
            // console.log(res)
        } finally {
            setIsLoading(false)
            navigate(ROUTES.MAP, { replace: true })
        }

    }

    const handleNameError = (value: string) => {
        return value.length > 10;
    };

    if (isLoading) {
        return <Loading />
    }

    return <div style={{ padding: 10 }}>
        <Post.H3>{TEXT.PLACE_NAME}</Post.H3>
        <TextField
            variant="box"
            help={handleNameError(name) ? TEXT.MSG_PLACE_NAME : null}
            placeholder={TEXT.MSG_PLACE_NAME}
            hasError={handleNameError(name)}
            value={name}
            onChange={(e) => {
                const v = e.target.value
                setName(v)
                setNameError(v.length > 10 || v.length === 0)
            }}
        />
        <Post.H3>{TEXT.CATEGORY}</Post.H3>
        {categoryView()}
        <Post.H3>{TEXT.LOCATION}</Post.H3>
        <Post.Paragraph>{TEXT.MSG_LOCATION_GUIDE}</Post.Paragraph>
        <Post.Paragraph>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={initialCenter}
                zoom={15}
                onClick={handleMapClick}>
                {latitude !== 0 && longitude !== 0 && < Marker position={{ lat: latitude, lng: longitude }} />}
            </GoogleMap>
        </Post.Paragraph>
        <Post.H3>{TEXT.ADDRESS}</Post.H3>
        <TextField
            variant="box"
            placeholder={TEXT.MSG_LOCATION_GUIDE}
            value={address}
        />
        <Post.H3>{TEXT.LATITUDE_LONGITUDE}</Post.H3>
        <TextField
            variant="box"
            placeholder={TEXT.MSG_LOCATION_GUIDE}
            value={latitude + ", " + longitude}
        />
        <Post.H3>{TEXT.MEMO}</Post.H3>
        <TextArea
            variant="box"
            placeholder={TEXT.MSG_MEMO}
            minHeight={100}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
        />
        <Post.H3>{TEXT.RATING}</Post.H3>
        <Post.Paragraph>
            <Rating readOnly={false} value={rating} max={5} size="medium" aria-label={TEXT.RATING} onValueChange={setRating} />
        </Post.Paragraph>
        {imageView()}
        {visitTimeView()}
        <FixedBottomCTA.Double
            leftButton={<Button style={{ flex: 1 }} onClick={() => navigate(-1)} variant="weak">{TEXT.CANCEL}</Button>}
            rightButton={<Button style={{ flex: 1 }} disabled={nameError} onClick={onCreateClick}>{TEXT.CREATE}</Button>}
        />
    </div >
}

export default PlaceEditPage