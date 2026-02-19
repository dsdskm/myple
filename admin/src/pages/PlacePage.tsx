import { getAllPlaces } from "@/services/api";
import { Place } from "@/types/place";
import { useEffect, useMemo, useState, useRef } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Card, Input, Space, Table, Tag, Typography, Grid, Tooltip, Button } from "antd";
import { ReloadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/constants/routes";
import type { TableRef } from "antd/es/table";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const normalize = (v: unknown) => safe(v).trim().toLowerCase();

/** 카테고리 번호별 컬러/텍스트 매핑 */
const getCategoryInfo = (cat: number) => {
  const mapping: Record<number, { label: string; color: string }> = {
    1: { label: "음식점", color: "orange" },
    2: { label: "카페", color: "gold" },
    3: { label: "숙소", color: "cyan" },
    4: { label: "명소", color: "green" },
  };
  return mapping[cat] || { label: `기타(${cat})`, color: "default" };
};

export default function PlacePage() {
  const navigate = useNavigate();
  const tableRef = useRef<TableRef>(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [data, setData] = useState<Place[]>([]);
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
      const list = await getAllPlaces();
      setData(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "장소 데이터를 불러오지 못했습니다.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rowKey = (record: Place, index?: number): string => {
    return safe(record.id) || `place-${index ?? 0}`;
  };

  // ✅ 검색 대상: id, name, address, creator
  const filteredData = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;

    return data.filter((p) => {
      const hay = [p.id, p.name, p.address, p.creator].map(normalize).join(" ");
      return hay.includes(q);
    });
  }, [data, search]);

  const totalCount = data.length;

  // ✅ 카테고리 필터 자동 생성
  const categoryFilters = useMemo(() => {
    const set = new Set<number>();
    data.forEach((p) => set.add(p.category));
    return Array.from(set)
      .sort((a, b) => a - b)
      .map((cat) => ({ text: getCategoryInfo(cat).label, value: cat }));
  }, [data]);

  const columns: ColumnsType<Place> = useMemo(() => {
    if (isMobile) {
      return [
        {
          title: "장소명",
          dataIndex: "name",
          key: "name",
          sorter: (a, b) => safe(a.name).localeCompare(safe(b.name), "ko"),
          render: (v, record) => (
            <Space direction="vertical" size={0}>
              <Text strong>{v}</Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {getCategoryInfo(record.category).label}
              </Text>
            </Space>
          ),
        },
        {
          title: "주소",
          dataIndex: "address",
          key: "address",
          ellipsis: true,
          render: (v) => <Text type="secondary">{v}</Text>,
        },
      ];
    }

    return [
      {
        title: "생성자",
        dataIndex: "creator",
        key: "creator",
        width: 150,
        ellipsis: true,
      },

      {
        title: "장소명",
        dataIndex: "name",
        key: "name",
        width: 200,
        sorter: (a, b) => safe(a.name).localeCompare(safe(b.name), "ko"),
        render: (v) => <Text strong>{v}</Text>,
      },
      {
        title: "카테고리",
        dataIndex: "category",
        key: "category",
        width: 120,
        filters: categoryFilters,
        onFilter: (value, record) => record.category === value,
        render: (v) => {
          const info = getCategoryInfo(v);
          return <Tag color={info.color}>{info.label}</Tag>;
        },
      },
      {
        title: "주소",
        dataIndex: "address",
        key: "address",
        width: 300,
        ellipsis: true,
        render: (v) => (
          <Tooltip title={v}>
            <Text>{v}</Text>
          </Tooltip>
        ),
      },

      {
        title: "히스토리",
        key: "history",
        width: 100,
        align: "center",
        render: (_, record) => <Tag>{record.historyList?.length ?? 0}건</Tag>,
      },
      {
        title: "등록일",
        dataIndex: "created",
        key: "created",
        width: 180,
        sorter: (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
      },
    ];
  }, [isMobile, categoryFilters]);

  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined />
          <span>Places</span>
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          새로고침
        </Button>
      }
      style={{ borderRadius: 12 }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Input.Search
            placeholder="장소명, 주소, 작성자 검색"
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            style={{ width: isMobile ? "100%" : 400 }}
          />
          <Text type="secondary">
            {loading ? "로딩 중..." : `검색 결과: ${filteredData.length} / 전체: ${totalCount}`}
          </Text>
        </Space>

        {errorMsg && <Text type="danger">{errorMsg}</Text>}

        <Table<Place>
          ref={tableRef}
          rowKey={rowKey}
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          size={isMobile ? "small" : "middle"}
          pagination={{
            ...pagination,
            total: filteredData.length,
            simple: isMobile,
            showTotal: (t) => `Total ${t}`,
          }}
          onChange={(next) => setPagination(next)}
          scroll={isMobile ? undefined : { x: 1000 }}
          onRow={(record) => ({
            onClick: () => {
              navigate(`${PATH.PLACE}/${record.id}`);
            },
            style: { cursor: "pointer" },
          })}
        />
      </Space>
    </Card>
  );
}
