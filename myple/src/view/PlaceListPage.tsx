import { useNavigate } from "react-router-dom"
import BottomTabBar from "./BottomTabBar"
import { useApp } from "../context/AppContext"
import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { Media, Place, PlaceHistory } from "../types/place"
import { getCategory, getPlaces } from "../service/api"
import { Button, IconButton, ListHeader, Menu, Post, Rating, SearchField, Text } from "@toss/tds-mobile"
import styled from 'styled-components';
import { ROUTES, TEXT } from "../common/constants"
import { parseKoreanDateTime } from "../common/utils"
import ImagePreview, { ImagePreviewContainer } from "./common/ImagePreview"


const MenuWrapper = styled.div`
    display:flex;
    gap:10px;
    align-items:center;
    justify-content:flex-start;
    margin-left:10px;
`

const ListWrapper = styled.div`
    padding-bottom:100px;
`

const ListTitleWrapper = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:flex-start;
    width:100%;
`
const ListRightWrapper = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:flex-end;
`

const ListDescriptionWrapper = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:flex-start;
`
const MENU_SORT_NAME_DESC = 1;
const MENU_SORT_NAME_ASC = 2;
const MENU_SORT_RECENT_RATING_DESC = 3;
const MENU_SORT_RECENT_RATING_ASC = 4;
const MENU_SORT_RECENT_VISIT_DESC = 5;
const MENU_SORT_RECENT_VISIT_ASC = 6;
const MENU_SORT_RECENT_VISIT_COUNT_DESC = 7;
const MENU_SORT_RECENT_VISIT_COUNT_ASC = 8;

const MENU_CATEGORY_ALL = 1;

const PlaceListPage = () => {
    const navigate = useNavigate()
    const { account } = useApp()
    const [originList, setOriginList] = useState<Place[]>([])
    const [originMap, setOriginMap] = useState<Map<string, Place>>(new Map())
    const [originHistoryList, setOriginHistoryList] = useState<PlaceHistory[]>([])
    const [filteredList, setFilteredList] = useState<Place[]>([])
    const [filteredHistoryList, setFilteredHistoryList] = useState<PlaceHistory[]>([])
    const [categoryMap, setCategoryMap] = useState<Map<number, string>>()
    const [sortMenuOpen, setSortMenuOpen] = useState<boolean>(false)
    const [sortMenu, setSortMenu] = useState<number>(MENU_SORT_NAME_DESC)
    const [currentSort, setCurrentSort] = useState<string>(TEXT.MENU_SORT_NAME_DESC)
    const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false)
    const [currentCategoryId, setCurrentCategoryId] = useState<number>(MENU_CATEGORY_ALL)
    const [currentCategoryText, setCurrentCategory] = useState<string>(TEXT.CATEGORY_ALL)
    const [targSearching, setTagSearching] = useState<boolean>(false)

    useEffect(() => {
        const loadPlaces = async () => {
            if (account) {
                const list = await getPlaces(account.id)
                setOriginList(list)
                setFilteredList(list)
                let historyList: PlaceHistory[] = []
                let map: Map<string, Place> = new Map()
                list.forEach((p) => {
                    map.set(p.id, p)
                    historyList = historyList.concat(p.historyList)
                })
                setOriginHistoryList(historyList)
                setOriginMap(map)
                setFilteredHistoryList([])
            }
        }
        const loadCategories = async () => {
            if (account) {
                const categoryData = await getCategory(account.id)
                if (categoryData) {
                    const map = new Map<number, string>()
                    categoryData.list.forEach((c, index) => {
                        map.set(c.id, c.title)
                    })
                    setCategoryMap(map)
                }
            }
        }

        loadPlaces()
        loadCategories()

    }, [account])

    const sortedFilteredList = useMemo(() => {
        const list = [...filteredList];
        return list.filter(a => {
            if (currentCategoryId === MENU_CATEGORY_ALL || currentCategoryId === a.category) {
                return true
            } else {
                return false
            }
        }).sort((a, b) => {
            if (sortMenu === MENU_SORT_NAME_DESC) return a.name > b.name ? 1 : -1;
            if (sortMenu === MENU_SORT_NAME_ASC) return a.name < b.name ? 1 : -1;
            if (sortMenu === MENU_SORT_RECENT_RATING_DESC
                || sortMenu === MENU_SORT_RECENT_RATING_DESC
                || sortMenu === MENU_SORT_RECENT_RATING_ASC
                || sortMenu === MENU_SORT_RECENT_VISIT_DESC
                || sortMenu === MENU_SORT_RECENT_VISIT_ASC) {
                if (a.historyList.length > 0 && b.historyList.length === 0) {
                    return 1
                } else if (a.historyList.length === 0 && b.historyList.length > 0) {
                    return 1
                } else if (a.historyList.length === 0 && b.historyList.length === 0) {
                    return 1
                } else {
                    if (sortMenu === MENU_SORT_RECENT_RATING_DESC) {
                        return a.historyList[0].rating > b.historyList[0].rating ? -1 : 1
                    }
                    if (sortMenu === MENU_SORT_RECENT_RATING_ASC) {
                        return a.historyList[0].rating < b.historyList[0].rating ? -1 : 1
                    }
                    if (sortMenu === MENU_SORT_RECENT_VISIT_DESC) {
                        return parseKoreanDateTime(a.historyList[0].visitAt).isBefore(b.historyList[0].visitAt) ? -1 : 1
                    }
                    if (sortMenu === MENU_SORT_RECENT_VISIT_ASC) {
                        return parseKoreanDateTime(a.historyList[0].visitAt).isBefore(b.historyList[0].visitAt) ? 1 : -1
                    }
                }

            };

            if (sortMenu === MENU_SORT_RECENT_VISIT_COUNT_DESC) {
                return a.historyList.length > b.historyList.length ? -1 : 1
            }
            if (sortMenu === MENU_SORT_RECENT_VISIT_COUNT_ASC) {
                return a.historyList.length < b.historyList.length ? -1 : 1
            }
            return a.name > b.name ? 1 : -1;
        });
    }, [sortMenu, currentCategoryId, filteredList]);   // menu 혹은 filteredList 가 바뀔 때만 재계산

    const onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value
        let list: Place[] = [];
        let historyList: PlaceHistory[] = []
        if (text && text.length > 0) {
            // #로 시작할때는 방문 내역 검색
            // 글자로 시작할때는 장소 검색
            if (text.startsWith("#")) {
                historyList = originHistoryList.filter((history) => {
                    let isInclude = false
                    history.tags.forEach((tag) => {
                        if (tag.includes(text)) {
                            isInclude = true
                        }
                    })
                    return isInclude
                })
                setTagSearching(true)
                setFilteredList([])
                setFilteredHistoryList(historyList)
            } else {
                list = originList.filter((place) =>
                    place.name.includes(text) || text.includes(place.name)
                )
                setTagSearching(false)
                setFilteredList(list)
                setFilteredHistoryList([])
            }

        } else {
            list = [...originList]
            historyList = [...originHistoryList]
            setTagSearching(false)
            setFilteredList(list)
            setFilteredHistoryList([])
        }

    }

    const filteringView = () => {
        const onSortMenuChange = (number: number, order: string) => {
            setSortMenu(number)
            setCurrentSort(order)
            setSortMenuOpen(false)
        }

        const onFilteringMenuChange = (number: number, category: string = "") => {
            setCurrentCategoryId(number)
            setCurrentCategory(category)
            setCategoryMenuOpen(false)
        }
        return (
            <div>
                {!targSearching && <MenuWrapper>
                    {categoryMap && <Menu.Trigger
                        open={categoryMenuOpen}
                        onOpen={() => setCategoryMenuOpen(true)}
                        onClose={() => setCategoryMenuOpen(false)}
                        placement="bottom-end"
                        dropdown={
                            <Menu.Dropdown header={<Menu.Header>{TEXT.MSG_CATEGORY_FILTERING_MENU}</Menu.Header>}>
                                <Menu.DropdownCheckItem
                                    checked={MENU_CATEGORY_ALL === currentCategoryId}
                                    onCheckedChange={(checked: boolean) => {
                                        onFilteringMenuChange(MENU_CATEGORY_ALL, TEXT.CATEGORY_ALL)
                                    }}
                                >
                                    {TEXT.CATEGORY_ALL}
                                </Menu.DropdownCheckItem>
                                {Array.from(categoryMap).map((obj) => {
                                    const id = obj[0]
                                    const text = obj[1]
                                    return <Menu.DropdownCheckItem
                                        checked={id === currentCategoryId}
                                        onCheckedChange={(checked: boolean) => {
                                            onFilteringMenuChange(id, text)
                                        }}
                                    >
                                        {text}
                                    </Menu.DropdownCheckItem>
                                })}
                            </Menu.Dropdown>
                        }
                    >
                        <Button size="small">{currentCategoryText}</Button>
                    </Menu.Trigger>}


                    <Menu.Trigger
                        open={sortMenuOpen}
                        onOpen={() => setSortMenuOpen(true)}
                        onClose={() => setSortMenuOpen(false)}
                        placement="bottom-end"
                        dropdown={
                            <Menu.Dropdown header={<Menu.Header>{TEXT.MSG_SORTING_MENU}</Menu.Header>}>
                                {/* 이름 */}
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_NAME_DESC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_NAME_DESC, TEXT.MENU_SORT_NAME_DESC)}
                                >
                                    {TEXT.MENU_SORT_NAME_DESC}
                                </Menu.DropdownCheckItem>
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_NAME_ASC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_NAME_ASC, TEXT.MENU_SORT_NAME_ASC)}
                                >
                                    {TEXT.MENU_SORT_NAME_ASC}
                                </Menu.DropdownCheckItem>
                                {/* 최근 평점 */}
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RECENT_RATING_DESC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RECENT_RATING_DESC, TEXT.MENU_SORT_RECENT_RATING_DESC)}
                                >
                                    {TEXT.MENU_SORT_RECENT_RATING_DESC}
                                </Menu.DropdownCheckItem>
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RECENT_RATING_ASC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RECENT_RATING_ASC, TEXT.MENU_SORT_RECENT_RATING_ASC)}
                                >
                                    {TEXT.MENU_SORT_RECENT_RATING_ASC}
                                </Menu.DropdownCheckItem>
                                {/* 최근 방문일 */}
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RECENT_VISIT_DESC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RECENT_VISIT_DESC, TEXT.MENU_SORT_RECENT_VISIT_DESC)}
                                >
                                    {TEXT.MENU_SORT_RECENT_VISIT_DESC}
                                </Menu.DropdownCheckItem>
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RECENT_VISIT_ASC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RECENT_VISIT_ASC, TEXT.MENU_SORT_RECENT_VISIT_ASC)}
                                >
                                    {TEXT.MENU_SORT_RECENT_VISIT_ASC}
                                </Menu.DropdownCheckItem>
                                {/* 총 방문 횟수 */}
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RECENT_VISIT_COUNT_DESC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RECENT_VISIT_COUNT_DESC, TEXT.MENU_SORT_RECENT_VISIT_COUNT_DESC)}
                                >
                                    {TEXT.MENU_SORT_RECENT_VISIT_COUNT_DESC}
                                </Menu.DropdownCheckItem>
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RECENT_VISIT_COUNT_ASC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RECENT_VISIT_COUNT_ASC, TEXT.MENU_SORT_RECENT_VISIT_COUNT_ASC)}
                                >
                                    {TEXT.MENU_SORT_RECENT_VISIT_COUNT_ASC}
                                </Menu.DropdownCheckItem>
                            </Menu.Dropdown>
                        }
                    >
                        <Button size="small">{currentSort}</Button>
                    </Menu.Trigger>
                </MenuWrapper>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {!targSearching && <Post.H4>총 {sortedFilteredList.length}개 장소</Post.H4>}
                    {targSearching && <Post.H4>총 {sortedFilteredList.length}개 방문 내역</Post.H4>}
                </div>
            </div>
        );
    }

    const historyListView = () => {
        return <>{categoryMap && <ListWrapper>
            {filteredHistoryList.map((placeHistory: PlaceHistory) => {
                const place = originMap.get(placeHistory.placeId)
                if (!place) {
                    return <></>
                }
                const categoryText = categoryMap.get(place.category)
                return <>
                    <ListHeader onClick={() => {
                        navigate(ROUTES.PLACE_HISTORY_EDIT, {
                            state: {
                                selectedPlace: place,
                                selectedPlaceHistory: placeHistory,
                                categoryText: categoryText
                            }
                        })
                    }}
                        title={
                            <ListTitleWrapper>
                                <ListHeader.TitleParagraph typography="t5" fontWeight="bold">
                                    {place.name}
                                </ListHeader.TitleParagraph>
                                <ListHeader.DescriptionParagraph>{categoryText}</ListHeader.DescriptionParagraph>
                            </ListTitleWrapper>

                        }
                        right={
                            <ListRightWrapper>
                                <IconButton src="/tab_map.png" variant="clear" aria-label={TEXT.LOCATION} onClick={
                                    (e) => {
                                        navigate(ROUTES.MAP, {
                                            state: {
                                                selectedPlace: place
                                            }
                                        })
                                        e.stopPropagation()
                                    }
                                } />
                                <Rating readOnly={true} value={placeHistory.rating} max={placeHistory.rating} size="medium" variant="iconOnly" aria-label={TEXT.RATING} />
                            </ListRightWrapper>
                        }
                        description={
                            <>
                                <ImagePreviewContainer>
                                    {placeHistory.medias.map((image: any, index: number) => {
                                        return <ImagePreview
                                            key={index}
                                            src={image.url}
                                            id={image.fileName}
                                            onClick={() => { }} onDelete={null} />
                                    })}
                                </ImagePreviewContainer>
                                <ListDescriptionWrapper>
                                    <ListHeader.DescriptionParagraph>{placeHistory.memo}</ListHeader.DescriptionParagraph>
                                    <Text style={{ fontStyle: "italic", fontSize: 14, marginTop: 5 }}>{Array.from(placeHistory.tags)}</Text>
                                    <Text style={{ fontSize: 14, marginTop: 5, alignSelf: "flex-end" }}>{TEXT.VISIT_AT} {placeHistory.visitAt}</Text>
                                </ListDescriptionWrapper>
                            </>
                        }
                        rightAlignment="center"
                        descriptionPosition="bottom"

                    />
                </>
            })}
        </ListWrapper >}
        </>
    }

    const listView = () => {
        return <ListWrapper>
            {categoryMap && sortedFilteredList.map((place: Place) => {
                const recentHistory = place.historyList.length > 0 ? place.historyList[0] : null
                const tags = new Set<string>()
                let images: Media[] = []
                place.historyList.forEach((history) => {
                    history.tags.forEach((tag) => {
                        tags.add(tag)
                    })
                    if (history.medias) {
                        images = images.concat(history.medias as Media[])
                    }
                })
                return <>
                    <ListHeader onClick={() => {
                        navigate(ROUTES.PLACE_EDIT, {
                            state: {
                                selectedPlace: place
                            }
                        })
                    }} title={
                        <ListTitleWrapper>
                            <ListHeader.TitleParagraph typography="t5" fontWeight="bold">
                                {place.name}
                            </ListHeader.TitleParagraph>
                            <ListHeader.DescriptionParagraph>{categoryMap.get(place.category)}</ListHeader.DescriptionParagraph>
                        </ListTitleWrapper>
                    }
                        right={
                            <ListRightWrapper>
                                <IconButton src="/tab_map.png" variant="clear" aria-label={TEXT.LOCATION} onClick={
                                    (e) => {
                                        navigate(ROUTES.MAP, {
                                            state: {
                                                selectedPlace: place
                                            }
                                        })
                                        e.stopPropagation()
                                    }
                                } />
                                {recentHistory && <Rating readOnly={true} value={recentHistory.rating} max={recentHistory.rating} size="medium" variant="iconOnly" aria-label={TEXT.RATING} />}
                            </ListRightWrapper>

                        }
                        description={
                            <>
                                <ImagePreviewContainer>
                                    {images.map((image: any, index: number) => {
                                        return <ImagePreview
                                            key={index}
                                            src={image.url}
                                            id={image.fileName}
                                            onClick={() => { }} onDelete={null} />
                                    })}
                                </ImagePreviewContainer>
                                <ListDescriptionWrapper>
                                    {recentHistory && <ListHeader.DescriptionParagraph>{recentHistory.memo}</ListHeader.DescriptionParagraph>}
                                    {recentHistory && <Text style={{ fontStyle: "italic", fontSize: 14, marginTop: 5 }}>{Array.from(tags)}</Text>}
                                    {recentHistory && <Text style={{ fontSize: 14, marginTop: 5, alignSelf: "flex-end" }}>{TEXT.RECENT_VISIT_AT} {recentHistory.visitAt}</Text>}
                                    <Text style={{ fontSize: 14, marginTop: 5, alignSelf: "flex-end" }}>총 {place.historyList.length}회 방문</Text>
                                </ListDescriptionWrapper>
                            </>

                        }
                        rightAlignment="center"
                        descriptionPosition="bottom"

                    />
                </>
            })}
        </ListWrapper>
    }
    return <div style={{ paddingLeft: 10, paddingRight: 10 }}>
        <SearchField placeholder={TEXT.MSG_SEARCH_HINT} fixed onChange={onSearchTextChange} />
        {filteringView()}
        <BottomTabBar />
        {listView()}
        {historyListView()}
    </div >
}

export default PlaceListPage