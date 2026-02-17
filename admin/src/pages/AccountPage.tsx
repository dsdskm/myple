import { deleteAllDataByIds, getUsers } from "@/services/api";
import { Account } from "@/types/account";
import { useEffect, useMemo, useState, useRef } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult, TableRowSelection } from "antd/es/table/interface";
import { Button, Card, Input, Modal, Space, Table, Tag, Typography, Grid } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/constants/routes";
import type { TableRef } from "antd/es/table";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const normalize = (v: unknown) => safe(v).trim().toLowerCase();

/** status 뱃지 컬러 매핑 (값이 바뀌어도 기본 동작은 유지) */
const statusColor = (status: string) => {
  const s = status.trim().toUpperCase();
  if (s === "ACTIVE") return "green";
  if (s === "INACTIVE") return "default";
  if (s === "BLOCKED") return "red";
  if (s === "PENDING") return "gold";
  return "blue";
};

export default function AccountPage() {
  const navigate = useNavigate();
  const tableRef = useRef<TableRef>(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Search
  const [search, setSearch] = useState("");

  // ✅ key는 무조건 string
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

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

  // ✅ rowKey는 무조건 string 반환
  const rowKey = (record: Account, index?: number): string => {
    return safe(record.id) || `${safe(record.id)}-${safe(record.email)}-${index ?? 0}`;
  };

  // ✅ 검색 대상: id, name, status, email
  const filteredData = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;

    return data.filter((a) => {
      const hay = [a.id, a.name, (a as any).status, a.email].map(normalize).join(" ");
      return hay.includes(q);
    });
  }, [data, search]);

  // 상단 카운트
  const totalCount = data.length;

  const visibleCount = useMemo(() => {
    const pageSize = pagination.pageSize ?? 20;
    const current = pagination.current ?? 1;

    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    return filteredData.slice(start, end).length;
  }, [filteredData, pagination]);

  // ✅ status filters를 실제 데이터 기반으로 자동 생성
  const statusFilters = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => {
      const s = safe((a as any).status).trim();
      if (s) set.add(s);
    });

    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "ko"))
      .map((v) => ({ text: v, value: v }));
  }, [data]);

  // ✅ 선택된 행들에서 삭제용 id 추출
  const selectedIds = useMemo(() => {
    const keySet = new Set(selectedRowKeys);

    return filteredData
      .filter((r, idx) => keySet.has(rowKey(r, idx)))
      .map((r) => safe(r.id))
      .filter((v): v is string => !!v);
  }, [filteredData, selectedRowKeys]);

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    Modal.confirm({
      title: "선택한 계정을 탈퇴 및 삭제할까요?",
      content: `총 ${selectedIds.length.toLocaleString()}개`,
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          setDeleting(true);
          setErrorMsg("");

          await deleteAllDataByIds(selectedIds);

          setSelectedRowKeys([]);
          setPagination((p) => ({ ...p, current: 1 }));
          await load();
        } catch (e: any) {
          setErrorMsg(e?.message ?? "Failed to delete users");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  // ✅ 모바일: name, status만 표시 (좌우 스크롤 제거)
  const columns: ColumnsType<Account> = useMemo(() => {
    if (isMobile) {
      return [
        {
          title: "name",
          dataIndex: "name",
          key: "name",
          sorter: (a, b) => safe(a.name).localeCompare(safe(b.name), "ko"),
          sortDirections: ["ascend", "descend"],
          ellipsis: true,
          render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
        },
        {
          title: "status",
          dataIndex: "status",
          key: "status",
          filters: statusFilters,
          onFilter: (value, record) => safe((record as any).status) === value,
          sorter: (a, b) => safe((a as any).status).localeCompare(safe((b as any).status), "ko"),
          sortDirections: ["ascend", "descend"],
          render: (v) => {
            const s = safe(v);
            if (!s) return <Text type="secondary">-</Text>;
            return (
              <Tag color={statusColor(s)} style={{ whiteSpace: "nowrap" }}>
                {s}
              </Tag>
            );
          },
        },
      ];
    }

    // ✅ 데스크톱: 기존 전체 컬럼
    return [
      {
        title: "id",
        dataIndex: "id",
        key: "id",
        width: 170,
        sorter: (a, b) => safe(a.id).localeCompare(safe(b.id), "en"),
        sortDirections: ["ascend", "descend"],
        render: (v) => <Text strong>{v}</Text>,
      },
      {
        title: "name",
        dataIndex: "name",
        key: "name",
        width: 160,
        sorter: (a, b) => safe(a.name).localeCompare(safe(b.name), "ko"),
        sortDirections: ["ascend", "descend"],
        ellipsis: true,
        render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
      },
      {
        title: "status",
        dataIndex: "status",
        key: "status",
        width: 140,
        filters: statusFilters,
        onFilter: (value, record) => safe((record as any).status) === value,
        sorter: (a, b) => safe((a as any).status).localeCompare(safe((b as any).status), "ko"),
        sortDirections: ["ascend", "descend"],
        render: (v) => {
          const s = safe(v);
          if (!s) return <Text type="secondary">-</Text>;
          return <Tag color={statusColor(s)}>{s}</Tag>;
        },
      },
      {
        title: "email",
        dataIndex: "email",
        key: "email",
        width: 280,
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
  }, [isMobile, statusFilters]);

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<Account> | SorterResult<Account>[],
  ) => {
    setPagination(nextPagination);
  };

  const topCountText = useMemo(() => {
    if (loading) return "로딩 중...";
    if (search.trim()) {
      return `검색 결과 ${filteredData.length.toLocaleString()} / 전체 ${totalCount.toLocaleString()}명 (현재 ${visibleCount}명 표시)`;
    }
    return `총 ${totalCount.toLocaleString()}명 (현재 ${visibleCount}명 표시)`;
  }, [loading, search, filteredData.length, totalCount, visibleCount]);

  // ✅ 체크박스 셀 전체 클릭 시 체크 토글
  const rowSelection: TableRowSelection<Account> = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys.map(String)),
      fixed: isMobile ? undefined : "right",
      columnWidth: isMobile ? 48 : 72,

      renderCell: (_checked, record, index, originNode) => {
        const key = rowKey(record, index);

        return (
          <div
            className="row-selection-cell"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 32,
              padding: isMobile ? "0 6px" : "0 10px",
              cursor: "pointer",
              userSelect: "none",
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const wrapper = e.currentTarget as HTMLDivElement;
              const input = wrapper.querySelector("input[type='checkbox']") as HTMLInputElement | null;

              if (input) {
                input.click();
                return;
              }

              setSelectedRowKeys((prev) => {
                const set = new Set(prev);
                const k = String(key);
                if (set.has(k)) set.delete(k);
                else set.add(k);
                return Array.from(set);
              });
            }}
          >
            {originNode}
          </div>
        );
      },
    }),
    [selectedRowKeys, rowKey, isMobile],
  );

  const canDelete = selectedRowKeys.length > 0;

  // ✅ 모바일 pagination 단순화(선택)
  const tablePagination = useMemo(() => {
    const base: TablePaginationConfig = {
      ...pagination,
      total: filteredData.length,
      showTotal: (t, range) => `${range[0]}-${range[1]} / ${t}`,
    };

    if (!isMobile) return base;

    return {
      ...base,
      showSizeChanger: false,
      simple: true,
    };
  }, [pagination, filteredData.length, isMobile]);

  return (
    <Card
      title="Accounts"
      // ✅ 모바일에선 extra 오른쪽에 두면 답답해서 아래로 내림
      extra={
        !isMobile ? (
          <Space>
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
              새로고침
            </Button>

            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!canDelete}
              loading={deleting}
              onClick={handleDeleteSelected}
            >
              선택 탈퇴 및 삭제 ({selectedRowKeys.length})
            </Button>
          </Space>
        ) : null
      }
      style={{ borderRadius: 12 }}
      bodyStyle={{ paddingTop: 12 }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {/* ✅ 모바일: 버튼을 위에 2개로 배치 */}
        {isMobile && (
          <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading} style={{ flex: 1 }}>
              새로고침
            </Button>

            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!canDelete}
              loading={deleting}
              onClick={handleDeleteSelected}
              style={{ flex: 1 }}
            >
              삭제 ({selectedRowKeys.length})
            </Button>
          </Space>
        )}

        <Space
          style={{ width: "100%", justifyContent: "space-between" }}
          wrap
          direction={isMobile ? "vertical" : "horizontal"}
          size={isMobile ? 8 : 12}
        >
          <Input.Search
            placeholder="검색: id, 이름, status, 이메일"
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
            style={{ width: isMobile ? "100%" : 420, maxWidth: "100%" }}
          />
          <Text type="secondary" style={{ width: isMobile ? "100%" : "auto" }}>
            {topCountText}
          </Text>
        </Space>

        {errorMsg ? <Text type="danger">{errorMsg}</Text> : null}

        <Table<Account>
          ref={tableRef}
          rowKey={rowKey}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={tablePagination}
          onChange={handleTableChange}
          size={isMobile ? "small" : "middle"}
          bordered={false}
          style={{ width: "100%" }}
          // ✅ 모바일은 scroll 제거 -> 좌우 스크롤 없음
          scroll={isMobile ? undefined : { x: 900 }}
          onRow={(record) => ({
            onClick: (e) => {
              const el = e.target as HTMLElement;

              // ✅ 체크박스 셀/체크박스 클릭이면 상세 이동 막기
              if (el.closest(".row-selection-cell")) return;
              if (el.closest(".ant-checkbox-wrapper")) return;

              navigate(PATH.ACCOUNT + `/${record.id}`);
            },
            style: { cursor: "pointer" },
          })}
        />
      </Space>
    </Card>
  );
}
