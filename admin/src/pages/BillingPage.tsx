import { getBills, getOrders } from "@/services/api";
import type { Bill } from "@/types/bill";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/constants/routes";
import { Alert, Button, Card, Input, Space, Table, Tag, Typography, Modal, Descriptions, Spin } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { ReloadOutlined } from "@ant-design/icons";
import { Orders } from "@/types/toss.orders";

const { Title, Text } = Typography;

const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const normalize = (v: unknown) => safe(v).trim().toLowerCase();

type OrderStatusResponse = {
  orderId?: string;
  sku?: string;
  statusDeterminedAt?: string;
  status?: string;
  reason?: string;
};

export default function BillingPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
  });

  // Modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string>("");
  const [orderData, setOrderData] = useState<OrderStatusResponse | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const list = await getBills();
      setData(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to load bills");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;

    return data.filter((b) => {
      const hay = [b.id, b.creator, b.type, b.orderId, b.displayName, b.displayAmount, b.amount, b.currency, b.created]
        .map(normalize)
        .join(" ");
      return hay.includes(q);
    });
  }, [data, search]);

  const totalCount = data.length;

  const visibleCount = useMemo(() => {
    const pageSize = pagination.pageSize ?? 20;
    const current = pagination.current ?? 1;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end).length;
  }, [filteredData, pagination]);

  const topCountText = useMemo(() => {
    if (loading) return "로딩 중...";
    if (search.trim()) {
      return `검색 결과 ${filteredData.length.toLocaleString()} / 전체 ${totalCount.toLocaleString()}건 (현재 ${visibleCount}건 표시)`;
    }
    return `총 ${totalCount.toLocaleString()}건 (현재 ${visibleCount}건 표시)`;
  }, [loading, search, filteredData.length, totalCount, visibleCount]);

  const columns: ColumnsType<Bill> = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      ellipsis: true,
      sorter: (a, b) => safe(a.id).localeCompare(safe(b.id), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "creator",
      dataIndex: "creator",
      key: "creator",
      width: 160,
      sorter: (a, b) => safe(a.creator).localeCompare(safe(b.creator), "ko"),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
    },
    {
      title: "type",
      dataIndex: "type",
      key: "type",
      width: 120,
      sorter: (a, b) => safe(a.type).localeCompare(safe(b.type), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Tag>{v}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: "orderId",
      dataIndex: "orderId",
      key: "orderId",
      width: 180,
      sorter: (a, b) => safe(a.orderId).localeCompare(safe(b.orderId), "ko"),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
      render: (v) => (v ? <Text code>{v}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "displayName",
      dataIndex: "displayName",
      key: "displayName",
      width: 240,
      sorter: (a, b) => safe(a.displayName).localeCompare(safe(b.displayName), "ko"),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
    },
    {
      title: "displayAmount",
      dataIndex: "displayAmount",
      key: "displayAmount",
      width: 140,
      sorter: (a, b) => safe(a.displayAmount).localeCompare(safe(b.displayAmount), "ko"),
      sortDirections: ["ascend", "descend"],
      align: "right",
    },
    {
      title: "amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      sorter: (a, b) => (a.amount ?? 0) - (b.amount ?? 0),
      sortDirections: ["ascend", "descend"],
      align: "right",
      render: (v) => <Text>{Number(v ?? 0).toLocaleString()}</Text>,
    },
    {
      title: "currency",
      dataIndex: "currency",
      key: "currency",
      width: 120,
      sorter: (a, b) => safe(a.currency).localeCompare(safe(b.currency), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: "created",
      dataIndex: "created",
      key: "created",
      width: 180,
      sorter: (a, b) => new Date(a.created ?? 0).getTime() - new Date(b.created ?? 0).getTime(),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
    },
  ];

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<Bill> | SorterResult<Bill>[],
  ) => {
    setPagination(nextPagination);
  };

  const openOrderModal = async (bill: Bill) => {
    setSelectedBill(bill);
    setDetailOpen(true);
    setOrderData(null);
    setOrderError("");

    if (!bill.orderId) {
      setOrderError("orderId가 없습니다.");
      return;
    }

    try {
      setOrderLoading(true);

      // getOrders가 axios response 전체를 반환할 수 있으니 방어적으로 파싱
      const res = await getOrders(bill.creator, bill.orderId);
      console.log(`res`, res);
      setOrderData(res);
    } catch (e: any) {
      setOrderError(e?.message ?? "주문 상태 조회 실패");
      setOrderData(null);
    } finally {
      setOrderLoading(false);
    }
  };

  const statusTagColor = (status?: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
      case "DONE":
        return "green";
      case "REFUNDED":
        return "red";
      case "CANCELED":
      case "CANCELLED":
        return "volcano";
      case "PENDING":
      case "PROCESSING":
        return "blue";
      default:
        return "default";
    }
  };

  const labelStyle = useMemo(
    () => ({
      background: "#7fdad6",
      fontWeight: 600,
      width: 180,
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

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Billing
          </Title>
        }
        extra={
          <Space>
            <Button onClick={() => navigate(PATH.ROOT)}>대시보드</Button>
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
              새로고침
            </Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
        bodyStyle={{ paddingTop: 12 }}
      >
        {errorMsg ? <Alert type="error" showIcon message={errorMsg} style={{ marginBottom: 12 }} /> : null}

        {/* 검색 / 상태 표시 */}
        <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }} wrap>
          <Input.Search
            placeholder="검색: id, creator, type, orderId, displayName, displayAmount, amount, currency, created"
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            onSearch={(v) => {
              setSearch(v);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            style={{ width: 520, maxWidth: "100%" }}
          />
          <Text type="secondary">{topCountText}</Text>
        </Space>

        <Table<Bill>
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={{
            ...pagination,
            total: filteredData.length,
            showTotal: (t, range) => `${range[0]}-${range[1]} / ${t}`,
          }}
          onChange={handleTableChange}
          size="middle"
          bordered={false}
          style={{ width: "100%" }}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => openOrderModal(record),
            style: { cursor: "pointer" },
          })}
        />

        <Modal
          open={detailOpen}
          title="Order Status"
          onCancel={() => setDetailOpen(false)}
          footer={<Button onClick={() => setDetailOpen(false)}>닫기</Button>}
          destroyOnClose
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {selectedBill ? (
              <Card type="inner" title="Bill" style={{ borderRadius: 10 }} bodyStyle={{ paddingTop: 12 }}>
                <Descriptions bordered size="small" column={1} labelStyle={labelStyle} contentStyle={contentStyle}>
                  <Descriptions.Item label="orderId">{selectedBill.orderId || "-"}</Descriptions.Item>
                  <Descriptions.Item label="displayName">{selectedBill.displayName || "-"}</Descriptions.Item>
                  <Descriptions.Item label="displayAmount">{selectedBill.displayAmount || "-"}</Descriptions.Item>
                  <Descriptions.Item label="currency">{selectedBill.currency || "-"}</Descriptions.Item>
                </Descriptions>
              </Card>
            ) : null}

            <Card type="inner" title="Order Result" style={{ borderRadius: 10 }} bodyStyle={{ paddingTop: 12 }}>
              {orderError ? <Alert type="error" showIcon message={orderError} style={{ marginBottom: 12 }} /> : null}

              <Spin spinning={orderLoading}>
                {orderData ? (
                  <Descriptions bordered size="small" column={1} labelStyle={labelStyle} contentStyle={contentStyle}>
                    <Descriptions.Item label="orderId">{orderData.orderId || "-"}</Descriptions.Item>
                    <Descriptions.Item label="sku">{orderData.sku || "-"}</Descriptions.Item>
                    <Descriptions.Item label="status">
                      {orderData.status ? <Tag color={statusTagColor(orderData.status)}>{orderData.status}</Tag> : "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="statusDeterminedAt">
                      {orderData.statusDeterminedAt || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="reason">{orderData.reason || "-"}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Text type="secondary">{orderLoading ? "조회 중..." : "주문 정보를 불러오지 못했습니다."}</Text>
                )}
              </Spin>
            </Card>

            {/* REFUNDED일 때 안내 문구(요청 스펙 반영) */}
            {orderData?.status === "REFUNDED" ? (
              <Alert type="info" showIcon message="REFUNDED 상태인 경우 statusDeterminedAt은 환불 완료 일시입니다." />
            ) : null}
          </Space>
        </Modal>
      </Card>
    </Space>
  );
}
