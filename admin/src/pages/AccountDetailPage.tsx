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
  Modal,
  InputNumber,
  Select,
  Input,
  Grid,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "@/constants/routes";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCategory,
  getPlaces,
  getProductInfo,
  getUser,
  requestLogout,
  updateProduct,
  deleteAllData,
} from "@/services/api";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { Place } from "@/types/place";
import ProductHistoryTable from "@/components/ProductHistoryTable";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type ReasonOption = "환불" | "구매" | "기타" | "직접입력";

export type UpdateProductPayload = Partial<Omit<Product, "id" | "created">> & {
  reason?: string;
};

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { userKey: id } = useParams<{ userKey: string }>();

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [account, setAccount] = useState<Account | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [placeList, setPlaceList] = useState<Place[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [editField, setEditField] = useState<"category_limit" | "place_limit" | null>(null);
  const [draftValue, setDraftValue] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [reasonType, setReasonType] = useState<ReasonOption | null>(null);
  const [reasonText, setReasonText] = useState<string>("");

  const [deletingAll, setDeletingAll] = useState(false);

  const accountStatus = (account?.status ?? "").toString().trim().toLowerCase();
  const disableWithdrawByStatus = accountStatus === "deactive";
  const disableDeleteByStatus = accountStatus === "active";

  const disableDelete = disableDeleteByStatus || deletingAll || loading;
  const disableWithdraw = disableWithdrawByStatus || loading || deletingAll;

  const getCountColor = useCallback((a: number, b: number) => {
    if (a > b) return "#ff4d4f";
    if (a < b) return "#1677ff";
    return "rgba(0,0,0,0.88)";
  }, []);

  // ✅ 가로스크롤 방지 핵심 스타일
  const pageStyle = useMemo(
    () => ({
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden" as const,
    }),
    [],
  );

  const cardStyle = useMemo(
    () => ({
      borderRadius: 12,
      maxWidth: "100%",
      overflow: "hidden" as const,
    }),
    [],
  );

  const labelStyle = useMemo(
    () => ({
      background: "#7fdad6",
      fontWeight: 600,
      width: "auto",
      maxWidth: "45%",
      padding: isMobile ? "10px 12px" : "10px 14px",
      whiteSpace: "normal" as const,
      wordBreak: "break-word" as const,
    }),
    [isMobile],
  );

  const contentStyle = useMemo(
    () => ({
      background: "#ffffff",
      padding: isMobile ? "10px 12px" : "10px 14px",
      whiteSpace: "normal" as const,
      wordBreak: "break-word" as const,
      overflowWrap: "anywhere" as const,
      maxWidth: "100%",
    }),
    [isMobile],
  );

  const reloadAll = useCallback(async () => {
    try {
      if (!id) return;
      setLoading(true);
      setErrorMsg("");

      const [accountData, categoryData, productData, placeListRes] = await Promise.all([
        getUser(id),
        getCategory(id),
        getProductInfo(id),
        getPlaces(id),
      ]);

      setAccount(accountData ?? null);
      setCategory(categoryData ?? null);
      setProduct(productData ?? null);
      setPlaceList(placeListRes ?? []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to load detail data");
      setAccount(null);
      setCategory(null);
      setProduct(null);
      setPlaceList([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const handleWithdraw = async () => {
    if (!id) return;

    try {
      setLoading(true);
      await requestLogout(id);
      message.success("탈퇴 처리 완료");
      navigate(PATH.ACCOUNT);
    } catch (e: any) {
      message.error(e?.message ?? "탈퇴 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!id) return;

    Modal.confirm({
      title: "정말 모든 데이터를 삭제할까요?",
      content: (
        <div style={{ maxWidth: "100%", overflowWrap: "anywhere" }}>
          <Text>
            이 작업은{" "}
            <Text strong type="danger">
              되돌릴 수 없습니다.
            </Text>
          </Text>
          <br />
          <Text type="secondary">계정/상품/카테고리/장소/이력 등 관련 데이터가 모두 삭제될 수 있습니다.</Text>
        </div>
      ),
      okText: "삭제 진행",
      okType: "danger",
      cancelText: "취소",
      centered: true,
      onOk: async () => {
        try {
          setDeletingAll(true);
          await deleteAllData(id);
          message.success("전체 데이터 삭제 완료");
          navigate(PATH.ACCOUNT);
        } catch (e: any) {
          message.error(e?.message ?? "전체 데이터 삭제 실패");
        } finally {
          setDeletingAll(false);
        }
      },
    });
  };

  const openEdit = (field: "category_limit" | "place_limit") => {
    if (!product) return;
    const currentVal = field === "category_limit" ? product.category_limit : product.place_limit;
    setDraftValue(currentVal ?? 0);
    setEditField(field);
    setReasonType(null);
    setReasonText("");
  };

  const minValue = 0;

  const effectiveReason = useMemo(() => {
    if (!reasonType) return "";
    if (reasonType === "직접입력") return reasonText.trim();
    return reasonType;
  }, [reasonType, reasonText]);

  const canSave = useMemo(() => {
    const limitOk = draftValue != null && draftValue >= minValue;
    const reasonOk = !!effectiveReason;
    return !!editField && limitOk && reasonOk && !saving;
  }, [draftValue, minValue, effectiveReason, editField, saving]);

  const handleSave = async () => {
    if (!product || !editField || draftValue == null) return;

    const min = 0;
    if (draftValue < min) {
      message.error(
        editField === "category_limit"
          ? `최소 ${min} 이상이어야 합니다. (현재 카테고리 개수: ${min})`
          : `최소 ${min} 이상이어야 합니다. (현재 장소 개수: ${min})`,
      );
      return;
    }

    if (!effectiveReason) {
      message.error("변경 사유를 선택하거나 입력해 주세요.");
      return;
    }

    try {
      setSaving(true);

      const payload: UpdateProductPayload =
        editField === "category_limit"
          ? { category_limit: draftValue, reason: effectiveReason }
          : { place_limit: draftValue, reason: effectiveReason };

      const updated = await updateProduct(product.id, payload);

      if (updated) {
        message.success("변경되었습니다.");
        setEditField(null);
        setDraftValue(null);
        setReasonType(null);
        setReasonText("");
        await reloadAll();
      } else {
        message.error("변경에 실패했습니다.");
      }
    } catch (err: any) {
      message.error(err?.message ?? "변경 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setDraftValue(null);
    setReasonType(null);
    setReasonText("");
  };

  const categoryCount = category?.list?.length ?? 0;
  const categoryLimit = product?.category_limit ?? 0;
  const placeCount = placeList.length;
  const placeLimit = product?.place_limit ?? 0;

  const descCols = isMobile ? 1 : 2;

  return (
    <div style={pageStyle}>
      <Space direction="vertical" size={12} style={{ width: "100%", maxWidth: "100%" }}>
        <Card
          title={
            <Title level={4} style={{ margin: 0, maxWidth: "100%", overflowWrap: "anywhere" }}>
              Account Detail
            </Title>
          }
          extra={
            <Button onClick={() => navigate(PATH.ACCOUNT)} style={{ maxWidth: "100%" }}>
              목록으로
            </Button>
          }
          style={cardStyle}
          bodyStyle={{ padding: isMobile ? 12 : undefined, maxWidth: "100%" }}
        >
          {errorMsg ? (
            <Alert type="error" showIcon message={errorMsg} style={{ marginBottom: 12, maxWidth: "100%" }} />
          ) : null}

          <Spin spinning={loading || deletingAll}>
            <Space direction="vertical" size={12} style={{ width: "100%", maxWidth: "100%" }}>
              {/* Account */}
              <Card
                type="inner"
                title="Account"
                style={{ borderRadius: 10, maxWidth: "100%", overflow: "hidden" }}
                bodyStyle={{
                  paddingTop: 12,
                  paddingLeft: isMobile ? 12 : undefined,
                  paddingRight: isMobile ? 12 : undefined,
                }}
              >
                {account ? (
                  <Descriptions
                    bordered
                    size="small"
                    column={descCols}
                    labelStyle={labelStyle}
                    contentStyle={contentStyle}
                    style={{ maxWidth: "100%" }}
                  >
                    <Descriptions.Item label="id">{account.id || "-"}</Descriptions.Item>
                    <Descriptions.Item label="type">
                      <Tag style={{ maxWidth: "100%", whiteSpace: "normal", wordBreak: "break-word" }}>
                        {account.type}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="status">
                      <Tag
                        color={accountStatus === "active" ? "green" : "red"}
                        style={{ maxWidth: "100%", whiteSpace: "normal", wordBreak: "break-word" }}
                      >
                        {account.status}
                      </Tag>
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

                    <Descriptions.Item label="scope" span={isMobile ? 1 : 2}>
                      {account.scope || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="agreedTerms" span={isMobile ? 1 : 2}>
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
              <Card
                type="inner"
                title="Places"
                style={{ borderRadius: 10, maxWidth: "100%", overflow: "hidden" }}
                bodyStyle={{ paddingTop: 12 }}
              >
                <Descriptions
                  bordered
                  size="small"
                  column={1}
                  labelStyle={labelStyle}
                  contentStyle={contentStyle}
                  style={{ maxWidth: "100%" }}
                >
                  <Descriptions.Item label="place count">{placeList.length}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Category */}
              <Card
                type="inner"
                title="Category"
                style={{ borderRadius: 10, maxWidth: "100%", overflow: "hidden" }}
                bodyStyle={{ paddingTop: 12 }}
              >
                {category ? (
                  <Space direction="vertical" size={12} style={{ width: "100%", maxWidth: "100%" }}>
                    <Descriptions
                      bordered
                      size="small"
                      column={descCols}
                      labelStyle={labelStyle}
                      contentStyle={contentStyle}
                      style={{ maxWidth: "100%" }}
                    >
                      <Descriptions.Item label="id">{category.id || "-"}</Descriptions.Item>
                      <Descriptions.Item label="count">{category.list?.length ?? 0}</Descriptions.Item>
                      <Descriptions.Item label="created">{category.created || "-"}</Descriptions.Item>
                      <Descriptions.Item label="updated">{category.updated || "-"}</Descriptions.Item>
                    </Descriptions>

                    <div style={{ maxWidth: "100%" }}>
                      <Text strong>Category List</Text>
                      <List
                        size="small"
                        bordered
                        style={{ marginTop: 8, borderRadius: 8, maxWidth: "100%" }}
                        dataSource={category.list ?? []}
                        locale={{ emptyText: "카테고리 리스트가 없습니다." }}
                        renderItem={(item) => (
                          <List.Item style={{ paddingLeft: 12, paddingRight: 12, maxWidth: "100%" }}>
                            <Space style={{ minWidth: 0, maxWidth: "100%" }} wrap={false}>
                              <Tag style={{ maxWidth: 140, whiteSpace: "normal", wordBreak: "break-word" }}>
                                {item.id}
                              </Tag>
                              <Text style={{ minWidth: 0, maxWidth: "100%" }} ellipsis>
                                {item.title}
                              </Text>
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
              <Card
                type="inner"
                title="Product"
                style={{ borderRadius: 10, maxWidth: "100%", overflow: "hidden" }}
                bodyStyle={{ paddingTop: 12 }}
              >
                {product ? (
                  <Descriptions
                    bordered
                    size="small"
                    column={descCols}
                    labelStyle={labelStyle}
                    contentStyle={contentStyle}
                    style={{ maxWidth: "100%" }}
                  >
                    <Descriptions.Item label="id" span={isMobile ? 1 : 2}>
                      {product.id || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="category_limit(사용/제한)">
                      <Space size={8} wrap style={{ maxWidth: "100%" }}>
                        <span style={{ maxWidth: "100%", overflowWrap: "anywhere" }}>
                          <Text style={{ color: getCountColor(categoryCount, categoryLimit), fontWeight: 600 }}>
                            {categoryCount}
                          </Text>
                          {" / "}
                          <Text>{categoryLimit}</Text>
                        </span>
                        <Button size="small" type="link" onClick={() => openEdit("category_limit")}>
                          수정
                        </Button>
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="place_limit(사용/제한)">
                      <Space size={8} wrap style={{ maxWidth: "100%" }}>
                        <span style={{ maxWidth: "100%", overflowWrap: "anywhere" }}>
                          <Text style={{ color: getCountColor(placeCount, placeLimit), fontWeight: 600 }}>
                            {placeCount}
                          </Text>
                          {" / "}
                          <Text>{placeLimit}</Text>
                        </span>
                        <Button size="small" type="link" onClick={() => openEdit("place_limit")}>
                          수정
                        </Button>
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="created">{product.created || "-"}</Descriptions.Item>
                    <Descriptions.Item label="updated">{product.updated || "-"}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Text type="secondary">데이터가 없습니다.</Text>
                )}
              </Card>

              {/* history table 내부에서 가로스크롤 유발할 수 있어서 감싸서 차단 */}
              {id ? (
                <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
                  <ProductHistoryTable userKey={id} />
                </div>
              ) : null}

              {/* ✅ 탈퇴 + 삭제 버튼 (모바일: 세로 + block) */}
              <Space
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  justifyContent: isMobile ? "stretch" : "flex-end",
                  marginTop: 20,
                }}
                direction={isMobile ? "vertical" : "horizontal"}
              >
                <Popconfirm
                  title="정말 전체 데이터를 삭제할까요?"
                  description="삭제 후 복구할 수 없습니다. (2단계 확인이 한 번 더 뜹니다)"
                  okText="다음"
                  cancelText="취소"
                  okButtonProps={{ danger: true }}
                  onConfirm={handleDeleteAll}
                  disabled={disableDelete}
                >
                  <Button danger loading={deletingAll} disabled={disableDelete} block={isMobile}>
                    삭제
                  </Button>
                </Popconfirm>

                <Popconfirm
                  title="정말 탈퇴시키겠습니까?"
                  description="이 작업은 되돌릴 수 없습니다."
                  okText="탈퇴"
                  cancelText="취소"
                  okButtonProps={{ danger: true }}
                  onConfirm={handleWithdraw}
                  disabled={disableWithdraw}
                >
                  <Button danger type="primary" loading={loading} disabled={disableWithdraw} block={isMobile}>
                    탈퇴
                  </Button>
                </Popconfirm>
              </Space>
            </Space>
          </Spin>
        </Card>

        <Modal
          open={!!editField}
          title={
            editField === "category_limit" ? "카테고리 제한 수정" : editField === "place_limit" ? "장소 제한 수정" : ""
          }
          onOk={handleSave}
          onCancel={handleCancel}
          confirmLoading={saving}
          destroyOnClose
          okText="저장"
          cancelText="취소"
          okButtonProps={{ disabled: !canSave }}
          centered
          width={isMobile ? "95vw" : 520}
        >
          <Space direction="vertical" size={12} style={{ width: "100%", maxWidth: "100%" }}>
            <div style={{ maxWidth: "100%" }}>
              <Text type="secondary" style={{ overflowWrap: "anywhere" }}>
                최소값: <Text strong>{minValue}</Text> (현재 {editField === "category_limit" ? "카테고리" : "장소"}{" "}
                개수)
              </Text>
              <InputNumber
                style={{ width: "100%", marginTop: 8 }}
                value={draftValue ?? undefined}
                min={minValue}
                step={1}
                onChange={(v) => setDraftValue(typeof v === "number" ? v : null)}
              />
            </div>

            <div style={{ maxWidth: "100%" }}>
              <Text strong>변경 사유</Text>
              <Select
                placeholder="변경 사유를 선택하세요"
                style={{ width: "100%", marginTop: 8 }}
                value={reasonType ?? undefined}
                onChange={(val: ReasonOption) => {
                  setReasonType(val);
                  if (val !== "직접입력") setReasonText("");
                }}
                options={[
                  { label: "환불", value: "환불" },
                  { label: "구매", value: "구매" },
                  { label: "기타", value: "기타" },
                  { label: "직접입력", value: "직접입력" },
                ]}
              />
            </div>

            {reasonType === "직접입력" && (
              <Input
                placeholder="사유를 입력하세요"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
              />
            )}

            <Text type="secondary" style={{ overflowWrap: "anywhere" }}>
              사유는 이력(Audit) 기록에 함께 저장되어 추후 변경 내역 조회 시 표시됩니다.
            </Text>
          </Space>
        </Modal>
      </Space>
    </div>
  );
}
