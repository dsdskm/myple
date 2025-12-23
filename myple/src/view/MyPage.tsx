import { AlertDialog, BottomCTA, Button, ConfirmDialog, List, ListRow, Modal, Post, TableRow, TextField } from "@toss/tds-mobile";
import { ACCOUNT_TYPE_USER_BASIC, ACCOUNT_TYPE_USER_PRO, LOGOUT_REFERRER, ROUTES, TEXT } from "../common/constants";
import BottomTabBar from "./BottomTabBar"
import styled from 'styled-components';
import { useEffect, useState } from "react";
import { getCategory, getSubscriptionInfo, requestLogout, updateCategory, updateUser } from "../service/api";
import { useNavigate } from 'react-router-dom';
import { useApp } from "../context/AppContext";
import { ACTION_TYPE_SET_ACCOUNT, initialAccountState } from "../types/account";
import { Category } from "../types/category";
import Loading from "./common/Loading";
import { SubscriptionInfo } from "../types/subscriptionInfo";

const Contents = styled.div`
  display: flex;
  flex-direction:column;
  gap:10px;
`;

const modalContentStyle: any = {
    padding: '32px 20px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
};

const MyPage = () => {
    const navigate = useNavigate();
    const { account, setAccount } = useApp()
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState<boolean>(false);
    const [categoryData, setCategoryData] = useState<Category>({ id: "", limitCount: 0, list: [], created: "", updated: "" })
    const [targetCategoryList, setTargetCategoryList] = useState<{ id: number, title: string }[]>([])
    const [targetCategoryListItem, setTargetCategoryListItem] = useState<{ id: number, title: string }>()
    const [targetCategoryError, setTargetCategoryError] = useState<boolean>(false)
    const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>()
    const [categoryDialogOpen, setCategoryDialogOpen] = useState<boolean>(false)
    const [categoryModifyDialogOpen, setCategoryModifyDialogOpen] = useState<boolean>(false)
    const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState<boolean>(false)
    const [subscriptionConfirmDialogOpen, setSubscriptionConfirmDialogOpen] = useState<boolean>(false)
    const [unsubscriptionConfirmDialogOpen, setUnSubscriptionConfirmDialogOpen] = useState<boolean>(false)
    const [subscriptionAlertDialogOpen, setSubscriptionAlertDialogOpen] = useState<boolean>(false)

    const [isLoading, setIsLoading] = useState<boolean>(false)
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

    useEffect(() => {
        const loadSubscriptionInfo = async () => {
            const response = await getSubscriptionInfo()
            setSubscriptionInfo(response)
        }
        loadSubscriptionInfo()
    }, [])

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
                title={<ConfirmDialog.Title>{TEXT.MSG_WITHDRAW_CONFIRM}</ConfirmDialog.Title>}
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

    const categoryView = () => {
        const onDeleteClick = (category: number) => {
            const list = targetCategoryList.filter((c) => c.id !== category)
            setTargetCategoryList(list)
        }

        const onCategoryCreateClick = async () => {
            try {
                setIsLoading(true)
                categoryData.list = targetCategoryList
                await updateCategory(categoryData.id, categoryData)

            } catch (e) {
                console.log(e)
            } finally {
                setCategoryDialogOpen(false)
                setIsLoading(false)
            }


        }

        const onCancelClick = () => {
            setTargetCategoryList(categoryData.list)
            setCategoryDialogOpen(false)
        }

        const setShowEditCategory = (id: number, title: string) => {
            setTargetCategoryListItem({ id: id, title: title })
            setCategoryModifyDialogOpen(true)
        }

        const onCategoryModifyOkClick = () => {
            if (targetCategoryListItem) {
                if (targetCategoryListItem.id === 0) {
                    targetCategoryList.push({ id: new Date().getTime(), title: targetCategoryListItem.title })
                } else {
                    targetCategoryList.forEach((c) => {
                        if (c.id === targetCategoryListItem.id) {
                            c.title = targetCategoryListItem.title
                        }
                    })
                }

                setTargetCategoryList(targetCategoryList)
            }
            setCategoryModifyDialogOpen(false)
        }

        const onModifyCategoryChange = (v: string) => {
            if (targetCategoryListItem) {
                setTargetCategoryError(v.length > 10 || v.length === 0)
                targetCategoryListItem.title = v
                setTargetCategoryListItem({ ...targetCategoryListItem })
            }
        }

        const onCategoryItemAddClick = () => {
            setShowEditCategory(0, "")
        }

        const onArrowUpClick = (index: number) => {
            if (index <= 0) return;
            const newList = [...targetCategoryList];
            const [movedItem] = newList.splice(index, 1);
            newList.splice(index - 1, 0, movedItem);
            setTargetCategoryList(newList);
        };

        const onArrowDownClick = (index: number) => {
            if (index >= targetCategoryList.length - 1) return;
            const newList = [...targetCategoryList];
            const [movedItem] = newList.splice(index, 1);
            newList.splice(index + 1, 0, movedItem);
            setTargetCategoryList(newList);
        };

        return <>
            {categoryData && <>
                <Modal open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <Modal.Overlay />
                    <Modal.Content
                        style={modalContentStyle}
                    >
                        <Post.H3>{TEXT.CATEGORY_LIST}</Post.H3>
                        <List>
                            {targetCategoryList.map((c, index) => {
                                return <ListRow
                                    contents={<ListRow.Texts type="1RowTypeA" top={c.title} />}
                                    left={<div>
                                        <ListRow.IconButton
                                            variant="clear"
                                            iconSize={20}
                                            aria-label="arrow_up"
                                            src="/arrow_up.png"
                                            onClick={() => { onArrowUpClick(index) }}
                                        />
                                        <ListRow.IconButton
                                            variant="clear"
                                            iconSize={20}
                                            aria-label="arrow_down"
                                            src="/arrow_down.png"
                                            onClick={() => { onArrowDownClick(index) }}
                                        />
                                    </div>}
                                    right={
                                        <div>
                                            <ListRow.IconButton
                                                variant="clear"
                                                iconSize={20}
                                                aria-label=""
                                                src="/edit.png"
                                                onClick={() => { setShowEditCategory(c.id, c.title) }}
                                            />
                                            <ListRow.IconButton
                                                variant="clear"
                                                iconSize={20}
                                                aria-label="delete"
                                                src="/delete.png"
                                                onClick={() => { onDeleteClick(c.id) }}
                                            />

                                        </div>
                                    }
                                />
                            })}
                        </List>
                        {account.type === ACCOUNT_TYPE_USER_PRO && <ListRow.IconButton
                            disabled={targetCategoryList.length >= categoryData.limitCount}
                            variant="clear"
                            aria-label="add"
                            iconSize={36}
                            src="/add.png"
                            onClick={onCategoryItemAddClick}
                        />}
                        <BottomCTA.Double
                            leftButton={
                                <Button variant="weak" onClick={onCancelClick}>
                                    {TEXT.CANCEL}
                                </Button>
                            }
                            rightButton={<Button disabled={targetCategoryList.length > categoryData.limitCount} onClick={onCategoryCreateClick}>
                                {TEXT.MODIFY}
                            </Button>}
                        />

                    </Modal.Content>
                </Modal>
                {targetCategoryListItem && <Modal open={categoryModifyDialogOpen} onOpenChange={setCategoryModifyDialogOpen}>
                    <Modal.Overlay />
                    <Modal.Content
                        style={modalContentStyle}
                    >
                        <Post.H3>{TEXT.CATEGORY_MODIFY}</Post.H3>

                        <TextField variant={"big"} value={targetCategoryListItem.title} onChange={(e) => onModifyCategoryChange(e.target.value)} />
                        <BottomCTA.Double
                            leftButton={
                                <Button variant="weak" onClick={() => setCategoryModifyDialogOpen(false)}>
                                    {TEXT.CANCEL}
                                </Button>
                            }
                            rightButton={<Button disabled={targetCategoryError} onClick={onCategoryModifyOkClick}>
                                {TEXT.OK}
                            </Button>}
                        />

                    </Modal.Content>
                </Modal>}
            </>
            }
        </>
    }

    const subscriptionInfoDialog = () => {
        return <>{subscriptionInfo && <Modal open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
            <Modal.Overlay />
            <Modal.Content
                style={{
                    padding: '32px 10px 10px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                    <Post.H3>*{TEXT.SUBSCRIPTION_BENEFITS}</Post.H3>
                    {subscriptionInfo.benefits.map((t, index) => {
                        return <Post.Paragraph style={{ textAlign: "start" }}>{index + 1}. {t}</Post.Paragraph>
                    })}

                    <Post.H3>*{TEXT.SUBSCRIPTION_LIMITATIONS}</Post.H3>
                    {subscriptionInfo.limitations.map((t, index) => {
                        return <Post.Paragraph style={{ textAlign: "start" }}>{index + 1}. {t}</Post.Paragraph>
                    })}
                </div>
                <BottomCTA.Double
                    leftButton={
                        <Button variant="weak" onClick={() => setSubscriptionDialogOpen(false)}>
                            {TEXT.CANCEL}
                        </Button>
                    }
                    rightButton={<Button disabled={targetCategoryError} onClick={() => setSubscriptionConfirmDialogOpen(true)}>
                        {TEXT.SUBSCRIPTION}
                    </Button>}
                />

            </Modal.Content>
        </Modal>}</>
    }

    const subscriptionConfirmDialog = () => {
        const onSubscriptionClick = async (subscribe: boolean) => {
            try {
                // TODO: toss pay
                setIsLoading(true)
                account.type = subscribe ? ACCOUNT_TYPE_USER_PRO : ACCOUNT_TYPE_USER_BASIC
                await updateUser(account)
                setSubscriptionConfirmDialogOpen(false)
                setUnSubscriptionConfirmDialogOpen(false)
                setSubscriptionAlertDialogOpen(true)
            } catch (err) {
                console.log(err)
            } finally {
                setSubscriptionDialogOpen(false)
                setIsLoading(false)
            }
        }

        return <>
            <ConfirmDialog
                open={subscriptionConfirmDialogOpen}
                title={<ConfirmDialog.Title>{TEXT.MSG_SUBSCRIBE}</ConfirmDialog.Title>}
                cancelButton={<ConfirmDialog.CancelButton
                    onClick={() => setSubscriptionConfirmDialogOpen(false)}>
                    {TEXT.NO}
                </ConfirmDialog.CancelButton>
                }
                confirmButton={<ConfirmDialog.ConfirmButton onClick={() => onSubscriptionClick(true)}>{TEXT.YES}</ConfirmDialog.ConfirmButton>

                }
                onClose={() => setSubscriptionConfirmDialogOpen(false)} />
            <ConfirmDialog
                open={unsubscriptionConfirmDialogOpen}
                title={<ConfirmDialog.Title>{TEXT.MSG_UNSUBSCRIBE}</ConfirmDialog.Title>}
                cancelButton={<ConfirmDialog.CancelButton
                    onClick={() => {
                        setSubscriptionDialogOpen(false)
                        setUnSubscriptionConfirmDialogOpen(false)
                    }}>
                    {TEXT.NO}
                </ConfirmDialog.CancelButton>
                }
                confirmButton={<ConfirmDialog.ConfirmButton onClick={() => onSubscriptionClick(false)}>{TEXT.YES}</ConfirmDialog.ConfirmButton>

                }
                onClose={() => setUnSubscriptionConfirmDialogOpen(false)} />
            <AlertDialog
                open={subscriptionAlertDialogOpen}
                title={<AlertDialog.Title>{account.type === ACCOUNT_TYPE_USER_PRO ? TEXT.MSG_SUBSCRIBE_COMPLETED : TEXT.MSG_UNSUBSCRIBE_COMPLETED}</AlertDialog.Title>}
                alertButton={<AlertDialog.AlertButton onClick={() => setSubscriptionAlertDialogOpen(false)}>{TEXT.OK}</AlertDialog.AlertButton>}
                onClose={() => setSubscriptionAlertDialogOpen(false)} />
        </>
    }

    if (isLoading) {
        return <Loading />
    }
    return <div>
        <BottomTabBar />
        <Contents>
            <div>
                <TableRow align="space-between" left={TEXT.ID} right={account.id} />
                <TableRow align="space-between" left={TEXT.NAME} right={account.name} />
                <TableRow align="space-between" left={TEXT.GENDER} right={account.gender === "MALE" ? TEXT.MALE : TEXT.FEMALE} />
                <TableRow align="space-between" left={TEXT.PHONE} right={account.phone} />
                <TableRow align="space-between" left={TEXT.BIRTHDAY} right={account.birthday} />
                <TableRow align="space-between" left={TEXT.AGREED_TERMS} right={account.agreedTerms && account.agreedTerms[0] === "serviceAgreed" ? TEXT.YES : TEXT.NO} />
                <TableRow align="space-between" left={TEXT.ACCOUNT_TYPE} right={<>{account.type}
                    <Button
                        style={{ marginLeft: 5 }}
                        size="small"
                        color={account.type === ACCOUNT_TYPE_USER_BASIC ? "primary" : "danger"}
                        onClick={() => account.type === ACCOUNT_TYPE_USER_BASIC ? setSubscriptionDialogOpen(true) : setUnSubscriptionConfirmDialogOpen(true)}>
                        {account.type === ACCOUNT_TYPE_USER_BASIC ? `${TEXT.UPGRADE}(${TEXT.SUBSCRIPTION})` : TEXT.UNSUBSCRIPTION}
                    </Button>
                </>} />
                <TableRow align="space-between" left={TEXT.CATEGORY} right={<Button style={{ marginLeft: 5 }} size="small" onClick={() => setCategoryDialogOpen(true)}>{TEXT.CATEGORY_MANAGEMENT}</Button>} />
            </div>
            {categoryData && categoryView()}
            <Button style={{ margin: 10 }} color="danger" size="medium" onClick={() => setIsWithdrawDialogOpen(true)}>
                {TEXT.WITHDRAW}
            </Button>
        </Contents>
        {logoutDialog()}
        {subscriptionInfoDialog()}
        {subscriptionConfirmDialog()}
    </div>
}


export default MyPage