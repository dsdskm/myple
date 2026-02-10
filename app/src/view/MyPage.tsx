import {
  BottomCTA,
  Button,
  ConfirmDialog,
  List,
  ListRow,
  Modal,
  Post,
  TableRow,
  Text,
  TextField,
  Toast,
  Tooltip,
} from "@toss/tds-mobile";
import {
  ALT,
  getCategoryLimitText,
  LOGOUT_REFERRER,
  NETWORK_STATUS,
  PUBLIC_IMAGES,
  ROUTES,
  TEXT,
  TOAST_DURATION_DEFAULT,
} from "../common/constants";
import BottomTabBar from "./BottomTabBar";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getCategory, getPlaces, getProductInfo, requestLogout, updateCategory } from "../service/api";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ACTION_TYPE_SET_ACCOUNT, initialAccountState } from "../types/account";
import { Category } from "../types/category";
import Loading from "./common/Loading";
import { Product } from "../types/product";
import { ToastInfo } from "../types/toast";
import { getNetworkStatus } from "@apps-in-toss/web-framework";
import { saveId } from "../common/utils";
import { Place } from "../types/place";

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const modalContentStyle: any = {
  padding: "32px 20px 20px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

const MyPage = () => {
  const navigate = useNavigate();
  const { account, setAccount } = useApp();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState<boolean>(false);
  const [placeList, setPlaceList] = useState<Place[]>([]);
  const [categoryData, setCategoryData] = useState<Category>({
    id: "",
    list: [],
    created: "",
    updated: "",
  });
  const [targetCategoryList, setTargetCategoryList] = useState<{ id: number; title: string }[]>([]);
  const [targetCategoryListItem, setTargetCategoryListItem] = useState<{
    id: number;
    title: string;
  }>();
  const [targetCategoryError, setTargetCategoryError] = useState<boolean>(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState<boolean>(false);
  const [categoryModifyDialogOpen, setCategoryModifyDialogOpen] = useState<boolean>(false);
  const [categoryDisabledTooltipOpen, setCategoryDisabledTooltipOpen] = useState<boolean>(false);
  const [product, setProduct] = useState<Product | null>();
  const [toast, setToast] = useState<ToastInfo>({
    show: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadPlaces = async () => {
      const list = await getPlaces(account.id);
      setPlaceList(list);
    };

    const loadCategories = async () => {
      const categoryData = await getCategory(account.id);
      if (categoryData) {
        setCategoryData(categoryData);
        setTargetCategoryList(categoryData.list);
      }
    };
    const loadProductInfo = async () => {
      const result = await getProductInfo(account.id);
      setProduct(result);
    };

    const load = async () => {
      const networkStatus = await getNetworkStatus();
      if (
        networkStatus !== NETWORK_STATUS.OFFLINE &&
        networkStatus !== NETWORK_STATUS.UNKNOWN &&
        networkStatus !== NETWORK_STATUS.WWAN
      ) {
        loadPlaces();
        loadCategories();
        loadProductInfo();
      } else {
        setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR });
      }
    };
    if (account) {
      load();
    }
  }, [account]);

  const onWithdrawClick = async () => {
    try {
      const networkStatus = await getNetworkStatus();
      if (
        networkStatus === NETWORK_STATUS.OFFLINE ||
        networkStatus === NETWORK_STATUS.UNKNOWN ||
        networkStatus === NETWORK_STATUS.WWAN
      ) {
        setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR });
        return;
      }
      if (account.userKey) {
        await requestLogout(account.userKey, LOGOUT_REFERRER.UNLINK);
      }
      setAccount({
        type: ACTION_TYPE_SET_ACCOUNT,
        payload: initialAccountState,
      });
      saveId("");
      setWithdrawDialogOpen(false);
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (e) {
      console.log(e);
    }
  };

  const logoutDialog = () => {
    return (
      <ConfirmDialog
        open={withdrawDialogOpen}
        title={<ConfirmDialog.Title>{TEXT.MSG_WITHDRAW_CONFIRM}</ConfirmDialog.Title>}
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setWithdrawDialogOpen(false)}>
            {TEXT.NO}
          </ConfirmDialog.CancelButton>
        }
        confirmButton={<ConfirmDialog.ConfirmButton onClick={onWithdrawClick}>{TEXT.YES}</ConfirmDialog.ConfirmButton>}
        onClose={() => setWithdrawDialogOpen(false)}
      />
    );
  };

  const categoryView = () => {
    const onDeleteClick = (category: number) => {
      const list = targetCategoryList.filter((c) => c.id !== category);
      setTargetCategoryList(list);
    };

    const onCategoryCreateClick = async () => {
      try {
        setIsLoading(true);
        categoryData.list = targetCategoryList;
        await updateCategory(categoryData.id, categoryData);
        setCategoryDialogOpen(false);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    };

    const onCancelClick = () => {
      setTargetCategoryList(categoryData.list);
      setCategoryDialogOpen(false);
    };

    const setShowEditCategory = (id: number, title: string) => {
      setTargetCategoryListItem({ id: id, title: title });
      setCategoryModifyDialogOpen(true);
    };

    const onCategoryModifyOkClick = async () => {
      const networkStatus = await getNetworkStatus();
      if (
        networkStatus === NETWORK_STATUS.OFFLINE ||
        networkStatus === NETWORK_STATUS.UNKNOWN ||
        networkStatus === NETWORK_STATUS.WWAN
      ) {
        setToast({ show: true, message: TEXT.MSG_NETWORK_ERROR });
        return;
      }
      if (targetCategoryListItem) {
        if (targetCategoryListItem.id === 0) {
          targetCategoryList.push({
            id: new Date().getTime(),
            title: targetCategoryListItem.title,
          });
        } else {
          targetCategoryList.forEach((c) => {
            if (c.id === targetCategoryListItem.id) {
              c.title = targetCategoryListItem.title;
            }
          });
        }

        setTargetCategoryList(targetCategoryList);
      }
      setCategoryModifyDialogOpen(false);
    };

    const onModifyCategoryChange = (v: string) => {
      if (targetCategoryListItem) {
        setTargetCategoryError(v.length > 10 || v.length === 0);
        targetCategoryListItem.title = v;
        setTargetCategoryListItem({ ...targetCategoryListItem });
      }
    };

    const onCategoryItemAddClick = () => {
      if (product && targetCategoryList.length >= product.category_limit) {
        setToast({
          show: true,
          message: getCategoryLimitText(product.category_limit),
        });
      } else {
        setShowEditCategory(0, "");
      }
    };

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

    return (
      <>
        {categoryData && (
          <>
            <Modal open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <Modal.Overlay />
              <Modal.Content style={modalContentStyle}>
                <Post.H3>{TEXT.CATEGORY_LIST}</Post.H3>
                <List>
                  {targetCategoryList.map((c, index) => {
                    return (
                      <ListRow
                        contents={<ListRow.Texts type="1RowTypeA" top={c.title} />}
                        left={
                          <div>
                            <ListRow.IconButton
                              variant="clear"
                              iconSize={20}
                              aria-label={ALT.ARROW_UP}
                              src={PUBLIC_IMAGES.ARROW_UP}
                              onClick={() => {
                                onArrowUpClick(index);
                              }}
                            />
                            <ListRow.IconButton
                              variant="clear"
                              iconSize={20}
                              aria-label={ALT.ARROW_DOWN}
                              src={PUBLIC_IMAGES.ARROW_DOWN}
                              onClick={() => {
                                onArrowDownClick(index);
                              }}
                            />
                          </div>
                        }
                        right={
                          <div>
                            <ListRow.IconButton
                              variant="clear"
                              iconSize={20}
                              aria-label={ALT.EDIT}
                              src={PUBLIC_IMAGES.EDIT}
                              onClick={() => {
                                setShowEditCategory(c.id, c.title);
                              }}
                            />
                            <ListRow.IconButton
                              variant="clear"
                              iconSize={20}
                              aria-label={ALT.DELETE}
                              src={PUBLIC_IMAGES.DELETE}
                              onClick={() => {
                                onDeleteClick(c.id);
                              }}
                            />
                          </div>
                        }
                      />
                    );
                  })}
                </List>
                {product && (
                  <ListRow.IconButton
                    variant="clear"
                    aria-label={ALT.ADD}
                    iconSize={36}
                    src={PUBLIC_IMAGES.ADD}
                    onClick={onCategoryItemAddClick}
                  />
                )}
                <BottomCTA.Double
                  leftButton={
                    <Button variant="weak" onClick={onCancelClick}>
                      {TEXT.CANCEL}
                    </Button>
                  }
                  rightButton={<Button onClick={onCategoryCreateClick}>{TEXT.MODIFY}</Button>}
                />
              </Modal.Content>
            </Modal>
            {targetCategoryListItem && (
              <Modal open={categoryModifyDialogOpen} onOpenChange={setCategoryModifyDialogOpen}>
                <Modal.Overlay />
                <Modal.Content style={modalContentStyle}>
                  <Post.H3>{TEXT.CATEGORY_MODIFY}</Post.H3>

                  <TextField
                    variant={"big"}
                    value={targetCategoryListItem.title}
                    onChange={(e) => onModifyCategoryChange(e.target.value)}
                  />
                  <BottomCTA.Double
                    leftButton={
                      <Button variant="weak" onClick={() => setCategoryModifyDialogOpen(false)}>
                        {TEXT.CANCEL}
                      </Button>
                    }
                    rightButton={
                      <Button disabled={targetCategoryError} onClick={onCategoryModifyOkClick}>
                        {TEXT.OK}
                      </Button>
                    }
                  />
                </Modal.Content>
              </Modal>
            )}
          </>
        )}
      </>
    );
  };

  const infoView = () => {
    let gender = "";
    let categoryEnabled = false;
    let placeEnabled = false;
    if (account && product) {
      gender = account.gender;
      if (gender === "MALE") {
        gender = TEXT.MALE;
      } else if (gender === "FEMALE") {
        gender = TEXT.FEMALE;
      } else {
        gender = TEXT.INVISIBLE;
      }
      categoryEnabled = categoryData.list.length <= product.category_limit;
      placeEnabled = placeList.length <= product.place_limit;
    }
    return (
      <>
        {account && product && (
          <>
            <TableRow align="space-between" left={TEXT.ID} right={account.id} />
            <TableRow align="space-between" left={TEXT.NAME} right={account.name} />
            <TableRow align="space-between" left={TEXT.GENDER} right={gender} />
            <TableRow align="space-between" left={TEXT.PHONE} right={account.phone ? account.phone : TEXT.INVISIBLE} />
            <TableRow
              align="space-between"
              left={TEXT.BIRTHDAY}
              right={account.birthday ? account.birthday : TEXT.INVISIBLE}
            />
            <TableRow
              align="space-between"
              left={TEXT.AGREED_TERMS}
              right={account.agreedTerms && account.agreedTerms[0] === "serviceAgreed" ? TEXT.YES : TEXT.NO}
            />
            <TableRow
              align="space-between"
              left={<Text>{TEXT.PRODUCT_CATEGORY_LIMIT}</Text>}
              right={
                <div>
                  <Text style={{ color: !categoryEnabled ? "red" : "inherit" }}>{categoryData.list.length}</Text>
                  {" / "}
                  <Text>{product.category_limit} 개</Text>
                  <Tooltip message={TEXT.MSG_CATEGORY_DISABLED} open={categoryDisabledTooltipOpen}>
                    <Button
                      style={{ marginLeft: 15 }}
                      size="small"
                      onClick={() => {
                        if (categoryEnabled) {
                          setCategoryDialogOpen(true);
                        } else {
                          setCategoryDisabledTooltipOpen((prv) => !prv);
                        }
                      }}
                    >
                      {TEXT.VIEW}
                    </Button>
                  </Tooltip>
                </div>
              }
            />
            <TableRow
              align="space-between"
              left={TEXT.PRODUCT_PLACE_LIMIT}
              right={
                <div>
                  <Text style={{ color: !placeEnabled ? "red" : "inherit" }}>{placeList.length}</Text>
                  {" / "}
                  <Text>{product.place_limit} 개</Text>
                </div>
              }
            />
          </>
        )}
      </>
    );
  };

  if (isLoading) {
    return <Loading label={TEXT.MSG_CREATE_CATEGORY} />;
  }

  return (
    <div>
      <BottomTabBar />
      <Contents>
        {infoView()}
        {categoryData && categoryView()}
        <Button
          style={{ marginLeft: 10, marginRight: 10 }}
          color="danger"
          size="medium"
          onClick={() => setWithdrawDialogOpen(true)}
        >
          {TEXT.WITHDRAW} / {TEXT.LOGOUT}
        </Button>
      </Contents>
      {logoutDialog()}
      <Toast
        position="bottom"
        open={toast.show}
        text={toast.message}
        duration={TOAST_DURATION_DEFAULT}
        onClose={() => {
          setToast({ show: false, message: "" });
        }}
      />
    </div>
  );
};

export default MyPage;
