import { Button, ConfirmDialog, FixedBottomCTA, Menu, Post, Rating, TextArea, TextField, Toast } from "@toss/tds-mobile"
import { CATEGORY_LIST, ROUTES, TEXT } from "../common/constants"
import { GoogleMap, Marker } from "@react-google-maps/api"
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
import { Media, Place } from "../types/place";
import Loading from "./common/Loading";
import { useNavigate } from 'react-router-dom';
import { openCamera, OpenCameraPermissionError } from '@apps-in-toss/web-framework';
import { createPlace, updatePlace, uploadFiles } from "../service/api";

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

interface ToastInfo {
    show: boolean;
    message: string;
}

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
    const [toastInfo, setToastInfo] = useState<ToastInfo>({
        show: false,
        message: ""
    })
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

    const resetAll = () => {
        setName("")
        setCategory("")
        setAddress("")
        setLatitude(0)
        setLongitude(0)
        setMemo("")
        setRating(0)
        setPictures([])
    }


    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        console.log(`handleMapClick event`, event)
        if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng }, language: 'ko' }, (results, status) => {
                if (status === 'OK') {
                    if (results && results[0]) {
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

    async function handleOpenCamera() {
        try {
            const base64 = true;
            const response = await openCamera({ base64 });
            const newPictures = [...pictures, { id: response.id, dataUri: response.dataUri }]
            setPictures(newPictures)
        } catch (error) {
            if (error instanceof OpenCameraPermissionError) {
                console.log('권한 에러');
            }
            console.error('사진을 가져오는 데 실패했어요:', error);
        }
    }

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
                <Button onClick={handleOpenCamera} color="light" style={{ marginBottom: '10px' }}>{TEXT.TAKE_PHOTO}</Button>
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
        setIsCreateDialogOpen(false)
        if (!name || name.length === 0) {
            toastInfo.show = true
            toastInfo.message = TEXT.MSG_PLACE_NAME
            setToastInfo({ ...toastInfo })
        } else if (!category) {
            toastInfo.show = true
            toastInfo.message = TEXT.MSG_CATEGORY
            setToastInfo({ ...toastInfo })
        } else {
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

            try {
                setIsLoading(true)
                const res = await createPlace(data)
                const newId = res.id
                const medias: Media[] = await uploadFiles(newId, pictures)
                res.medias = medias
                await updatePlace(newId, res)

            } finally {
                setIsLoading(false)
                resetAll()
                navigate(ROUTES.MAP, { replace: true })
            }
        }


    }

    const handleNameError = (value: string) => {
        return value.length > 10;
    };

    const createDialog = () => {
        return <ConfirmDialog
            open={isCreateDialogOpen}
            title={<ConfirmDialog.Title>{TEXT.MSG_CREATE_PLACE_CONFIRM}</ConfirmDialog.Title>}
            cancelButton={
                <ConfirmDialog.CancelButton
                    onClick={() => setIsCreateDialogOpen(false)}
                >
                    {TEXT.NO}
                </ConfirmDialog.CancelButton>
            }
            confirmButton={
                <ConfirmDialog.ConfirmButton onClick={onCreateClick}>
                    {TEXT.YES}
                </ConfirmDialog.ConfirmButton>
            }
            onClose={() => setIsCreateDialogOpen(false)}
        />
    }

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
            leftButton={<Button style={{ flex: 1 }} onClick={() => {
                resetAll()
                navigate(-1)
            }} variant="weak">{TEXT.CANCEL}</Button>}
            rightButton={<Button style={{ flex: 1 }} disabled={nameError} onClick={() => setIsCreateDialogOpen(true)}>{TEXT.CREATE}</Button>}
        />
        {createDialog()}
        <Toast
            position="bottom"
            open={toastInfo.show}
            text={toastInfo.message}
            duration={3000}
            onClose={() => {
                toastInfo.show = false
                setToastInfo({ ...toastInfo })
            }}
        />
    </div >
}

export default PlaceEditPage