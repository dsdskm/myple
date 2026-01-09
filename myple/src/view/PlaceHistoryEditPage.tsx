import styled from "styled-components"
import { useLocation, useNavigate } from "react-router-dom"
import { Media, Place, PlaceHistory } from "../types/place"
import { useEffect, useRef, useState } from "react"
import { AlertDialog, Button, ConfirmDialog, FixedBottomCTA, Paragraph, Post, Rating, TextArea, TextField, Toast } from "@toss/tds-mobile"
import { NETWORK_STATUS, PERMISSIONS, TEXT } from "../common/constants"
import { fetchAlbumPhotos, getNetworkStatus, openCamera } from "@apps-in-toss/web-framework"
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs, { Dayjs } from "dayjs"
import { koKR } from "@mui/x-date-pickers/locales"
import Loading from "./common/Loading"
import { dayjsToText, textToDayjs } from "../common/utils"
import { createPlaceHistory, deletePlaceHistory, getProductInfo, updatePlaceHistory, uploadFiles } from "../service/api"
import ImagePreview, { ImagePreviewContainer } from "./common/ImagePreview"
import { ToastInfo } from "../types/toast"
import { useApp } from "../context/AppContext"
import { Product } from "../types/product"
import { BottomButtonWrapper, PageWrapper } from "./PlaceEditPage"

const TagWrapper = styled.div`
    display:flex;
    flex-direction:row;
    gap:5px;
`

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

const FixedHeader = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    height:80px;
    width: 100%;
    background-color: white;
    display:flex;
    flex-direction:column;
    z-index: 1000;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0,0, 0.1);
