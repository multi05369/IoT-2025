import useSWR from "swr";
import { Book } from "../lib/models";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout";
import { Alert, Button, Container, Divider, TextInput, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import Loading from "../components/loading";
import { IconAlertTriangleFilled, IconTrash } from "@tabler/icons-react";
import { isNotEmpty, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import dayjs from "dayjs";

export default function BookEditById() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: book, isLoading, error, mutate } = useSWR<Book>(`/books/${bookId}`);
  const [isSetInitialValues, setIsSetInitialValues] = useState(false);

  const bookEditForm = useForm({
    initialValues: {
      title: "",
      author: "",
      publishedAt: new Date(),
      detail: "",
      abstract: "",
      type: "",
    },

    validate: {
      title: isNotEmpty("กรุณาระบุชื่อหนังสือ"),
      author: isNotEmpty("กรุณาระบุชื่อผู้แต่ง"),
      publishedAt: isNotEmpty("กรุณาระบุวันที่พิมพ์หนังสือ"),
      detail: isNotEmpty("กรุณาระบุรายละเอียดหนังสือ"),
      abstract: isNotEmpty("กรุณาระบุเรื่องย่อ"),
      type: isNotEmpty("กรุณาระบุประเภทหนังสือ"),
    },
  });

  const handleSubmit = async (values: typeof bookEditForm.values) => {
    try {
      setIsProcessing(true);
      
      // Transform the data to match API expectations
      const updateData = {
        ...values,
        publishedAt: values.publishedAt.toISOString(), // Convert Date to ISO string
      };
      
      const response = await axios.patch(`/books/${bookId}`, updateData);
      
      // Update the SWR cache with the new data
      mutate(response.data.book, false);
      
      notifications.show({
        title: "แก้ไขข้อมูลหนังสือสำเร็จ",
        message: "ข้อมูลหนังสือได้รับการแก้ไขเรียบร้อยแล้ว",
        color: "teal",
      });
      navigate(`/books/${bookId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบข้อมูลหนังสือ",
            message: "ไม่พบข้อมูลหนังสือที่ต้องการแก้ไข",
            color: "red",
          });
        } else if (error.response?.status === 400) {
          notifications.show({
            title: "ข้อมูลไม่ถูกต้อง",
            message: "กรุณาตรวจสอบข้อมูลที่กรอกใหม่อีกครั้ง",
            color: "red",
          });
        } else if (error.response?.status >= 500) { // Fixed the condition
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message: "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
      console.error("Error updating book:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await axios.delete(`/books/${bookId}`);
      notifications.show({
        title: "ลบหนังสือสำเร็จ",
        message: "ลบหนังสือเล่มนี้ออกจากระบบเรียบร้อยแล้ว",
        color: "red",
      });
      navigate("/books");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบข้อมูลหนังสือ",
            message: "ไม่พบข้อมูลหนังสือที่ต้องการลบ",
            color: "red",
          });
        } else if (error.response?.status >= 500) { // Fixed the condition
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message: "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
      console.error("Error deleting book:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isSetInitialValues && book) {
      const initialValues = {
        title: book.title,
        author: book.author,
        publishedAt: dayjs.unix(book.publishedAt as unknown as number).toDate(),
        detail: book.detail || "",
        abstract: book.abstract || "",
        type: book.type || "",
      };
      
      bookEditForm.setInitialValues(initialValues);
      bookEditForm.setValues(initialValues);
      setIsSetInitialValues(true);
    }
  }, [book, isSetInitialValues]);

  // Reset form when bookId changes
  useEffect(() => {
    setIsSetInitialValues(false);
    bookEditForm.reset();
  }, [bookId]);

  return (
    <Layout>
      <Container className="mt-8">
        <h1 className="text-xl">แก้ไขข้อมูลหนังสือ</h1>

        {isLoading && !error && <Loading />}
        {error && (
          <Alert
            color="red"
            title="เกิดข้อผิดพลาดในการอ่านข้อมูล"
            icon={<IconAlertTriangleFilled />}
          >
            {error.message}
          </Alert>
        )}

        {!!book && (
          <form onSubmit={bookEditForm.onSubmit(handleSubmit)} className="space-y-8">
            <TextInput
              label="ชื่อหนังสือ"
              placeholder="ชื่อหนังสือ"
              {...bookEditForm.getInputProps("title")}
            />

            <TextInput
              label="ชื่อผู้แต่ง"
              placeholder="ชื่อผู้แต่ง"
              {...bookEditForm.getInputProps("author")}
            />

            <DateTimePicker
              label="วันที่พิมพ์"
              placeholder="วันที่พิมพ์"
              {...bookEditForm.getInputProps("publishedAt")}
            />

            <TextInput
              label="ประเภทหนังสือ"
              placeholder="เช่น นิยาย, บันเทิง, การศึกษา, ประวัติศาสตร์"
              {...bookEditForm.getInputProps("type")}
            />

            <Textarea
              label="รายละเอียดหนังสือ"
              placeholder="รายละเอียดเกี่ยวกับหนังสือเล่มนี้"
              autosize
              minRows={3}
              maxRows={6}
              {...bookEditForm.getInputProps("detail")}
            />

            <Textarea
              label="เรื่องย่อ"
              placeholder="เรื่องย่อของหนังสือเล่มนี้"
              autosize
              minRows={3}
              maxRows={6}
              {...bookEditForm.getInputProps("abstract")}
            />

            <Divider />

            <div className="flex justify-between">
              <Button
                color="red"
                leftSection={<IconTrash />}
                size="xs"
                disabled={isProcessing}
                onClick={() => {
                  modals.openConfirmModal({
                    title: "คุณต้องการลบหนังสือเล่มนี้ใช่หรือไม่",
                    children: (
                      <span className="text-xs">
                        เมื่อคุณดำเนินการลบหนังสือเล่มนี้แล้ว จะไม่สามารถย้อนกลับได้
                      </span>
                    ),
                    labels: { confirm: "ลบ", cancel: "ยกเลิก" },
                    onConfirm: handleDelete,
                    confirmProps: {
                      color: "red",
                    },
                  });
                }}
              >
                ลบหนังสือนี้
              </Button>

              <Button type="submit" loading={isProcessing}>
                บันทึกข้อมูล
              </Button>
            </div>
          </form>
        )}
      </Container>
    </Layout>
  );
}