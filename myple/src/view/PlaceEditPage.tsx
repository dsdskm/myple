import { Button, ConfirmDialog, FixedBottomCTA, Menu, Post, Rating, TextArea, TextField, Toast } from "@toss/tds-mobile"
import { ACCOUNT_TYPE_USER_BASIC, ACCOUNT_TYPE_USER_PRO, ROUTES, TEXT } from "../common/constants"
import { GoogleMap, Marker } from "@react-google-maps/api"
import { useCallback, useEffect, useRef, useState } from "react";
import { dayjsToText, textToDayjs, roundToFour } from "../common/utils";
import { Accuracy, fetchAlbumPhotos, getCurrentLocation } from "@apps-in-toss/web-bridge";
import styled from "styled-components";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { koKR } from '@mui/x-date-pickers/locales'; // MUI X 한국어 텍스트
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/ko';
import { Media, Place } from "../types/place";
import Loading from "./common/Loading";
import { useLocation, useNavigate } from 'react-router-dom';
import { openCamera } from '@apps-in-toss/web-framework';
import { createPlace, deletePlace, getCategory, updatePlace, uploadFiles } from "../service/api";
import { useApp } from "../context/AppContext";

const SIZE_LARGE = 250;
const SIZE_SMALL = 100;

const mapContainerStyle = {
    width: '100%',
    height: '300px',
};

const ImagePreviewContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-left:20px;
`;
const TagItemWrapper = styled.div`
    margin-left:20px;
    display:flex;
    flex-direction:row;
    gap:5px;
`

const TagItem = styled.div`
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.3rem 0.7rem;
    border-radius: 12px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    user-select: none;
`

const ImagePreview = ({ src, id, onClick, onDelete }: ImagePreviewProps) => {
    const [size, setSize] = useState<number>(SIZE_SMALL); // 기본 250px
    const toggleSize = () => {
        setSize((prev) => (prev === SIZE_LARGE ? SIZE_SMALL : SIZE_LARGE));
    };

    return (
        <div
            style={{
                position: 'relative',
                width: size,
                height: size,
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f0f0f0',
            }}
            onClick={() => {
                toggleSize();
                onClick();
            }}
        >
            {/* 실제 이미지 */}
            <img
                src={src}
                alt=""
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />

            {/* 삭제 버튼 (오른쪽 상단) */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation(); // 이미지 클릭 이벤트 방지
                    const confirmDelete = async () => {
                        if (window.confirm(TEXT.MSG_IMAGE_DELETE)) {
                            onDelete(id);
                        }
                    };
                    confirmDelete();
                }}
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    fontSize: '14px',
                    lineHeight: '1',
                    cursor: 'pointer',
                    color: '#fff',
                }}
                title="삭제"
            >
                ×
            </button>
        </div>
    );
};

const ImageDeleteButton = styled.div`
    display:flex;
    padding:20px
