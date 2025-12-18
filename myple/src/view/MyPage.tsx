import { BottomCTA, Button, ConfirmDialog, CTAButton, List, ListRow, Modal, Post } from "@toss/tds-mobile";
import { LOGOUT_REFERRER, ROUTES, TEXT } from "../common/constants";
import BottomTabBar from "./BottomTabBar"
import styled from 'styled-components';
import { useEffect, useState } from "react";
import { getCategory, requestLogout } from "../service/api";
import { useNavigate } from 'react-router-dom';
import { useApp } from "../context/AppContext";
import { ACTION_TYPE_SET_ACCOUNT, initialAccountState } from "../types/account";
import { Category } from "../types/category";

const Contents = styled.div`
  height:100vh;
  display: flex;
  flex-direction:column;
  justify-content: center;
  align-items: center;
  gap:10px;
 
`;

const MyPage = () => {
    const navigate = useNavigate();
    const { account, setAccount } = useApp()
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState<boolean>(false);
    const [categoryData, setCategoryData] = useState<Category>({ id: "", limitCount: 0, list: [], created: "", updated: "" })
    const [targetCategoryList, setTargetCategoryList] = useState<string[]>([])
    const [categoryDialogOpen, setCategoryDialogOpen] = useState<boolean>(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)

    useEffect(() => {
        const loadCategories = async () => {
            if (account) {
                const categoryData = await getCategory(account.id)
                if (categoryData) {
                    setCategoryData(categoryData)
                    setTargetCategoryList(categoryData.list)
                }
            }
        }

        loadCategories()

    }, [account])

    const onWithdrawClick = async () => {
        try {
            await requestLogout(account.userKey, LOGOUT_REFERRER.UNLINK);
            setAccount({ type: ACTION_TYPE_SET_ACCOUNT, payload: initialAccountState })
            navigate(ROUTES.LOGIN, { replace: true })
        } catch (e) {
            console.log(e);
        } finally {
            setIsWithdrawDialogOpen(false);
        }
    };

    const logoutDialog = () => {
        return (
            <ConfirmDialog
                open={isWithdrawDialogOpen}
                title={<ConfirmDialog.Title>{TEXT.MSG_LOGOUT_CONFIRM}</ConfirmDialog.Title>}
                cancelButton={
                    <ConfirmDialog.CancelButton
                        onClick={() => setIsWithdrawDialogOpen(false)}
                    >
                        {TEXT.NO}
                    </ConfirmDialog.CancelButton>
                }
                confirmButton={
                    <ConfirmDialog.ConfirmButton onClick={onWithdrawClick}>
                        {TEXT.YES}
                    </ConfirmDialog.ConfirmButton>
                }
                onClose={() => setIsWithdrawDialogOpen(false)}
            />
        );
    };

    const onModifyClick = () => {

    }

    const confirmDialog = () => {
        return <ConfirmDialog
            open={confirmDialogOpen}
            title={<ConfirmDialog.Title>{TEXT.MSG_MODIFY_PLACE_CONFIRM}</ConfirmDialog.Title>}
            cancelButton={
                <ConfirmDialog.CancelButton
                    onClick={() => setConfirmDialogOpen(false)}
                >
                    {TEXT.NO}
                </ConfirmDialog.CancelButton>
            }
            confirmButton={
                <ConfirmDialog.ConfirmButton onClick={onModifyClick}>
                    {TEXT.YES}
                </ConfirmDialog.ConfirmButton>
            }
            onClose={() => setConfirmDialogOpen(false)}
        />
    }

    const categoryView = () => {
        const onDeleteClick = (category: string) => {
            const list = targetCategoryList.filter((c) => c != category)
            setTargetCategoryList(list)
        }

        const onCategoryCreateClick = () => {
            setConfirmDialogOpen(true)
        }

        const onCancelClick = () => {
            setTargetCategoryList(categoryData.list)
            setCategoryDialogOpen(false)
        }

        return <>
            {categoryData && <>
                <Button onClick={() => setCategoryDialogOpen(true)}>{TEXT.CATEGORY}</Button>
                <Modal open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <Modal.Overlay />
                    <Modal.Content
                        style={{
                            padding: '32px 20px 20px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <Post.H3>{TEXT.CATEGORY_LIMIT}</Post.H3>
                        <Post.Paragraph>{categoryData.limitCount} 개</Post.Paragraph>

                        <Post.H3>{TEXT.CATEGORY_LIST}</Post.H3>
                        <List>
                            {targetCategoryList.map((c) => {
                                return <ListRow
                                    contents={<ListRow.Texts type="1RowTypeA" top={c} />}
                                    right={
                                        <ListRow.IconButton
                                            variant="clear"
                                            iconSize={16}
                                            aria-label=""
                                            src="/search.png"
                                            onClick={() => { onDeleteClick(c) }}
                                        />
                                    }
                                />
                            })}
                        </List>
                        <BottomCTA.Double
                            leftButton={
                                <Button variant="weak" onClick={onCancelClick}>
                                    {TEXT.CANCEL}
                                </Button>
                            }
                            rightButton={<Button onClick={() => onCategoryCreateClick}>
                                {TEXT.MODIFY}
                            </Button>}
                        />

                    </Modal.Content>
                </Modal>
            </>
            }
        </>
    }



    return <div>
        <BottomTabBar />
        <Contents>
            {categoryData && categoryView()}
            <Button color="danger" size="medium" onClick={() => setIsWithdrawDialogOpen(true)}>
                {TEXT.WITHDRAW}
            </Button>
        </Contents>
        {logoutDialog()}
        {confirmDialog()}
    </div>
}


export default MyPage