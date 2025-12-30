import styled from "styled-components"
import { useApp } from "../context/AppContext"
import { useLocation, useNavigate } from "react-router-dom"
import { Media, Place, PlaceHistory } from "../types/place"
import { useRef, useState } from "react"
import { AlertDialog, Border, Button, ConfirmDialog, FixedBottomCTA, Paragraph, Post, Rating, TextArea, TextField } from "@toss/tds-mobile"
import { TEXT } from "../common/constants"
import { fetchAlbumPhotos, openCamera } from "@apps-in-toss/web-framework"
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs, { Dayjs } from "dayjs"
import { koKR } from "@mui/x-date-pickers/locales"
import Loading from "./common/Loading"
import { dayjsToText } from "../common/utils"
import { createPlaceHistory, updatePlaceHistory, uploadFiles } from "../service/api"

const PageWrapper = styled.div`
    padding: 10px;
    display: flex;
    flex-direction:column;
    gap: 10px;
    padding:20px;
`
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

interface ImagePreviewProps {
    src: string;
    id: string;
    onClick: () => void;
    onDelete: (id: string) => void;
}


const SIZE_LARGE = 250;
const SIZE_SMALL = 100;
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

interface ToastInfo {
    show: boolean;
    message: string;
}

const PlaceHistoryEditPage = () => {
    const { account } = useApp()
    const navigate = useNavigate()
    const location = useLocation();

    const selectedPlace: Place = location.state && location.state.selectedPlace || ""
    const selectedPlaceHistory: PlaceHistory = location.state && location.state.selectedPlaceHistory || ""
    const isEditMode = selectedPlaceHistory ? true : false
    const categoryText = location.state && location.state.categoryText || ""

    const [name, setName] = useState<string>(selectedPlace.name)
    const [category, setCategory] = useState<string>(categoryText)
    const [address, setAddress] = useState<string>(selectedPlace.address)
    const [memo, setMemo] = useState<string>("")
    const [rating, setRating] = useState<number>(0)
    const [pictureFiles, setPictureFiles] = useState<Media[]>([]);
    const [medias, setMedias] = useState<Media[]>([])
    const [visitDate, setVisitDate] = useState<Dayjs | null>(dayjs(new Date()))
    const [inputTag, setInputTag] = useState<string>("#")
    const [tagSet, setTagSet] = useState<Set<string>>(new Set())
    const inputRef = useRef<HTMLInputElement>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [toastInfo, setToastInfo] = useState<ToastInfo>({
        show: false,
        message: ""
    })
    const memoView = () => {
        return <div>
            <Post.H3>{TEXT.MEMO}</Post.H3>
            <TextArea
                variant="box"
                placeholder={TEXT.MSG_MEMO}
                minHeight={20}
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
                            setPictureFiles(pictureFiles.filter(p => p.fileName !== id));
                        }}
                    />
                })}
            </ImagePreviewContainer>
        </ div >
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

    const onCreateClick = async () => {
        setCreateDialogOpen(false)
        if (memo && memo.length > 50) {
            toastInfo.show = true
            toastInfo.message = TEXT.MSG_MEMO
            setToastInfo({ ...toastInfo })
        } else {
            try {
                setIsLoading(true)
                if (isEditMode) {

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
        <Paragraph.Text>{name} / {categoryText}</Paragraph.Text>
        <Paragraph.Text>{address}</Paragraph.Text>

        <Border variant="full" style={{ width: "100%", backgroundColor: "black" }} color="black" />
        {memoView()}
        {ratingView()}
        {imageView()}
        {visitTimeView()}
        {tagView()}
        {buttonView()}
        {createDialog()}
        {alertDialog()}
    </PageWrapper>
}

export default PlaceHistoryEditPage