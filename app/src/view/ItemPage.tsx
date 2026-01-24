import { Asset, Button, List, Modal, Post, Result, Toast } from "@toss/tds-mobile";
import BottomTabBar from "./BottomTabBar";
import styled from "styled-components";
import { useEffect, useState } from "react";
import Loading from "./common/Loading";
import { ToastInfo } from "../types/toast";
import { IAP, IapProductListItem } from "@apps-in-toss/web-framework";
import { SKU_DONATION, SORTED_SKU, TEXT } from "../common/constants";
import { useApp } from "../context/AppContext";
import { getProductInfo, updateProduct } from "../service/api";

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ItemRowLeft = styled.div`
  display: flex;
  alignitems: center;
  gap: 10px;
`;

interface HistoryOrder {
  orderId: string;
  sku: string;
  status: "COMPLETED" | "REFUNDED";
  date: string;
}

const ItemPage = () => {
  const { account } = useApp();
  const [toast, setToast] = useState<ToastInfo>({
    show: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [productItemList, setProductItemList] = useState<IapProductListItem[]>([]);
  const [productItemHistoryList, setProductItemHistoryList] = useState<HistoryOrder[]>([]);
  const [productItemHistoryMap, setProductItemHistoryMap] = useState<Map<string, IapProductListItem>>();
  const [itemHistoryViewOpen, setItemHistoryViewOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadProductItemList = async () => {
      setIsLoading(true);
      const { products } = await IAP.getProductItemList();
      const list: IapProductListItem[] = products.sort((a, b) => {
        return SORTED_SKU.indexOf(a.sku) - SORTED_SKU.indexOf(b.sku);
      });

      setProductItemList(list);
      const productMap = new Map<string, IapProductListItem>(products.map((item) => [item.sku, item]));
      setProductItemHistoryMap(productMap);
    };

    loadProductItemList();
    setIsLoading(false);
  }, []);

  const onProcessProductGrant = async (sku: string) => {
    const product = await getProductInfo(account.id);
    if (product) {
      switch (sku) {
        case SORTED_SKU[0]:
          // 카테고리 1개
          product.category_limit += 1;
          await updateProduct(account.id, product);
          break;
        case SORTED_SKU[1]:
          // 카테고리 10개
          product.category_limit += 10;
          await updateProduct(account.id, product);
          break;
        case SORTED_SKU[2]:
          // 장소 1개
          product.place_limit += 1;
          await updateProduct(account.id, product);
          break;
        case SORTED_SKU[3]:
          // 장소 10개
          product.place_limit += 10;
          await updateProduct(account.id, product);
          break;
        default:
          break;
      }
    }
  };

  const onPurchaseClick = async (sku: string) => {
    IAP.createOneTimePurchaseOrder({
      options: {
        sku,
        processProductGrant: ({ orderId }) => {
          console.log(`processProductGrant orderId ${orderId}`);
          onProcessProductGrant(sku);
          return true;
        },
      },
      onEvent: (event) => {
        console.log(`event`, event);
      },
      onError: (error) => {
        console.log(`error`, error);
      },
    });
  };

  const productView = () => {
    return (
      <div style={{ marginLeft: 25, marginRight: 25 }}>
        {productItemList.map((item) => {
          const sku = item.sku;
          const btnText = SKU_DONATION.includes(sku) ? TEXT.DONATE : TEXT.PURCHASE;
          return (
            <>
              <div style={{ marginBottom: 10 }}>
                <ItemRow>
                  <ItemRowLeft>
                    <img src={item.iconUrl} width={48} height={48} alt={item.description} />
                    <div>
                      <div>{item.displayName}</div>
                      <div>{item.displayAmount}</div>
                    </div>
                  </ItemRowLeft>
                  <div>
                    <Button
                      size="small"
                      onClick={() => {
                        onPurchaseClick(sku);
                      }}
                    >
                      {btnText}
                    </Button>
                  </div>
                </ItemRow>
                <div style={{ marginTop: 5 }}>{item.description}</div>
              </div>
            </>
          );
        })}
      </div>
    );
  };

  const itemHistoryView = () => {
    return (
      <>
        {productItemHistoryMap && (
          <Modal open={itemHistoryViewOpen} onOpenChange={setItemHistoryViewOpen}>
            <Modal.Overlay />
            <Modal.Content>
              <Post.H3>{TEXT.ITEM_PURCHASE_HISTORY}</Post.H3>
              <List>
                {(!productItemHistoryList || productItemHistoryList.length === 0) && (
                  <Result
                    figure={<Asset.Icon name="icn-info-line" frameShape={Asset.frameShape.CleanH24} />}
                    title={TEXT.MSG_EMPTY_PURCHASED}
                  />
                )}
                {productItemHistoryList.map((itemHistory) => {
                  const item = productItemHistoryMap.get(itemHistory.sku);
                  return (
                    <>
                      {item ? (
                        <ItemRowLeft style={{ margin: 10, alignItems: "center" }}>
                          <img src={item.iconUrl} width={36} height={36} alt={item.displayName} />
                          <div style={{ width: "100%" }}>
                            <div>{itemHistory.date}</div>
                            <div>{item.displayName}</div>
                            <div>
                              {item.displayAmount},{" "}
                              {itemHistory.status === "COMPLETED" ? TEXT.PURCHASED : TEXT.REFUNDED}
                            </div>
                          </div>
                        </ItemRowLeft>
                      ) : (
                        <ItemRowLeft style={{ margin: 10, alignItems: "center" }}>
                          <img
                            src={"https://static.toss.im/appsintoss/3847/46c6bea2-9602-4389-9191-702e4b2ea5fd.png"}
                            width={36}
                            height={36}
                            alt={"카테고리 아이템 1개"}
                          />
                          <div style={{ width: "100%" }}>
                            <div>{itemHistory.date}</div>
                            <div>카테고리 아이템 1개</div>
                            <div>1100원, {itemHistory.status === "COMPLETED" ? TEXT.PURCHASED : TEXT.REFUNDED}</div>
                          </div>
                        </ItemRowLeft>
                      )}
                    </>
                  );
                })}
              </List>
              <div style={{ width: "100%", display: "flex", flex: 1, justifyContent: "center", marginBottom: 10 }}>
                <Button size="medium" style={{ width: "75%" }} onClick={() => setItemHistoryViewOpen(false)}>
                  {TEXT.OK}
                </Button>
              </div>
            </Modal.Content>
          </Modal>
        )}
      </>
    );
  };

  const onItemPurchaseHistoryClick = async () => {
    setItemHistoryViewOpen(true);
    const result = await IAP.getCompletedOrRefundedOrders();
    const list: HistoryOrder[] = result.orders;
    setProductItemHistoryList(list);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <BottomTabBar />

      <Contents>
        <Post.H1>{TEXT.ITEM_PURCHASE}</Post.H1>
        {productView()}
        <Button style={{ marginLeft: 10, marginRight: 10 }} size="medium" onClick={onItemPurchaseHistoryClick}>
          {TEXT.ITEM_PURCHASE_HISTORY}
        </Button>
      </Contents>
      {itemHistoryView()}
      <Toast
        position="bottom"
        open={toast.show}
        text={toast.message}
        duration={2000}
        onClose={() => {
          setToast({ show: false, message: "" });
        }}
      />
    </div>
  );
};

export default ItemPage;
