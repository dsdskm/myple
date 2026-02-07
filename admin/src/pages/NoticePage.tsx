import { getNotices } from "@/services/api";
import { Notice } from "@/types/notice";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { Button, Card, Input, Space, Table, Tag, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/constants/routes";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");
const { Text } = Typography;

type RowKey = string | number;

const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const normalize = (v: unknown) => safe(v).trim().toLowerCase();
const formatYYYYMMDD = (v?: string) => {
  if (!v || !/^\d{8}$/.test(v)) return "-";

  return dayjs(v, "YYYYMMDD").format("YYYY년 M월 D일 (ddd)");
};

export default function NoticePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Notice[]>([]);
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

  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const list = await getNotices();
      setData(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to load notices");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색은 표시 컬럼 대상으로만
  const filteredData = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;

    return data.filter((n) => {
      const hay = [
        n.id,
        n.title,
        n.content,
        n.isVisible ? "visible" : "hidden",
        n.startAt,
        n.endAt,
        n.created,
        n.updated,
      ]
        .map(normalize)
        .join(" ");
      return hay.includes(q);
    });
  }, [data, search]);

  // 상단 카운트 표시용
  const totalCount = data.length;

  const visibleCount = useMemo(() => {
    const pageSize = pagination.pageSize ?? 20;
    const current = pagination.current ?? 1;

    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    return filteredData.slice(start, end).length;
  }, [filteredData, pagination]);

  // isVisible 필터 옵션
  const visibleFilters = useMemo(() => {
    return [
      { text: "Visible", value: "true" },
      { text: "Hidden", value: "false" },
    ];
  }, []);

  const columns: ColumnsType<Notice> = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      width: 120,
      sorter: (a, b) => Number(a.id) - Number(b.id), // 숫자 id면 이게 더 정확
      defaultSortOrder: "descend", // ⭐ 기본 내림차순
      sortDirections: ["ascend", "descend"],
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "title",
      dataIndex: "title",
      key: "title",
      width: 220,
      sorter: (a, b) => safe(a.title).localeCompare(safe(b.title), "ko"),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "content",
      dataIndex: "content",
      key: "content",
      width: 380,
      ellipsis: true,
      sorter: (a, b) => safe(a.content).localeCompare(safe(b.content), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Text type="secondary">{safe(v)}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "isVisible",
      dataIndex: "isVisible",
      key: "isVisible",
      width: 120,
      filters: visibleFilters,
      onFilter: (value, record) => String(record.isVisible) === String(value),
      sorter: (a, b) => Number(!!a.isVisible) - Number(!!b.isVisible),
      sortDirections: ["ascend", "descend"],
      render: (v: boolean) => (v ? <Tag color="green">VISIBLE</Tag> : <Tag color="default">HIDDEN</Tag>),
    },
    {
      title: "startAt",
      dataIndex: "startAt",
      key: "startAt",
      width: 150,
      sorter: (a, b) => safe(a.startAt).localeCompare(safe(b.startAt), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => <Text>{formatYYYYMMDD(v)}</Text>,
    },
    {
      title: "endAt",
      dataIndex: "endAt",
      key: "endAt",
      width: 150,
      sorter: (a, b) => safe(a.endAt).localeCompare(safe(b.endAt), "ko"),
      sortDirections: ["ascend", "descend"],
       render: (v) => <Text>{formatYYYYMMDD(v)}</Text>,
    },
    {
      title: "created",
      dataIndex: "created",
      key: "created",
      width: 180,
      sorter: (a, b) => new Date(a.created ?? 0).getTime() - new Date(b.created ?? 0).getTime(),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "updated",
      dataIndex: "updated",
      key: "updated",
      width: 180,
      sorter: (a, b) => new Date(a.updated ?? 0).getTime() - new Date(b.updated ?? 0).getTime(),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
  ];

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<Notice> | SorterResult<Notice>[],
  ) => {
    setPagination(nextPagination);
  };

  const rowKey = (record: Notice, index?: number): RowKey => {
    return record.id || `${record.title}-${record.created}-${index ?? 0}`;
  };

  const topCountText = useMemo(() => {
    if (loading) return "로딩 중...";
    if (search.trim()) {
      return `검색 결과 ${filteredData.length.toLocaleString()} / 전체 ${totalCount.toLocaleString()}건 (현재 ${visibleCount}건 표시)`;
    }
    return `총 ${totalCount.toLocaleString()}건 (현재 ${visibleCount}건 표시)`;
  }, [loading, search, filteredData.length, totalCount, visibleCount]);

  return (
    <Card
      title="Notices"
      extra={
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate(PATH.NOTICE_NEW)}>
            공지사항 추가
          </Button>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            새로고침
          </Button>
        </Space>
      }
      style={{ borderRadius: 12 }}
      bodyStyle={{ paddingTop: 12 }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {/* 검색 / 상태 표시 */}
        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <Input.Search
            placeholder="검색: id, 제목, 내용, 공개여부, 시작/종료, 생성/수정"
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
            style={{ width: 460, maxWidth: "100%" }}
          />
          <Text type="secondary">{topCountText}</Text>
        </Space>

        {errorMsg ? <Text type="danger">{errorMsg}</Text> : null}

        <Table<Notice>
          rowKey={rowKey}
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
          scroll={{ x: 1400 }}
          onRow={(record) => ({
            onClick: () => navigate(PATH.NOTICE + `/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Space>
    </Card>
  );
}
