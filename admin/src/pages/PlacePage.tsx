import { getAllPlaces } from "@/services/api";
import { Place } from "@/types/place";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Card, Input, Space, Table, Tag, Typography, Grid, Tooltip, Button } from "antd";
import { ReloadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import type { TableRef } from "antd/es/table";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const normalize = (v: unknown) => safe(v).trim().toLowerCase();

export default function PlacePage() {
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

      // ✅ 장소 목록 + 카테고리 문서 병렬 로드
      const [places] = await Promise.all([
        getAllPlaces(),
      ]);

      const list = Array.isArray(places) ? places : [];
      setData(list);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "장소 데이터를 불러오지 못했습니다.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowKey = (record: Place, index?: number): string => {
    // Place.id 타입이 string/number 섞여도 안전하게 처리
    const id = (record as any).id;
    return safe(id) || `place-${index ?? 0}`;
  };

  // ✅ 검색 대상: id, name, address, creator
  const filteredData = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;

    return data.filter((p) => {
      const hay = [(p as any).id, (p as any).name, (p as any).address, (p as any).creator]
        .map(normalize)
        .join(" ");
      return hay.includes(q);
    });
  }, [data, search]);

  const totalCount = data.length;

  const columns: ColumnsType<Place> = useMemo(() => {
    if (isMobile) {
      /**
       * ✅ 모바일: "장소", "방문내역" 2개 컬럼만
       * - 가로 스크롤 유발하는 width 고정 최소화
       * - 긴 텍스트는 줄바꿈(wordBreak) 처리
       */
      return [
        {
          title: "장소",
          key: "place",
          dataIndex: "name",
          render: (v, record) => {
            return (
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Text strong style={{ wordBreak: "break-word" }}>
                  {safe(v)}
                </Text>

                <Space size={6} wrap>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {safe((record as any).creator)}
                  </Text>
                </Space>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    wordBreak: "break-word",
                    lineHeight: 1.2,
                  }}
                >
                  {safe((record as any).address)}
                </Text>
              </Space>
            );
          },
        },
        {
          title: "방문내역",
          key: "history",
          align: "center",
          width: 90,
          render: (_, record) => <Tag>{(record as any).historyList?.length ?? 0}건</Tag>,
        },
      ];
    }

    // ✅ 데스크탑: 기존 컬럼 유지 + 카테고리 title은 API에서 매칭
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
        sorter: (a, b) => safe((a as any).name).localeCompare(safe((b as any).name), "ko"),
        render: (v) => <Text strong>{v}</Text>,
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
        render: (_, record) => <Tag>{(record as any).historyList?.length ?? 0}건</Tag>,
      },
      {
        title: "등록일",
        dataIndex: "created",
        key: "created",
        width: 180,
        sorter: (a, b) =>
          new Date((a as any).created).getTime() - new Date((b as any).created).getTime(),
      },
    ];
  }, [isMobile]);

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
          // ✅ 모바일: 가로 스크롤 없게 / 데스크탑만 x스크롤 허용
          scroll={isMobile ? undefined : { x: 1000 }}
        // ✅ row 클릭 이벤트 제거: onRow 자체를 넣지 않음
        />
      </Space>
    </Card>
  );
}