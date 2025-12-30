import { useNavigate } from "react-router-dom"
import BottomTabBar from "./BottomTabBar"
import { useApp } from "../context/AppContext"
import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { Place } from "../types/place"
import { getCategory, getPlaces } from "../service/api"
import { Button, IconButton, ListHeader, Menu, Post, Rating, SearchField } from "@toss/tds-mobile"
import styled from 'styled-components';
import { ROUTES, TEXT } from "../common/constants"
import { Collapse } from 'react-collapse'; // react-collapse 사용
import './Collapse.css';
import { getDPlusTime, parseKoreanDateTime, slicingVisitAtTime } from "../common/utils"

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

const CollapseWrapper = styled.div`
    background-color: #f9f9f9;
    border-radius: 15px;
    padding: 10px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`

const MenuWrapper = styled.div`
    display:flex;
    gap:10px;
    align-items:center;
    justify-content:flex-start;
    margin-left:10px;
`

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


const MENU_SORT_NAME_DESC = 1;
const MENU_SORT_NAME_ASC = 2;
const MENU_SORT_RATING_DESC = 3;
const MENU_SORT_RATING_ASC = 4;
const MENU_SORT_VISITAT_DESC = 5;
const MENU_SORT_VISITAT_ASC = 6

const MENU_CATEGORY_ALL = 1;