`

interface ImagePreviewProps {
    src: string;
    id: string;
    onClick: () => void;
    onDelete: (id: string) => void;
}

interface ToastInfo {
    show: boolean;
    message: string;
}

const PlaceEditPage = () => {
    const { account } = useApp()
    const navigate = useNavigate()
    const location = useLocation();

    const selectedPlace: Place = location.state && location.state.selectedPlace ? location.state.selectedPlace : null
    const isEditMode = selectedPlace ? true : false
    const [name, setName] = useState<string>("")
    const [nameError, setNameError] = useState<boolean>(false)
    const [category, setCategory] = useState<number>(0)
    const [address, setAddress] = useState<string>("")
    const [latitude, setLatitude] = useState<number>(0)
    const [longitude, setLongitude] = useState<number>(0)
    const [memo, setMemo] = useState<string>("")
    const [rating, setRating] = useState<number>(0)
    const [medias, setMedias] = useState<Media[]>([])
    const [tag, setTag] = useState<string[]>([])
    const [tagSet, setTagSet] = useState<Set<string>>(new Set())
    const [inputTag, setInputTag] = useState<string>("#")
    const inputRef = useRef<HTMLInputElement>(null);
    const [pictureFiles, setPictureFiles] = useState<Media[]>([]);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false)
    const [visitDate, setVisitDate] = useState<Dayjs | null>(dayjs(new Date()))
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [toastInfo, setToastInfo] = useState<ToastInfo>({
        show: false,
        message: ""
    })
    const [categoryList, setCategoryList] = useState<{ "id": number, "title": string }[]>([])
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
    const [currentLocation, setCurrentLocation] = useState<number[]>([37.5665, 126.9780])

    useEffect(() => {
        const loadCategories = async () => {
            if (account) {
                const categoryData = await getCategory(account.id)
                if (categoryData) {
                    setCategoryList(categoryData.list)
                }
            }
        }
        loadCategories()

    }, [account])

    useEffect(() => {
        if (isEditMode && selectedPlace) {
            setName(selectedPlace.name)
            setCategory(selectedPlace.category)
            setAddress(selectedPlace.address)
            setLatitude(selectedPlace.latitude)
            setLongitude(selectedPlace.longitude)
            setMemo(selectedPlace.memo)
            setRating(selectedPlace.rating)
            setMedias(selectedPlace.medias)
            setVisitDate(textToDayjs(selectedPlace.visitAt))
            setTagSet(new Set(selectedPlace.tags))
        }
    }, [isEditMode, selectedPlace])

    useEffect(() => {
        const handleGetCurrentLocation = async () => {
            try {
                const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
                setCurrentLocation([response.coords.latitude, response.coords.longitude])
            } catch (error) {
                console.error(error);
            }
        }
        handleGetCurrentLocation()
    }, [])
    const resetAll = () => {
        setName("")
        setCategory(0)
        setAddress("")
        setLatitude(0)
        setLongitude(0)
        setMemo("")
        setRating(0)
        setPictureFiles([])
    }



    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
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
            const newPictures = [...pictureFiles, { fileName: response.id, url: response.dataUri, type: "image" }]
            setPictureFiles(newPictures)
        } catch (error) {
            console.log(error);
        }
    }

    const handlePictureUpload = async () => {
        try {
            const response = await fetchAlbumPhotos({
                maxCount: 10,
                base64: true,
            });
            const mediaFiles: Media[] = response.map(item => ({
                type: "image",
                url: item.dataUri,   // dataUri를 url로 사용
                fileName: item.id,   // id를 fileName으로 사용
            }));

            setPictureFiles(prev => [...prev, ...mediaFiles]);
        } catch (error) {
            console.log(error)
        }
    };

    const nameView = () => {
        return <div>
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
        </div>
    }

    const categoryView = () => {
        const currentCategory = categoryList.filter(c => c.id === category)
        return <div>
            <Post.H3>{TEXT.CATEGORY}</Post.H3>
            <Menu.Trigger
                open={categoryMenuOpen}
                onOpen={() => setCategoryMenuOpen(true)}
                onClose={() => setCategoryMenuOpen(false)}
                placement="bottom"
                dropdown={
                    <Menu.Dropdown header={<Menu.Header>{TEXT.MENU_CHOICE_ITEMS}</Menu.Header>}>
                        {categoryList.map((item) => {
                            const id = item.id
                            const title = item.title
                            return <Menu.DropdownCheckItem
                                key={id}
                                checked={category === id}
                                onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                        setCategory(id)
                                    } else {
                                        return null
                                    }
                                    setCategoryMenuOpen(false)
                                }}
                            >
                                {title}
                            </Menu.DropdownCheckItem>
                        })}
                    </Menu.Dropdown>
                }
            >
                <Button color="light">{currentCategory && currentCategory[0] ? currentCategory[0].title : TEXT.MENU_CATEGORY_CHOICE}</Button>
            </Menu.Trigger >
        </div>
    }

    const mapAddressView = () => {
        return <div>
            <Post.H3>{TEXT.LOCATION}</Post.H3>
            <Post.Paragraph>{TEXT.MSG_LOCATION_GUIDE}</Post.Paragraph>
            <Post.Paragraph>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: currentLocation[0], lng: currentLocation[1] }}
                    zoom={15}
                    onClick={handleMapClick}>
                    {latitude !== 0 && longitude !== 0 && < Marker position={{ lat: latitude, lng: longitude }} />}
                </GoogleMap>
            </Post.Paragraph>
            <div style={{ marginTop: 10 }}></div>
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
        </div>
    }

    const memoView = () => {
        return <div>
            <Post.H3>{TEXT.MEMO}</Post.H3>
            <TextArea
                variant="box"
                placeholder={TEXT.MSG_MEMO}
                minHeight={100}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
            />
        </div>
    }

    const ratingView = () => {
        return <>
            <Post.H3>{TEXT.RATING}</Post.H3>
            <Post.Paragraph>
                <Rating readOnly={false} value={rating} max={5} size="medium" aria-label={TEXT.RATING} onValueChange={setRating} />
            </Post.Paragraph>
        </>
    }

    const imageView = () => {
        return <div>
            <Post.H3>{TEXT.PICTURE}</Post.H3>
            <Button onClick={handleOpenCamera} color="light" style={{ marginBottom: 10 }}>{TEXT.TAKE_PHOTO}</Button>
            <Button onClick={handlePictureUpload} color="light" style={{ marginBottom: 10 }}>{TEXT.GET_POHOTO}</Button>
            <ImagePreviewContainer>
                {medias.map((image: any) => {
                    return <ImagePreview
                        key={image.fileName}
                        src={image.url}
                        id={image.fileName}
                        onClick={() => { }}
                        onDelete={(id) => {
                            if (isEditMode) {
                                setMedias(medias.filter((m: any) => m.fileName !== id));
                            }
                        }}
                    />
                })}
            </ImagePreviewContainer>
            <ImagePreviewContainer style={{ marginTop: 10 }}>
                {pictureFiles.map((image) => {
                    return <ImagePreview
                        key={image.fileName}
                        src={'data:image/jpeg;base64,' + image.url}
                        id={image.fileName}
                        onClick={() => { }}
                        onDelete={(id) => {
                            if (isEditMode) {
                                setPictureFiles(pictureFiles.filter(p => p.fileName !== id));
                            }
                        }}
                    />
                })}
            </ImagePreviewContainer>
        </ div >
    }

    const visitTimeView = () => {
        return <div>
            <Post.H3>{TEXT.VISIT_AT}</Post.H3>
            <div style={{ marginLeft: 20 }} >
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko" localeText={koKR.components.MuiLocalizationProvider.defaultProps.localeText}>
                    <DateTimePicker
                        value={visitDate}
                        onChange={(newValue) => setVisitDate(newValue)}
                    />
                </LocalizationProvider>
            </div>
        </div>
    }

    const tagView = () => {
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            setInputTag(raw);
            if (raw.length > 0 && raw[raw.length - 1] === " " && raw.includes("#")) {
                const candidate = raw.trim().substring(0)
                if (candidate) {
                    setTagSet((prev) => {
                        const next = new Set(prev);
                        next.add(candidate);
                        return next;
                    });

                    setInputTag("#");
                    setTimeout(() => {
                        if (inputRef.current) inputRef.current.focus();
                    }, 0);
                }
            }
        };


        const handleDelete = (tagToDelete: string) => {
            setTagSet((prev) => {
                const next = new Set(prev);
                next.delete(tagToDelete);
                return next;
            });
        };

        return <div>
            <Post.H3>{TEXT.TAG}</Post.H3>
            <TextField
                variant="box"
                ref={inputRef}
                placeholder={TEXT.MSG_TAG_GUIDE}
                value={inputTag}
                onChange={handleInputChange}
                onInput={handleInputChange}
            />

            <TagItemWrapper>
                {Array.from(tagSet).map((tag) => (
                    <TagItem
                        key={tag}
                        onClick={() => handleDelete(tag)}>
                        {tag}
                    </TagItem>
                ))}
            </TagItemWrapper>
        </div>
    }

    const buttonView = () => {
        return <>
            {isEditMode && <ImageDeleteButton>
                <Button color="danger" style={{ width: "100%" }} onClick={() => {
                    setIsDeleteDialogOpen(true)
                }}>{TEXT.DELETE}</Button>
            </ImageDeleteButton>}
            <FixedBottomCTA.Double
                leftButton={<Button style={{ flex: 1 }} onClick={() => {
                    resetAll()
                    navigate(-1)
                }} variant="weak">{TEXT.CANCEL}</Button>}
                rightButton={<Button style={{ flex: 1 }} disabled={nameError} onClick={() => setIsCreateDialogOpen(true)}>{isEditMode ? TEXT.MODIFY : TEXT.CREATE}</Button>}
            />
        </>
    }

    const onDeleteClick = async () => {
        setIsDeleteDialogOpen(false)
        setIsLoading(true)
        await deletePlace(selectedPlace.id)
        setIsLoading(false)
        resetAll()
        navigate(ROUTES.MAP, { replace: true })
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
        } else if (account.type === ACCOUNT_TYPE_USER_BASIC && pictureFiles.length + medias.length > 10) {
            toastInfo.show = true
            toastInfo.message = TEXT.MSG_PICTURES_BASIC
            setToastInfo({ ...toastInfo })
        } else if (account.type === ACCOUNT_TYPE_USER_PRO && pictureFiles.length + medias.length > 30) {
            toastInfo.show = true
            toastInfo.message = TEXT.MSG_PICTURES_PRO
            setToastInfo({ ...toastInfo })
        } else {

            try {
                setIsLoading(true)
                if (isEditMode) {
                    selectedPlace.name = name
                    selectedPlace.category = category
                    selectedPlace.latitude = latitude
                    selectedPlace.latitude = latitude
                    selectedPlace.address = address
                    selectedPlace.memo = memo
                    selectedPlace.rating = rating
                    selectedPlace.visitAt = dayjsToText(visitDate)
                    selectedPlace.updated = dayjsToText(dayjs(new Date()))
                    selectedPlace.medias = medias
                    selectedPlace.tags = Array.from(tagSet)
                    if (pictureFiles.length > 0) {
                        const newMedias: Media[] = await uploadFiles(selectedPlace.id, pictureFiles)
                        selectedPlace.medias = selectedPlace.medias.concat(newMedias)
                    }

                    await updatePlace(selectedPlace.id, selectedPlace)
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
                        visitAt: dayjsToText(visitDate),
                        created: dayjsToText(dayjs(new Date())),
                        updated: dayjsToText(dayjs(new Date())),
                        medias: [],
                        tags: [],
                        creator: account.id,
                    }
                    const result = await createPlace(data)
                    if (result) {
                        const newId = result.id
                        const medias: Media[] = await uploadFiles(newId, pictureFiles)
                        result.medias = medias
                        await updatePlace(newId, result)
                    } else {
                        console.log(`result is null`)
                    }

                }


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
            title={<ConfirmDialog.Title>{isEditMode ? TEXT.MSG_MODIFY_PLACE_CONFIRM : TEXT.MSG_CREATE_PLACE_CONFIRM}</ConfirmDialog.Title>}
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

    const deleteDialog = () => {
        return <ConfirmDialog
            open={isDeleteDialogOpen}
            title={<ConfirmDialog.Title>{TEXT.MSG_DELETE_PLACE_CONFIRM}</ConfirmDialog.Title>}
            cancelButton={
                <ConfirmDialog.CancelButton
                    onClick={() => setIsDeleteDialogOpen(false)}
                >
                    {TEXT.NO}
                </ConfirmDialog.CancelButton>
            }
            confirmButton={
                <ConfirmDialog.ConfirmButton onClick={onDeleteClick}>
                    {TEXT.YES}
                </ConfirmDialog.ConfirmButton>
            }
            onClose={() => setIsDeleteDialogOpen(false)}
        />
    }

    if (isLoading) {
        return <Loading />
    }

    return <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: "10px" }}>
        {nameView()}
        {categoryView()}
        {mapAddressView()}
        {memoView()}
        {ratingView()}
        {imageView()}
        {visitTimeView()}
        {tagView()}
        {buttonView()}
        {createDialog()}
        {deleteDialog()}
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