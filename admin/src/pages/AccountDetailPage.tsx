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
  Select,       // ✅ [added]
  Input,        // ✅ [added]
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
} from "@/services/api";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { Place } from "@/types/place";
import ProductHistoryTable from "@/components/ProductHistoryTable";

const { Title, Text } = Typography;

// ✅ reason 옵션 타입/리스트
type ReasonOption = "환불" | "구매" | "기타" | "직접입력";

// ✅ updateProduct 호출 시 reason 포함해서 보낼 수 있도록 로컬 페이로드 타입 확장
export type UpdateProductPayload = Partial<Omit<Product, "id" | "created">> & {
  reason?: string;
};

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { userKey } = useParams<{ userKey: string }>();

  const [account, setAccount] = useState<Account | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [placeList, setPlaceList] = useState<Place[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ✅ edit modal states
  const [editField, setEditField] = useState<"category_limit" | "place_limit" | null>(null);
  const [draftValue, setDraftValue] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ reason states
  const [reasonType, setReasonType] = useState<ReasonOption | null>(null);
  const [reasonText, setReasonText] = useState<string>("");

  // ✅ CSS 파일 없이 라벨(필드명) 배경색 넣기
  const labelStyle = useMemo(
    () => ({
      background: "#7fdad6",
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

  // ✅ reloadAll: 페이지 소프트 리프레시(데이터 재조회)
  const reloadAll = useCallback(async () => {
    try {
      if (!userKey) return;
      setLoading(true);
      setErrorMsg("");

      const [accountData, categoryData, productData, placeListRes] = await Promise.all([
        getUser(userKey),
        getCategory(userKey),
        getProductInfo(userKey),
        getPlaces(userKey),
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
  }, [userKey]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

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

  // ✅ open edit modal
  const openEdit = (field: "category_limit" | "place_limit") => {
    if (!product) return;
    const currentVal = field === "category_limit" ? product.category_limit : product.place_limit;
    setDraftValue(currentVal ?? 0);
    setEditField(field);

    // reason 초기화
    setReasonType(null);
    setReasonText("");
  };

  // ✅ dynamic min value for validation
  const minValue = useMemo(() => {
    if (!editField) return 0;
    if (editField === "category_limit") {
      return category?.list?.length ?? 0;
    }
    return placeList.length;
  }, [editField, category, placeList]);

  // ✅ 유효한 reason 산출
  const effectiveReason = useMemo(() => {
    if (!reasonType) return "";
    if (reasonType === "직접입력") return reasonText.trim();
    return reasonType;
  }, [reasonType, reasonText]);

  // ✅ 저장 가능 여부 (OK 버튼 disabled 제어)
  const canSave = useMemo(() => {
    const limitOk = draftValue != null && draftValue >= minValue;
    const reasonOk = !!effectiveReason;
    return !!editField && limitOk && reasonOk && !saving;
  }, [draftValue, minValue, effectiveReason, editField, saving]);

  // ✅ save handler: 저장 → 모달 닫기 → 전체 리프레시
  const handleSave = async () => {
    if (!product || !editField || draftValue == null) return;

    const min = editField === "category_limit" ? (category?.list?.length ?? 0) : placeList.length;
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

      // ✅ reason 포함해서 페이로드 구성
      const payload: UpdateProductPayload =
        editField === "category_limit"
          ? { category_limit: draftValue, reason: effectiveReason }
          : { place_limit: draftValue, reason: effectiveReason };

      // 타입 충돌이 있을 경우 (서버 타입 미확장 시):
      // const updated = await updateProduct(product.id, payload as any);
      const updated = await updateProduct(product.id, payload);

      if (updated) {
        message.success("변경되었습니다.");
        // 모달 먼저 닫고
        setEditField(null);
        setDraftValue(null);
        setReasonType(null);
        setReasonText("");
        // 전체 데이터 소프트 리프레시
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

  // ✅ cancel modal
  const handleCancel = () => {
    setEditField(null);
    setDraftValue(null);
    setReasonType(null);
    setReasonText("");
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
              <Descriptions
                bordered
                size="small"
                column={2}
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {/* 1행: id (한 줄 전체) */}
                <Descriptions.Item label="id" span={2}>
                  {product.id || "-"}
                </Descriptions.Item>

                {/* 2행: category_limit (수정 버튼 포함) */}
                <Descriptions.Item label="category_limit">
                  <Space size={8}>
                    <span>{(category?.list?.length ?? 0)} / {product.category_limit}</span>
                    <Button size="small" type="link" onClick={() => openEdit("category_limit")}>
                      수정
                    </Button>
                  </Space>
                </Descriptions.Item>

                {/* 2행: place_limit (수정 버튼 포함) */}
                <Descriptions.Item label="place_limit">
                  <Space size={8}>
                    <span>{placeList.length} / {product.place_limit}</span>
                    <Button size="small" type="link" onClick={() => openEdit("place_limit")}>
                      수정
                    </Button>
                  </Space>
                </Descriptions.Item>

                {/* 3행: created, updated */}
                <Descriptions.Item label="created">
                  {product.created || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="updated">
                  {product.updated || "-"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">데이터가 없습니다.</Text>
            )}
          </Card>


          {userKey ? (
            <ProductHistoryTable userKey={userKey} />
          ) : null}


          <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: 20 }}>
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

      {/* ✅ Edit Modal */}
      <Modal
        open={!!editField}
        title={
          editField === "category_limit"
            ? "카테고리 제한 수정"
            : editField === "place_limit"
              ? "장소 제한 수정"
              : ""
        }
        onOk={handleSave}
        onCancel={handleCancel}
        confirmLoading={saving}
        destroyOnClose
        okText="저장"
        cancelText="취소"
        okButtonProps={{ disabled: !canSave }}   // ✅ 저장 가능 여부 반영
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {/* 숫자 입력 */}
          <div>
            <Text type="secondary">
              최소값: <Text strong>{minValue}</Text> (현재 {editField === "category_limit" ? "카테고리" : "장소"} 개수)
            </Text>
            <InputNumber
              style={{ width: "100%", marginTop: 8 }}
              value={draftValue ?? undefined}
              min={minValue}
              step={1}
              onChange={(v) => setDraftValue(typeof v === "number" ? v : null)}
            />
          </div>

          {/* 사유 선택 */}
          <div>
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

          {/* 직접 입력 사유 */}
          {reasonType === "직접입력" && (
            <Input
              placeholder="사유를 입력하세요"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          )}

          {/* 안내 */}
          <Text type="secondary">
            사유는 이력(Audit) 기록에 함께 저장되어 추후 변경 내역 조회 시 표시됩니다.
          </Text>
        </Space>
      </Modal>
    </Space>
  );
}