const PlaceListPage = () => {
    const navigate = useNavigate()
    const { account } = useApp()
    const [myPlaceList, setMyPlaceList] = useState<Place[] | []>([])
    const [filteredList, setFilteredList] = useState<Place[] | []>([])
    const [categoryMap, setCategoryMap] = useState<Map<number, string>>()
    const [openSortMap, setOpenSortMap] = useState<Map<string, boolean>>(new Map())
    const [sortMenuOpen, setSortMenuOpen] = useState<boolean>(false)
    const [sortMenu, setSortMenu] = useState<number>(MENU_SORT_NAME_DESC)
    const [currentSort, setCurrentSort] = useState<string>(TEXT.MENU_SORT_NAME_DESC)
    const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false)
    const [currentCategoryId, setCurrentCategoryId] = useState<number>(MENU_CATEGORY_ALL)
    const [categoryMenuStatusMap, setCategoryMenuStatusMap] = useState<Map<number, any>>()
    const [currentCategoryText, setCurrentCategory] = useState<string>(TEXT.CATEGORY_ALL)

    useEffect(() => {
        const loadPlaces = async () => {
            const list = await getPlaces(account.id)
            setFilteredList(list)
            const initMap = new Map<string, boolean>();
            list.forEach(p => initMap.set(p.id, false));
            setOpenSortMap(initMap);
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
                    categoryData.list.forEach((c, index) => {
                        map.set(c.id, c.title)
                    })
                    setCategoryMap(map)
                }
            }
        }

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
            // if (sortMenu === MENU_SORT_RATING_DESC) return b.rating - a.rating;
            // if (sortMenu === MENU_SORT_RATING_ASC) return a.rating - b.rating;
            // if (sortMenu === MENU_SORT_VISITAT_DESC) return parseKoreanDateTime(a.visitAt).isBefore(parseKoreanDateTime(b.visitAt)) ? 1 : -1
            // if (sortMenu === MENU_SORT_VISITAT_ASC) return parseKoreanDateTime(a.visitAt).isBefore(parseKoreanDateTime(b.visitAt)) ? -1 : 1
            return a.name > b.name ? 1 : -1;
        });
    }, [sortMenu, currentCategoryText, filteredList]);   // menu 혹은 filteredList 가 바뀔 때만 재계산

    const onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value
        let list;
        if (text) {
            list = myPlaceList.filter((place) =>
                place.name.includes(text) || text.includes(place.name) /*|| place.tags.includes(text)*/
            )
        } else {
            list = [...myPlaceList]
        }

        setFilteredList(list)
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
                <MenuWrapper>
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
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RATING_DESC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RATING_DESC, TEXT.MENU_SORT_RATING_DESC)}
                                >
                                    {TEXT.MENU_SORT_RATING_DESC}
                                </Menu.DropdownCheckItem>
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_RATING_ASC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_RATING_ASC, TEXT.MENU_SORT_RATING_ASC)}
                                >
                                    {TEXT.MENU_SORT_RATING_ASC}
                                </Menu.DropdownCheckItem>
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_VISITAT_DESC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_VISITAT_DESC, TEXT.MENU_SORT_VISITAT_DESC)}
                                >
                                    {TEXT.MENU_SORT_VISITAT_DESC}
                                </Menu.DropdownCheckItem>
                                <Menu.DropdownCheckItem
                                    checked={sortMenu === MENU_SORT_VISITAT_ASC}
                                    onCheckedChange={(checked: boolean) => onSortMenuChange(MENU_SORT_VISITAT_ASC, TEXT.MENU_SORT_VISITAT_ASC)}
                                >
                                    {TEXT.MENU_SORT_VISITAT_ASC}
                                </Menu.DropdownCheckItem>
                            </Menu.Dropdown>
                        }
                    >
                        <Button size="small">{currentSort}</Button>
                    </Menu.Trigger>
                </MenuWrapper>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Post.H4>총 {sortedFilteredList.length}개 장소</Post.H4>
                </div>
            </div>
        );
    }

    const listView = () => {
        return <div style={{ paddingBottom: 100 }}>
            {categoryMap && sortedFilteredList.map((place: Place) => {
                const isOpen: boolean = openSortMap.get(place.id) || false
                return <>
                    <ListHeader onClick={() => {
                        setOpenSortMap(prev => {
                            const next = new Map(prev);
                            next.set(place.id, !prev.get(place.id) || false);
                            return next;
                        });

                    }} title={
                        <>
                            <ListHeader.TitleParagraph typography="t5" fontWeight="bold">
                                {place.name}
                            </ListHeader.TitleParagraph>
                        </>
                    }
                        right={
                            <></>
                            // <Rating readOnly={false} value={place.rating} max={place.rating} size="medium" aria-label={TEXT.RATING} />
                        }
                        description={
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <ListHeader.DescriptionParagraph>{categoryMap.get(place.category)}</ListHeader.DescriptionParagraph>
                                {/* <ListHeader.DescriptionParagraph>{place.tags}</ListHeader.DescriptionParagraph>
                                {place.visitAt && <ListHeader.DescriptionParagraph>{slicingVisitAtTime(place.visitAt)}, {getDPlusTime(place.visitAt)}</ListHeader.DescriptionParagraph>} */}
                            </div>
                        }
                        rightAlignment="center"
                        descriptionPosition="bottom"

                    />
                    <Collapse isOpened={isOpen}>
                        <CollapseWrapper>
                            {/* <Post.Paragraph style={{ marginBottom: 10 }}>{place.memo}</Post.Paragraph> */}
                            {place.address && <Post.Paragraph >{place.address}</Post.Paragraph>}
                            {place.latitude > 0 && place.longitude > 0 && <Button size="small" style={{ marginLeft: 20, marginBottom: 10 }} onClick={() => navigate(ROUTES.MAP, {
                                state: {
                                    selectedPlace: place
                                }
                            })}>{TEXT.LOCATION}</Button>}
                            {/* {place.medias.length > 0 && <ImagePreviewContainer>
                                {place.medias.map((image) => {
                                    return <ImagePreview src={image.url} key={image.url} alt="" />;
                                })}
                            </ImagePreviewContainer>} */}
                            <SubmitWrapper>
                                <SubmitButton size="medium" onClick={() => navigate(ROUTES.PLACE_EDIT, {
                                    state: {
                                        selectedPlace: place
                                    }
                                })}> {TEXT.MODIFY}</SubmitButton>
                            </SubmitWrapper>
                        </CollapseWrapper >
                    </Collapse >

                </>
            })}
        </div>
    }

    return <div style={{ paddingLeft: 10, paddingRight: 10 }}>
        <SearchField placeholder={TEXT.MSG_SEARCH_HINT} fixed onChange={onSearchTextChange} />
        {filteringView()}
        <BottomTabBar />
        {listView()}
    </div >
}

export default PlaceListPage