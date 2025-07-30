import {
  Alert,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Image,
  Stack,
  Text,
  Title,
  Paper,
  NumberInput,
  Notification,
} from "@mantine/core";
import Layout from "../components/layout";
import { Link, useParams } from "react-router-dom";
import { MenuItem, Category } from "../lib/models";
import useSWR from "swr";
import Loading from "../components/loading";
import {
  IconAlertTriangleFilled,
  IconShoppingCart,
  IconArrowLeft,
  IconPlus,
  IconMinus,
} from "@tabler/icons-react";
import { useState } from "react";

export default function MenuByIdPage() {
  const { menuId } = useParams();
  const { data: menu, isLoading, error } = useSWR<MenuItem>(
    `/menu/${menuId}`
  );
  const { data: category } = useSWR<Category>(
    menu ? `/categories/${menu.category_id}` : null
  );

  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount(cartCount + quantity);
    setQuantity(1);
  };

  return (
    <Layout>
      <Container className="mt-4" size="md">
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

        {!!menu && (
          <>
            <Paper shadow="md" p="md" radius="md" mb="md">
              <Group align="flex-start" wrap="nowrap">
                <Image
                  src={
                    menu.image_url ||
                    "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
                  }
                  alt={menu.name}
                  width={180}
                  height={180}
                  radius="md"
                  fallbackSrc="https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
                  style={{ objectFit: "cover" }}
                />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Title order={2} c="brown.7">
                    {menu.name}
                  </Title>
                  <Text c="dimmed">{menu.name_th}</Text>
                  <Group gap="xs">
                    {menu.is_popular ? (
                      <Badge color="yellow" variant="filled">
                        Popular
                      </Badge>
                    ) : null}
                    {menu.is_hot ? (
                      <Badge color="red" variant="filled">
                        Hot
                      </Badge>
                    ) : null}
                    {!menu.is_available ? (
                      <Badge color="gray" variant="light">
                        Unavailable
                      </Badge>
                    ) : (
                      <Badge color="green" variant="light">
                        Available
                      </Badge>
                    )}
                  </Group>
                  <Text size="lg" fw={700} c="brown.7">
                    ฿{menu.price}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {menu.description || "Delicious menu item"}
                  </Text>
                  <Group gap="xs" mt="sm">
                    <Text size="sm" c="dimmed">
                      Category:
                    </Text>
                    {category ? (
                      <Badge color="teal">{category.name}</Badge>
                    ) : (
                      <Badge color="gray">Loading...</Badge>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Paper>

            <Divider my="md" />

            <Group align="center" gap="md">
              <Group gap="xs">
                <Button
                  variant="light"
                  color="brown"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!menu.is_available}
                  leftSection={<IconMinus size={16} />}
                />
                <NumberInput
                  value={quantity}
                  onChange={(value) => setQuantity(Number(value))}
                  min={1}
                  max={10}
                  w={70}
                  size="sm"
                  disabled={!menu.is_available}
                />
                <Button
                  variant="light"
                  color="brown"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={!menu.is_available}
                  leftSection={<IconPlus size={16} />}
                />
              </Group>
              <Button
                leftSection={<IconShoppingCart size={16} />}
                color="brown"
                onClick={handleAddToCart}
                disabled={!menu.is_available}
              >
                {menu.is_available ? "Add to Cart" : "Unavailable"}
              </Button>
              <Button
                component={Link}
                to="/menus"
                variant="outline"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
              >
                Back to Menu
              </Button>
            </Group>

            {cartCount > 0 && (
              <Notification
                color="green"
                mt="md"
                withCloseButton={false}
                title="Added to cart!"
              >
                {cartCount} item(s) in cart
              </Notification>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}