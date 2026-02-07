import { getUsers } from "@/services/api";
import { Account } from "@/types/account";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { Button, Card, Input, Space, Table, Tag, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/constants/routes";

const { Text } = Typography;

type RowKey = string | number;

const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const normalize = (v: unknown) => safe(v).trim().toLowerCase();

export default function AccountPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Account[]>([]);
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
      const list = await getUsers();
      setData(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to load users");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색은 표시 컬럼 대상으로만(요청 필드 + 유틸)
  const filteredData = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;

    return data.filter((a) => {
      const hay = [a.userKey, a.name, a.phone, a.birthday, a.gender, a.nationality, a.email].map(normalize).join(" ");

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

  // antd column filters 옵션 생성 (데이터에서 유니크 추출)
  const genderFilters = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => {
      const g = safe(a.gender).trim();
      if (g) set.add(g);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "ko"))
      .map((v) => ({ text: v, value: v }));
  }, [data]);

  const nationalityFilters = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => {
      const n = safe(a.nationality).trim();
      if (n) set.add(n);
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "ko"))
      .map((v) => ({ text: v, value: v }));
  }, [data]);

  const columns: ColumnsType<Account> = [
    {
      title: "userKey",
      dataIndex: "userKey",
      key: "userKey",
      width: 120,
      sorter: (a, b) => (a.userKey ?? 0) - (b.userKey ?? 0),
      sortDirections: ["ascend", "descend"],
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "name",
      dataIndex: "name",
      key: "name",
      width: 120,
      sorter: (a, b) => safe(a.name).localeCompare(safe(b.name), "ko"),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => safe(a.phone).localeCompare(safe(b.phone), "ko"),
      sortDirections: ["ascend", "descend"],
      width: 180,
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "birthday",
      dataIndex: "birthday",
      key: "birthday",
      width: 140,
      sorter: (a, b) => safe(a.birthday).localeCompare(safe(b.birthday), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "gender",
      dataIndex: "gender",
      key: "gender",
      width: 120,
      filters: genderFilters,
      onFilter: (value, record) => safe(record.gender) === value,
      sorter: (a, b) => safe(a.gender).localeCompare(safe(b.gender), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Tag>{v}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: "nationality",
      dataIndex: "nationality",
      key: "nationality",
      width: 140,
      filters: nationalityFilters,
      onFilter: (value, record) => safe(record.nationality) === value,
      sorter: (a, b) => safe(a.nationality).localeCompare(safe(b.nationality), "ko"),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Tag>{v}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: "email",
      dataIndex: "email",
      key: "email",
      width: 250,
      sorter: (a, b) => safe(a.email).localeCompare(safe(b.email), "ko"),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "created",
      dataIndex: "created",
      key: "created",

      sorter: (a, b) => new Date(a.created ?? 0).getTime() - new Date(b.created ?? 0).getTime(),
      sortDirections: ["ascend", "descend"],
      render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
    },
  ];

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<Account> | SorterResult<Account>[],
  ) => {
    setPagination(nextPagination);
  };

  const rowKey = (record: Account, index?: number): RowKey => {
    return record.id || `${record.userKey}-${record.email}-${index ?? 0}`;
  };

  const topCountText = useMemo(() => {
    if (loading) return "로딩 중...";
    if (search.trim()) {
      return `검색 결과 ${filteredData.length.toLocaleString()} / 전체 ${totalCount.toLocaleString()}명 (현재 ${visibleCount}명 표시)`;
    }
    return `총 ${totalCount.toLocaleString()}명 (현재 ${visibleCount}명 표시)`;
  }, [loading, search, filteredData.length, totalCount, visibleCount]);

  return (
    <Card
      title="Accounts"
      extra={
        <Space>
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
            placeholder="검색: userKey, 이름, 전화, 생일, 성별, 국적, 이메일"
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // 검색 바뀌면 첫 페이지로
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            onSearch={(v) => {
              setSearch(v);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            style={{ width: 420, maxWidth: "100%" }}
          />
          <Text type="secondary">{topCountText}</Text>
        </Space>

        {errorMsg ? <Text type="danger">{errorMsg}</Text> : null}

        <Table<Account>
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
          scroll={{ x: 1050 }}
          onRow={(record) => ({
            onClick: () => navigate(PATH.ACCOUNT + `/${record.userKey}`),
            style: { cursor: "pointer" },
          })}
        />
      </Space>
    </Card>
  );
}
