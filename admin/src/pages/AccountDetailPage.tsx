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
  deleteAllData, // ✅ deleteAllData(id)
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
  const { userKey: id } = useParams<{ userKey: string }>();

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

  // ✅ delete all state (탈퇴와 별개)
  const [deletingAll, setDeletingAll] = useState(false);

  // ✅ status 기반 버튼 비활성화 (active / deactive 두 가지만)
  const accountStatus = (account?.status ?? "").toString().trim().toLowerCase();
  const disableWithdrawByStatus = accountStatus === "deactive"; // deactive이면 탈퇴 비활성화
  const disableDeleteByStatus = accountStatus === "active"; // active이면 삭제 비활성화

  // ✅ 작업 중에는 서로 버튼도 잠그기(중복 실행 방지)
  const disableDelete = disableDeleteByStatus || deletingAll || loading;
  const disableWithdraw = disableWithdrawByStatus || loading || deletingAll;

  // ✅ A/B 비교에 따른 A 색상
  // A > B : red, A = B : black, A < B : blue
  const getCountColor = useCallback((a: number, b: number) => {
    if (a > b) return "#ff4d4f"; // red
    if (a < b) return "#1677ff"; // blue
    return "rgba(0,0,0,0.88)"; // black(antd 기본 텍스트 느낌)
  }, []);

  // ✅ CSS 파일 없이 라벨(필드명) 배경색 넣기
  const labelStyle = useMemo(
    () => ({
      background: "#7fdad6",
      fontWeight: 600,
      width: 200,
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

  // ✅ 2단계 컨펌 후 전체 데이터 삭제
  const handleDeleteAll = async () => {
    if (!id) return;

    Modal.confirm({
      title: "정말 모든 데이터를 삭제할까요?",
      content: (
        <div>
          <Text>
            이 작업은 <Text strong type="danger">되돌릴 수 없습니다.</Text>
          </Text>
          <br />
          <Text type="secondary">
            계정/상품/카테고리/장소/이력 등 관련 데이터가 모두 삭제될 수 있습니다.
          </Text>
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

  const minValue = 0;

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

    // const min = editField === "category_limit" ? (category?.list?.length ?? 0) : placeList.length;
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

  // ✅ A/B 값 미리 계산 (JSX 깔끔하게)
  const categoryCount = category?.list?.length ?? 0;
  const categoryLimit = product?.category_limit ?? 0;
  const placeCount = placeList.length;
  const placeLimit = product?.place_limit ?? 0;

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
        {errorMsg ? (
          <Alert type="error" showIcon message={errorMsg} style={{ marginBottom: 12 }} />
        ) : null}

        <Spin spinning={loading || deletingAll}>
          {/* Account */}
          <Card type="inner" title="Account" style={{ borderRadius: 10 }} bodyStyle={{ paddingTop: 12 }}>
            {account ? (
              <Descriptions bordered size="small" column={2} labelStyle={labelStyle} contentStyle={contentStyle}>
                <Descriptions.Item label="id">{account.id || "-"}</Descriptions.Item>
                <Descriptions.Item label="type">
                  <Tag>{account.type}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="status">
                  <Tag color={accountStatus === "active" ? "green" : "red"}>{account.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="userKey">{account.userKey}</Descriptions.Item>

                <Descriptions.Item label="name">{account.name || "-"}</Descriptions.Item>
                <Descriptions.Item label="phone">
                  {account.phone
                    ? `${account.callingCode ? `+${account.callingCode} ` : ""}${account.phone}`
                    : "-"}
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
                <Descriptions.Item label="id" span={2}>
                  {product.id || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="category_limit(사용/제한)">
                  <Space size={8}>
                    {/* ✅ A/B에서 A만 컬러 적용 */}
                    <span>
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
                  <Space size={8}>
                    {/* ✅ A/B에서 A만 컬러 적용 */}
                    <span>
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

          {id ? <ProductHistoryTable userKey={id} /> : null}

          {/* ✅ 탈퇴 + 삭제 버튼 */}
          <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: 20 }}>
            {/* 삭제: status가 active면 비활성화 */}
            <Popconfirm
              title="정말 전체 데이터를 삭제할까요?"
              description="삭제 후 복구할 수 없습니다. (2단계 확인이 한 번 더 뜹니다)"
              okText="다음"
              cancelText="취소"
              okButtonProps={{ danger: true }}
              onConfirm={handleDeleteAll}
              disabled={disableDelete}
            >
              <Button danger loading={deletingAll} disabled={disableDelete}>
                삭제
              </Button>
            </Popconfirm>

            {/* 탈퇴: status가 deactive면 비활성화 */}
            <Popconfirm
              title="정말 탈퇴시키겠습니까?"
              description="이 작업은 되돌릴 수 없습니다."
              okText="탈퇴"
              cancelText="취소"
              okButtonProps={{ danger: true }}
              onConfirm={handleWithdraw}
              disabled={disableWithdraw}
            >
              <Button danger type="primary" loading={loading} disabled={disableWithdraw}>
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
        okButtonProps={{ disabled: !canSave }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
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

          {reasonType === "직접입력" && (
            <Input
              placeholder="사유를 입력하세요"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          )}

          <Text type="secondary">
            사유는 이력(Audit) 기록에 함께 저장되어 추후 변경 내역 조회 시 표시됩니다.
          </Text>
        </Space>
      </Modal>
    </Space>
  );
}