`;

const PlaceHistoryEditPage = () => {
    const { account } = useApp()
    const navigate = useNavigate()
    const location = useLocation();

    const selectedPlace: Place = (location.state && location.state.selectedPlace) || ""
    const selectedPlaceHistory: PlaceHistory = (location.state && location.state.selectedPlaceHistory) || ""
    const isEditMode = selectedPlaceHistory ? true : false
    const categoryText = (location.state && location.state.categoryText) || ""

    const [name] = useState<string>(selectedPlace.name)
    const [address] = useState<string>(selectedPlace.address)
    const [memo, setMemo] = useState<string>(selectedPlaceHistory.memo)
    const [rating, setRating] = useState<number>(selectedPlaceHistory.rating || 0)
    const [pictureFiles, setPictureFiles] = useState<Media[]>([]);
    const [medias, setMedias] = useState<Media[]>(selectedPlaceHistory.medias)
    const [visitDate, setVisitDate] = useState<Dayjs | null>(textToDayjs(selectedPlaceHistory.visitAt) || dayjs(new Date()))
    const [inputTag, setInputTag] = useState<string>("")
    const [tagSet, setTagSet] = useState<Set<string>>(new Set(selectedPlaceHistory.tags) || new Set())
    const inputRef = useRef<HTMLInputElement>(null);
    const [product, setProduct] = useState<Product | null>()

    const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
    const [toast, setToast] = useState<ToastInfo>({
        show: false,
        message: ""
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        const loadProductInfo = async () => {
            const result = await getProductInfo(account.id)
            setProduct(result)
        }

        const load = async () => {
            const networkStatus = await getNetworkStatus();
            if (networkStatus !== NETWORK_STATUS.OFFLINE && networkStatus !== NETWORK_STATUS.UNKNOWN && networkStatus !== NETWORK_STATUS.WWAN) {
                loadProductInfo()
            } else {
                setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR })
            }
        }
        if (account) {
            load()
        }

    }, [account])

    const memoView = () => {
        return <>
            <Post.H3>{TEXT.MEMO}</Post.H3>
            <TextArea
                variant="box"
                placeholder={TEXT.MSG_MEMO}
                minHeight={20}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
            />
        </>
    }

    const ratingView = () => {
        return <>
            <Post.H3>{TEXT.RATING}</Post.H3>
            <Post.Paragraph>
                <Rating readOnly={false} value={rating} max={5} size="medium" aria-label={TEXT.RATING} onValueChange={setRating} />
            </Post.Paragraph>
        </>
    }

    async function handleOpenCamera() {
        try {
            const cameraPermission = await openCamera.getPermission()
            if (cameraPermission === PERMISSIONS.ALLOWED) {
                const base64 = true;
                const response = await openCamera({ base64 });
                const newPictures = [...pictureFiles, { fileName: response.id, url: response.dataUri, type: "image" }]
                setPictureFiles(newPictures)
            } else {
                const cameraPermission = await openCamera.openPermissionDialog()
                console.log(`cameraPermission ${cameraPermission}`)
            }


        } catch (error) {
            console.log(error);
        }
    }

    const handlePictureUpload = async () => {
        try {
            const photoPermission = await fetchAlbumPhotos.getPermission()
            if (photoPermission === PERMISSIONS.ALLOWED) {
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
            } else {
                const photoPermission = await fetchAlbumPhotos.openPermissionDialog()
                console.log(`photoPermission ${photoPermission}`)
            }
        } catch (error) {
            console.log(error)
        }
    };

    const imageView = () => {
        return <>
            <Post.H3>{TEXT.PICTURE}</Post.H3>
            <Button onClick={handleOpenCamera} color="light" style={{ marginBottom: 10 }}>{TEXT.TAKE_PHOTO}</Button>
            <Button onClick={handlePictureUpload} color="light" style={{ marginBottom: 10 }}>{TEXT.GET_POHOTO}</Button>
            <ImagePreviewContainer>
                {medias && medias.map((image: any) => {
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
                            setPictureFiles(pictureFiles.filter(p => p.fileName !== id));
                        }}
                    />
                })}
            </ImagePreviewContainer>
        </>
    }

    const tagView = () => {
        const handleInputChange = (raw: string) => {
            setInputTag(raw);
            if (raw.length > 0 && raw[raw.length - 1] === " " && raw.includes("#")) {
                const candidate = raw.trim().substring(0)
                if (candidate) {
                    setTagSet((prev) => {
                        const next = new Set(prev);
                        next.add(candidate);
                        return next;
                    });

                    setInputTag("");
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

        return <>
            <Post.H3>{TEXT.TAG}</Post.H3>
            <TagWrapper>
                <TextField
                    variant="box"
                    ref={inputRef}
                    placeholder={TEXT.MSG_TAG_GUIDE}
                    value={inputTag}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
                <Button size="small" color="light" onClick={() => { handleInputChange(inputTag + " ") }}>{TEXT.ADD}</Button>
            </TagWrapper>

            <TagItemWrapper>
                {Array.from(tagSet).map((tag) => (
                    <TagItem
                        key={tag}
                        onClick={() => handleDelete(tag)}>
                        {tag}
                    </TagItem>
                ))}
            </TagItemWrapper>
        </>
    }

    const visitTimeView = () => {
        return <>
            <Post.H3>{TEXT.VISIT_AT}</Post.H3>
            <div style={{ marginLeft: 20 }} >
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko" localeText={koKR.components.MuiLocalizationProvider.defaultProps.localeText}>
                    <DateTimePicker
                        value={visitDate}
                        onChange={(newValue) => setVisitDate(newValue)}
                    />
                </LocalizationProvider>
            </div>
        </>
    }

    const onCreateClick = async () => {
        setCreateDialogOpen(false)
        const networkStatus = await getNetworkStatus();
        if (networkStatus === NETWORK_STATUS.OFFLINE || networkStatus === NETWORK_STATUS.UNKNOWN || networkStatus === NETWORK_STATUS.WWAN) {
            setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR })
            return
        }
        if (isEditMode) {
            if (product && (medias.length + pictureFiles.length) > product.place_history_photo_limit) {
                setToast({ show: true, message: `최대 ${product.place_history_photo_limit}개 까지 사진 추가가 가능합니다.` })
                return
            }
        } else {
            if (product && pictureFiles.length > product.place_history_photo_limit) {
                setToast({ show: true, message: `최대 ${product.place_history_photo_limit}개 까지 사진 추가가 가능합니다.` })
                return
            }
        }

        if (memo && memo.length > 50) {
            setToast({ show: true, message: TEXT.MSG_MEMO })
        } else {
            try {
                setIsLoading(true)
                if (isEditMode) {
                    selectedPlaceHistory.memo = memo
                    selectedPlaceHistory.rating = rating
                    selectedPlaceHistory.tags = Array.from(tagSet)
                    selectedPlaceHistory.medias = medias
                    selectedPlaceHistory.updated = dayjsToText(dayjs(new Date()))
                    selectedPlaceHistory.visitAt = dayjsToText(visitDate)
                    if (pictureFiles.length > 0) {
                        const newMedias: Media[] = await uploadFiles(selectedPlaceHistory.placeId, selectedPlaceHistory.id, pictureFiles)
                        selectedPlaceHistory.medias = selectedPlaceHistory.medias.concat(newMedias)
                    }
                    await updatePlaceHistory(selectedPlaceHistory.id, selectedPlaceHistory)
                } else {
                    const data: PlaceHistory = {
                        id: "",
                        placeId: selectedPlace.id,
                        memo: memo,
                        rating: rating,
                        visitAt: dayjsToText(visitDate),
                        tags: Array.from(tagSet),
                        medias: [],
                        created: "",
                        updated: ""
                    }
                    const result = await createPlaceHistory(data)
                    if (result && pictureFiles) {
                        const newId = result.id
                        const medias: Media[] = await uploadFiles(data.placeId, newId, pictureFiles)
                        result.medias = medias
                        await updatePlaceHistory(newId, result)
                    }
                }
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
                setAlertDialogOpen(true)
            }
        }
    }

    const onDeleteClick = async () => {
        setDeleteDialogOpen(false)
        setIsLoading(true)
        await deletePlaceHistory(selectedPlaceHistory.placeId, selectedPlaceHistory.id)
        setIsLoading(false)
        setAlertDialogOpen(true)
    }

    const createDialog = () => {
        return <ConfirmDialog
            open={createDialogOpen}
            title={<ConfirmDialog.Title>{isEditMode ? TEXT.MSG_MODIFY_PLACE_HISTORY_CONFIRM : TEXT.MSG_CREATE_PLACE_HISTORY_CONFIRM}</ConfirmDialog.Title>}
            cancelButton={
                <ConfirmDialog.CancelButton
                    onClick={() => setCreateDialogOpen(false)}
                >
                    {TEXT.NO}
                </ConfirmDialog.CancelButton>
            }
            confirmButton={
                <ConfirmDialog.ConfirmButton onClick={onCreateClick}>
                    {TEXT.YES}
                </ConfirmDialog.ConfirmButton>
            }
            onClose={() => setCreateDialogOpen(false)}
        />
    }
    const deleteDialog = () => {
        return <ConfirmDialog
            open={deleteDialogOpen}
            title={<ConfirmDialog.Title>{TEXT.MSG_DELETE_PLACE_HISTORY_CONFIRM}</ConfirmDialog.Title>}
            cancelButton={
                <ConfirmDialog.CancelButton
                    onClick={() => setDeleteDialogOpen(false)}
                >
                    {TEXT.NO}
                </ConfirmDialog.CancelButton>
            }
            confirmButton={
                <ConfirmDialog.ConfirmButton onClick={onDeleteClick}>
                    {TEXT.YES}
                </ConfirmDialog.ConfirmButton>
            }
            onClose={() => setDeleteDialogOpen(false)}
        />
    }

    const alertDialog = () => {
        return <AlertDialog
            open={alertDialogOpen}
            title={<AlertDialog.Title>{TEXT.MSG_COMPLETED}</AlertDialog.Title>}
            alertButton={<AlertDialog.AlertButton onClick={() => {
                setAlertDialogOpen(false)
                navigate(-1)
            }}>{TEXT.OK}</AlertDialog.AlertButton>}
            onClose={() => {
                setAlertDialogOpen(false)
            }

            } />
    }
    const buttonView = () => {

        return <>
            {isEditMode && <BottomButtonWrapper>
                <Button size="medium" color="danger" style={{ width: "85%" }} onClick={() => {
                    setDeleteDialogOpen(true)
                }}>{TEXT.PLACE_HISTORY_DELETE}</Button>
            </BottomButtonWrapper>}
            <FixedBottomCTA.Double
                leftButton={<Button style={{ flex: 1 }} onClick={() => {
                    navigate(-1)
                }} variant="weak">{TEXT.CANCEL}</Button>}
                rightButton={<Button style={{ flex: 1 }} onClick={() => setCreateDialogOpen(true)}>{isEditMode ? TEXT.MODIFY : TEXT.CREATE}</Button>}
            />
        </>
    }

    if (isLoading) {
        return <Loading />
    }

    return <PageWrapper>
        <FixedHeader>
            <Paragraph.Text>{name} / {categoryText}</Paragraph.Text>
            <Paragraph.Text>{address}</Paragraph.Text>
        </FixedHeader>
        <div style={{ height: 80 }} />
        {memoView()}
        {ratingView()}
        {imageView()}
        {visitTimeView()}
        {tagView()}
        {buttonView()}
        {createDialog()}
        {deleteDialog()}
        {alertDialog()}
        <Toast
            position="bottom"
            open={toast.show}
            text={toast.message}
            duration={2000}
            onClose={() => {
                setToast({ show: false, message: "" })
            }}
        />
    </PageWrapper>
}

export default PlaceHistoryEditPage