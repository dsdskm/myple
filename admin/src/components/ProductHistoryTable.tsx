// src/components/ProductHistoryTable.tsx
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Button, Card, Input, Space, Table, Tag, Typography } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { getProductHistory } from "@/services/api";
import { ProductHistoryItem } from "@/types/product.history.item";

const { Text } = Typography;

type RowKey = string | number;

const safe = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const normalize = (v: unknown) => safe(v).trim().toLowerCase();

/** 원시값은 문자열로, 객체/배열은 JSON 한 줄로 반환 */
const toValueString = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean") return String(val);
    try {
        return JSON.stringify(val);
    } catch {
        return String(val);
    }
};

/** ✅ 객체에 키가 1개면 그 값만 추출. 아니면 한 줄 JSON 문자열 */
const getOnlyValue = (obj: unknown) => {
    if (obj === null || obj === undefined) return "";
    if (typeof obj !== "object") return toValueString(obj);
    if (Array.isArray(obj)) return JSON.stringify(obj);

    const keys = Object.keys(obj as Record<string, unknown>);
    if (keys.length === 1) {
        return toValueString((obj as Record<string, unknown>)[keys[0]]);
    }
    try {
        return JSON.stringify(obj);
    } catch {
        return String(obj);
    }
};

interface Props {
    userKey: string;
}

export default function ProductHistoryTable({ userKey }: Props) {
    const [data, setData] = useState<ProductHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // 검색어
    const [search, setSearch] = useState("");

    // 클라이언트 페이지네이션
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
    });

    const load = async () => {
        if (!userKey) return;
        try {
            setLoading(true);
            setErrorMsg("");
            const list = await getProductHistory(userKey);
            // 백엔드가 정렬해주지 않는 경우를 대비해 id 기준으로 내림차순 정렬
            const sorted = (list ?? []).slice().sort((a, b) => safe(b.id).localeCompare(safe(a.id)));
            setData(sorted);
            setPagination((p) => ({ ...p, current: 1 }));
        } catch (e: any) {
            setErrorMsg(e?.message ?? "Failed to load product history");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userKey]);

    // 검색 필터
    const filteredData = useMemo(() => {
        const q = normalize(search);
        if (!q) return data;
        return data.filter((h) => {
            const hay = [
                h.id,
                h.reason,
                h.updated,
                ...(h.changedFields ?? []),
                // before/after까지 검색 포함하려면 아래 두 줄 주석 해제
                // getOnlyValue(h.before),
                // getOnlyValue(h.after),
            ]
                .map(normalize)
                .join(" ");
            return hay.includes(q);
        });
    }, [data, search]);

    const visibleCount = useMemo(() => {
        const pageSize = pagination.pageSize ?? 10;
        const current = pagination.current ?? 1;
        const start = (current - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end).length;
    }, [filteredData, pagination]);

    // ✅ 모든 sorter 제거
    const columns: ColumnsType<ProductHistoryItem> = [
        {
            title: "id",
            dataIndex: "id",
            key: "id",
            width: 120,
            fixed: "left",
            render: (v) => <Text strong>{v}</Text>,
        },
        {
            title: "reason",
            dataIndex: "reason",
            key: "reason",
            width: 200,
            ellipsis: true,
            render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
        },
        {
            title: "changedFields",
            dataIndex: "changedFields",
            key: "changedFields",
            width: 120,
            render: (arr?: string[]) =>
                arr?.length ? (
                    <Space size={4} wrap>
                        {arr.map((f) => (
                            <Tag key={f}>{f}</Tag>
                        ))}
                    </Space>
                ) : (
                    <Text type="secondary">-</Text>
                ),
        },
        {
            title: "before",
            dataIndex: "before",
            key: "before",
            width: 100,
            render: (obj) => {
                const s = getOnlyValue(obj);
                return s ? <Text>{s}</Text> : <Text type="secondary">-</Text>;
            },
        },
        {
            title: "after",
            dataIndex: "after",
            key: "after",
            width: 100,
            render: (obj) => {
                const s = getOnlyValue(obj);
                return s ? <Text>{s}</Text> : <Text type="secondary">-</Text>;
            },
        },
        {
            title: "updated",
            dataIndex: "updated",
            key: "updated",
            width: 200,
            render: (v) => (v ? <Text>{v}</Text> : <Text type="secondary">-</Text>),
        },
    ];

    const rowKey = (record: ProductHistoryItem): RowKey => record.id;

    const topCountText = useMemo(() => {
        if (loading) return "로딩 중...";
        if (search.trim()) {
            return `검색 결과 ${filteredData.length.toLocaleString()} / 전체 ${data.length.toLocaleString()}건 (현재 ${visibleCount}건 표시)`;
        }
        return `총 ${data.length.toLocaleString()}건 (현재 ${visibleCount}건 표시)`;
    }, [loading, search, filteredData.length, data.length, visibleCount]);

    const handleTableChange = (next: TablePaginationConfig) => {
        // ✅ 정렬은 사용하지 않으므로 페이지네이션만 반영
        setPagination(next);
    };

    return (
        <Card
            title="Product History"
            extra={
                <Space>
                    <Input
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="검색: id, reason, changedFields, updated"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPagination((p) => ({ ...p, current: 1 }));
                        }}
                        style={{ width: 360 }}
                    />
                    <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
                        새로고침
                    </Button>
                    <Text type="secondary">{topCountText}</Text>
                </Space>
            }
            style={{ borderRadius: 12 }}
            bodyStyle={{ paddingTop: 12 }}
        >
            {errorMsg ? <Text type="danger">{errorMsg}</Text> : null}

            <Table<ProductHistoryItem>
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
                scroll={{ x: 1000 }}
            />
        </Card>
    );
}