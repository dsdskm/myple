import { Button, Post, Toast } from "@toss/tds-mobile";
import BottomTabBar from "./BottomTabBar";
import styled from "styled-components";
import { useEffect, useState } from "react";
import Loading from "./common/Loading";
import { ToastInfo } from "../types/toast";
import { IAP, IapProductListItem } from "@apps-in-toss/web-framework";
import { SKU_DONATION, TEXT } from "../common/constants";

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ItemPage = () => {
  const [toast, setToast] = useState<ToastInfo>({
    show: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [productItemList, setProductItemList] = useState<IapProductListItem[]>([]);

  useEffect(() => {
    const loadProductItemList = async () => {
      const { products } = await IAP.getProductItemList();
      const list: IapProductListItem[] = products;
      setProductItemList(list);
    };

    loadProductItemList();
  }, []);

  const productView = () => {
    return (
      <div style={{ marginLeft: 25, marginRight: 25 }}>
        {productItemList.map((item) => {
          const sku = item.sku;
          const btnText = SKU_DONATION.includes(sku) ? TEXT.DONATE : TEXT.PURCHASE;
          return (
            <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={item.iconUrl} width={48} height={48} alt={item.description} />
                    <div>
                      <div>{item.displayName}</div>
                      <div>{item.displayAmount}</div>
                    </div>
                  </div>
                  <div>
                    <Button size="small">{btnText}</Button>
                  </div>
                </div>
                <div style={{ marginTop: 5 }}>{item.description}</div>
              </div>
            </>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  console.log(`productItemList`, productItemList);

  return (
    <div>
      <BottomTabBar />

      <Contents>
        <Post.H1>아이템 구매</Post.H1>
        {productView()}
      </Contents>
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
