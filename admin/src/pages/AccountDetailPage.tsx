import {
  Card,
  Button,
  Space,
  Typography,
  Descriptions,
  Spin,
  Alert,
  Tag,
  List,
  Popconfirm,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "@/constants/routes";
import { useEffect, useMemo, useState } from "react";
import { getCategory, getPlaces, getProductInfo, getUser, requestLogout } from "@/services/api";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { Place } from "@/types/place";

const { Title, Text } = Typography;

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { userKey } = useParams<{ userKey: string }>();

  const [account, setAccount] = useState<Account | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [placeList, setPlaceList] = useState<Place[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ✅ CSS 파일 없이 라벨(필드명) 배경색 넣기
  const labelStyle = useMemo(
    () => ({
      background: "#7fdad6", // 연한 하늘색
      fontWeight: 600,
      width: 170,
      padding: "10px 14px",
    }),
    [],
  );

  const contentStyle = useMemo(
    () => ({
      background: "#ffffff",
      padding: "10px 14px",
    }),
    [],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        if (userKey) {
          setLoading(true);
          setErrorMsg("");

          // ✅ 병렬로 한 번에 가져오기
          const [accountData, categoryData, productData, placeList] = await Promise.all([
            getUser(userKey),
            getCategory(userKey),
            getProductInfo(userKey),
            getPlaces(userKey),
          ]);

          setAccount(accountData ?? null);
          setCategory(categoryData ?? null);
          setProduct(productData ?? null);
          setPlaceList(placeList ?? []);
        }
      } catch (e: any) {
        setErrorMsg(e?.message ?? "Failed to load detail data");
        setAccount(null);
        setCategory(null);
        setProduct(null);
        setPlaceList([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userKey]);

  const handleWithdraw = async () => {
    if (!userKey) return;

    try {
      setLoading(true);
      await requestLogout(Number(userKey));
      message.success("탈퇴 처리 완료");
      navigate(PATH.ACCOUNT);
    } catch (e: any) {
      message.error(e?.message ?? "탈퇴 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Account Detail
          </Title>
        }
        extra={
          <Space>
            <Button onClick={() => navigate(PATH.ACCOUNT)}>목록으로</Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        {errorMsg ? <Alert type="error" showIcon message={errorMsg} style={{ marginBottom: 12 }} /> : null}

        <Spin spinning={loading}>
          {/* Account */}
          <Card type="inner" title="Account" style={{ borderRadius: 10 }} bodyStyle={{ paddingTop: 12 }}>
            {account ? (
              <Descriptions bordered size="small" column={2} labelStyle={labelStyle} contentStyle={contentStyle}>
                <Descriptions.Item label="id">{account.id || "-"}</Descriptions.Item>
                <Descriptions.Item label="type">
                  <Tag>{account.type}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="status">
                  <Tag color={account.status === "active" ? "green" : "red"}>{account.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="userKey">{account.userKey}</Descriptions.Item>

                <Descriptions.Item label="name">{account.name || "-"}</Descriptions.Item>
                <Descriptions.Item label="phone">
                  {account.phone ? `${account.callingCode ? `+${account.callingCode} ` : ""}${account.phone}` : "-"}
                </Descriptions.Item>

                <Descriptions.Item label="birthday">{account.birthday || "-"}</Descriptions.Item>
                <Descriptions.Item label="gender">{account.gender || "-"}</Descriptions.Item>

                <Descriptions.Item label="nationality">{account.nationality || "-"}</Descriptions.Item>
                <Descriptions.Item label="email">{account.email || "-"}</Descriptions.Item>

                <Descriptions.Item label="scope" span={2}>
                  {account.scope || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="agreedTerms" span={2}>
                  {account.agreedTerms?.length ? account.agreedTerms.join(", ") : "-"}
                </Descriptions.Item>

                <Descriptions.Item label="created">{account.created || "-"}</Descriptions.Item>
                <Descriptions.Item label="updated">{account.updated || "-"}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">데이터가 없습니다.</Text>
            )}
          </Card>

          {/* Places */}
          <Card type="inner" title="Places" style={{ borderRadius: 10 }} bodyStyle={{ paddingTop: 12 }}>
            <Descriptions bordered size="small" column={1} labelStyle={labelStyle} contentStyle={contentStyle}>
              <Descriptions.Item label="place count">{placeList.length}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Category */}
          <Card type="inner" title="Category" style={{ borderRadius: 10 }} bodyStyle={{ paddingTop: 12 }}>
            {category ? (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Descriptions bordered size="small" column={2} labelStyle={labelStyle} contentStyle={contentStyle}>
                  <Descriptions.Item label="id">{category.id || "-"}</Descriptions.Item>
                  <Descriptions.Item label="count">{category.list?.length ?? 0}</Descriptions.Item>
                  <Descriptions.Item label="created">{category.created || "-"}</Descriptions.Item>
                  <Descriptions.Item label="updated">{category.updated || "-"}</Descriptions.Item>
                </Descriptions>

                <div>
                  <Text strong>Category List</Text>
                  <List
                    size="small"
                    bordered
                    style={{ marginTop: 8, borderRadius: 8 }}
                    dataSource={category.list ?? []}
                    locale={{ emptyText: "카테고리 리스트가 없습니다." }}
                    renderItem={(item) => (
                      <List.Item>
                        <Space>
                          <Tag>{item.id}</Tag>
                          <Text>{item.title}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              </Space>
            ) : (
              <Text type="secondary">데이터가 없습니다.</Text>
            )}
          </Card>

          {/* Product */}
          <Card type="inner" title="Product" style={{ borderRadius: 10 }} bodyStyle={{ paddingTop: 12 }}>
            {product ? (
              <Descriptions bordered size="small" column={2} labelStyle={labelStyle} contentStyle={contentStyle}>
                <Descriptions.Item label="id">{product.id || "-"}</Descriptions.Item>
                <Descriptions.Item label="category_limit">{product.category_limit}</Descriptions.Item>
                <Descriptions.Item label="place_limit">{product.place_limit}</Descriptions.Item>
                <Descriptions.Item label="created">{product.created || "-"}</Descriptions.Item>
                <Descriptions.Item label="updated">{product.updated || "-"}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">데이터가 없습니다.</Text>
            )}
          </Card>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Popconfirm
              title="정말 탈퇴시키겠습니까?"
              description="이 작업은 되돌릴 수 없습니다."
              okText="탈퇴"
              cancelText="취소"
              okButtonProps={{ danger: true }}
              onConfirm={handleWithdraw}
            >
              <Button danger type="primary" loading={loading}>
                탈퇴
              </Button>
            </Popconfirm>
          </Space>
        </Spin>
      </Card>
    </Space>
  );
}
