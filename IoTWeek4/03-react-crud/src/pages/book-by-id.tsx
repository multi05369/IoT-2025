import { Alert, Badge, Button, Container, Divider } from "@mantine/core";
import Layout from "../components/layout";
import { Link, useParams } from "react-router-dom";
import { Book } from "../lib/models";
import useSWR from "swr";
import Loading from "../components/loading";
import { IconAlertTriangleFilled, IconEdit } from "@tabler/icons-react";

export default function BookByIdPage() {
  const { bookId } = useParams();
  const { data: book, isLoading, error } = useSWR<Book>(`/books/${bookId}`);

  return (
    <>
      <Layout>
        <Container className="mt-4">
          {/* You can use isLoading instead of !book */}
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
            <>
              <h1>{book.title}</h1>
              <p className="italic text-neutral-500 mb-4">โดย {book.author}</p>
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <img
                  src="https://placehold.co/150x200"
                  alt={book.title}
                  className="w-full object-cover aspect-[3/4]"
                />
                <div className="col-span-2 px-4 space-y-2 py-4">
                  <h3>รายละเอียดหนังสือ</h3>
                  <p className="indent-4">
                    {book.detail || "ไม่มีรายละเอียดหนังสือ"}
                  </p>
                  <h3>เรื่องย่อ</h3>
                  <p className="indent-4">
                    {book.abstract || "ไม่มีเรื่องย่อ"}
                  </p>
                  <h3>หมวดหมู่</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.genre ? (
                      <Badge color="teal">#{book.type}</Badge>
                    ) : (
                      <Badge color="gray">ไม่ระบุหมวดหมู่</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Divider className="mt-4" />
              <Button
                color="blue"
                size="xs"
                component={Link}
                to={`/books/${book.id}/edit`}
                className="mt-4"
                leftSection={<IconEdit />}
              >
                แก้ไขข้อมูลหนังสือ
              </Button>
            </>
          )}
        </Container>
      </Layout>
    </>
  );
}