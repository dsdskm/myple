import { useEffect, useMemo, useState } from "react";
import { Button, Card, DatePicker, Form, Input, Space, Switch, Typography, message, Grid } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "@/constants/routes";
import { createNotice, getNotice, updateNotice } from "@/services/api";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type FormValues = {
  title: string;
  content: string;
  isVisible: boolean;
  startAt: Dayjs | null;
  endAt: Dayjs | null;
};

export default function NoticeUpsertPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = useMemo(() => !!id, [id]);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;

      try {
        setLoading(true);
        const n = await getNotice(id);
        if (!n) {
          message.error("공지사항을 찾을 수 없어요.");
          navigate(PATH.NOTICE);
          return;
        }

        form.setFieldsValue({
          title: n.title ?? "",
          content: n.content ?? "",
          isVisible: !!n.isVisible,
          startAt: n.startAt ? dayjs(n.startAt, "YYYYMMDD") : null,
          endAt: n.endAt ? dayjs(n.endAt, "YYYYMMDD") : null,
        });
      } catch (e) {
        message.error("공지사항을 불러오는 중 오류가 발생했어요.");
        navigate(PATH.NOTICE);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);

      if (!values.startAt || !values.endAt) {
        message.error("시작일/종료일을 선택해 주세요.");
        return;
      }

      const payload = {
        title: values.title,
        content: values.content,
        isVisible: values.isVisible,
        startAt: values.startAt.format("YYYYMMDD"),
        endAt: values.endAt.format("YYYYMMDD"),
      };

      const ok = isEdit && id ? await updateNotice(id, payload) : await createNotice(payload);

      if (!ok) {
        message.error(isEdit ? "공지사항 수정에 실패했어요." : "공지사항 생성에 실패했어요.");
        return;
      }

      message.success(isEdit ? "공지사항이 수정됐어요." : "공지사항이 생성됐어요.");
      navigate(PATH.NOTICE);
    } catch (e) {
      message.error(isEdit ? "공지사항 수정 중 오류가 발생했어요." : "공지사항 생성 중 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            {isEdit ? "공지사항 수정" : "공지사항 추가"}
          </Title>
        }
        // ✅ 모바일은 버튼을 카드 아래로 내려서 가로 overflow 방지
        extra={
          !isMobile ? (
            <Space>
              <Button onClick={() => navigate(PATH.NOTICE)}>목록으로</Button>
              <Button type="primary" loading={submitting} onClick={() => form.submit()}>
                저장
              </Button>
            </Space>
          ) : null
        }
        style={{ borderRadius: 12, maxWidth: "100%", overflow: "hidden" }}
        bodyStyle={{ paddingTop: 12, maxWidth: "100%", overflowX: "hidden" }}
        loading={loading}
      >
        {isMobile && (
          <Space direction="vertical" size={8} style={{ width: "100%", marginBottom: 12 }}>
            <Button onClick={() => navigate(PATH.NOTICE)} block>
              목록으로
            </Button>
            <Button type="primary" loading={submitting} onClick={() => form.submit()} block>
              저장
            </Button>
          </Space>
        )}

        <Form<FormValues>
          form={form}
          layout="vertical"
          initialValues={{
            isVisible: true,
            startAt: null,
            endAt: null,
          }}
          onFinish={onSubmit}
          style={{ maxWidth: "100%" }}
        >
          <Form.Item label="제목" name="title" rules={[{ required: true, message: "제목을 입력해 주세요." }]}>
            <Input placeholder="공지 제목" maxLength={100} />
          </Form.Item>

          <Form.Item
            label={
              <Space direction="vertical" size={0} style={{ maxWidth: "100%" }}>
                <Text>내용</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  HTML/텍스트 모두 가능 (프론트 렌더링 방식에 맞춰 사용)
                </Text>
              </Space>
            }
            name="content"
            rules={[{ required: true, message: "내용을 입력해 주세요." }]}
          >
            <Input.TextArea placeholder="공지 내용을 입력하세요" rows={isMobile ? 8 : 10} />
          </Form.Item>

          {/* ✅ 모바일에서 한 줄로 놓으면 튀어나가서 세로 스택 */}
          <Space
            wrap
            direction={isMobile ? "vertical" : "horizontal"}
            size={isMobile ? 8 : 12}
            style={{ width: "100%", maxWidth: "100%" }}
          >
            <Form.Item
              label="노출 여부"
              name="isVisible"
              valuePropName="checked"
              style={{ marginBottom: isMobile ? 0 : undefined }}
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>

            <Form.Item
              label="노출 시작일"
              name="startAt"
              rules={[{ required: true, message: "시작일을 선택해 주세요." }]}
              style={{ width: isMobile ? "100%" : 200, marginBottom: isMobile ? 0 : undefined }}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder="시작일"
                inputReadOnly={isMobile}
                disabledDate={(d) => {
                  const endAt = form.getFieldValue("endAt");
                  return !!endAt && !!d && d.isAfter(endAt, "day");
                }}
                onChange={(v) => {
                  const endAt = form.getFieldValue("endAt");
                  if (v && !endAt) form.setFieldsValue({ endAt: v });
                }}
              />
            </Form.Item>

            <Form.Item
              label="노출 종료일"
              name="endAt"
              rules={[
                { required: true, message: "종료일을 선택해 주세요." },
                ({ getFieldValue }) => ({
                  validator: (_, endAt) => {
                    const startAt = getFieldValue("startAt");
                    if (!startAt || !endAt) return Promise.resolve();
                    return startAt.isAfter(endAt, "day")
                      ? Promise.reject(new Error("종료일은 시작일보다 빠를 수 없어요."))
                      : Promise.resolve();
                  },
                }),
              ]}
              style={{ width: isMobile ? "100%" : 200 }}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder="종료일"
                inputReadOnly={isMobile}
                disabledDate={(d) => {
                  const startAt = form.getFieldValue("startAt");
                  return !!startAt && !!d && d.isBefore(startAt, "day");
                }}
              />
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
