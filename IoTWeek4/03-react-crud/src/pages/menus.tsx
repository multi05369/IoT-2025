import Layout from "../components/layout";
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Image,
  Button,
  Paper,
  Center,
  Divider,
  ActionIcon,
  NumberInput,
  Notification,
  Loader,
  Alert,
} from "@mantine/core";
import {
  IconCoffee,
  IconPlus,
  IconMinus,
  IconHeart,
  IconShoppingCart,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { MenuItem, Category } from "../lib/models";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Menus() {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [addedToCartItems, setAddedToCartItems] = useState<Set<number>>(new Set());

  const { 
    cart, 
    favorites, 
    addToCart, 
    toggleFavorite, 
    getTotalItems 
  } = useCart();

  // Fetch menu items and categories from backend
  const {
    data: menuItems,
    error: menuError,
    isLoading: menuLoading,
  } = useSWR<MenuItem[]>("/menu");
  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR<Category[]>("/categories");

  const handleQuantityChange = (id: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, value) }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    addToCart(item.id, quantity);
    
    // Reset quantity to 1
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    
    // Show notification briefly
    setAddedToCartItems(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedToCartItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };

  const totalCartItems = getTotalItems();

  // Loading state
  if (menuLoading || categoriesLoading) {
    return (
      <Layout>
        <Container size="xl" py="xl">
          <Center h={400}>
            <Stack align="center">
              <Loader size="lg" />
              <Text>Loading menu...</Text>
            </Stack>
          </Center>
        </Container>
      </Layout>
    );
  }

  // Error state
  if (menuError || categoriesError) {
    return (
      <Layout>
        <Container size="xl" py="xl">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading menu"
            color="red"
          >
            Failed to load menu items. Please try again later.
          </Alert>
        </Container>
      </Layout>
    );
  }

  // No data state
  if (!menuItems || !categories || menuItems.length === 0) {
    return (
      <Layout>
        <Container size="xl" py="xl">
          <Center h={400}>
            <Stack align="center">
              <IconCoffee size={48} color="#8B4513" />
              <Text size="lg">No menu items available</Text>
            </Stack>
          </Center>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="xl" py="xl">
        <Center mb="xl">
          <Stack align="center" gap="xs">
            <IconCoffee size={48} color="#8B4513" />
            <Title order={1} c="brown.8" ta="center">
              เมนูกาแฟ
            </Title>
            <Text c="dimmed" ta="center" size="lg">
              Coffee Menu
            </Text>
            <Button
              component={Link}
              to="/cart"
              color="brown"
              leftSection={<IconShoppingCart size={16} />}
              mt="md"
              pos="relative"
            >
              Go to Cart
              {totalCartItems > 0 && (
                <Badge
                  color="red"
                  variant="filled"
                  size="sm"
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10
                  }}
                >
                  {totalCartItems}
                </Badge>
              )}
            </Button>
          </Stack>
        </Center>

        {categories.map((category) => {
          const categoryItems = menuItems.filter(
            (item) => item.category_id === category.id
          );

          if (categoryItems.length === 0) return null;

          return (
            <div key={category.id}>
              <Paper p="md" mb="lg" bg="brown.0">
                <Title order={2} c="brown.7" ta="center">
                  {category.name}
                </Title>
                <Text ta="center" c="dimmed" size="sm">
                  {category.name_th}
                </Text>
              </Paper>

              <Grid mb="xl">
                {categoryItems.map((item) => (
                  <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card
                      shadow="md"
                      padding="lg"
                      radius="md"
                      withBorder
                      h="100%"
                    >
                      <Card.Section>
                        <Image
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
                          }
                          height={200}
                          alt={item.name}
                          fallbackSrc="https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
                        />
                      </Card.Section>

                      <Group justify="space-between" mt="md" mb="xs">
                        <div>
                          <Text
                            fw={500}
                            size="lg"
                            component={Link}
                            to={`/menu/${item.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            {item.name}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {item.name_th}
                          </Text>
                        </div>

                        <Group gap="xs">
                          {item.is_popular && (
                            <Badge color="yellow" variant="filled">
                              Popular
                            </Badge>
                          )}
                          {item.is_hot && (
                            <Badge color="red" variant="filled">
                              Hot
                            </Badge>
                          )}
                        </Group>
                      </Group>

                      <Text size="sm" c="dimmed" mb="md">
                        {item.description || "Delicious coffee drink"}
                      </Text>

                      <Group justify="space-between" mb="md">
                        <Text size="xl" fw={700} c="brown.7">
                          ฿{item.price}
                        </Text>

                        <ActionIcon
                          variant={favorites.has(item.id) ? "filled" : "outline"}
                          color="red"
                          onClick={() => toggleFavorite(item.id)}
                        >
                          <IconHeart size={16} />
                        </ActionIcon>
                      </Group>

                      <Divider mb="md" />

                      <Group justify="space-between" align="center">
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="brown"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                (quantities[item.id] || 1) - 1
                              )
                            }
                            disabled={!item.is_available}
                          >
                            <IconMinus size={16} />
                          </ActionIcon>

                          <NumberInput
                            value={quantities[item.id] || 1}
                            onChange={(value) =>
                              handleQuantityChange(item.id, Number(value))
                            }
                            min={1}
                            max={10}
                            w={70}
                            size="sm"
                            disabled={!item.is_available}
                          />

                          <ActionIcon
                            variant="light"
                            color="brown"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                (quantities[item.id] || 1) + 1
                              )
                            }
                            disabled={!item.is_available}
                          >
                            <IconPlus size={16} />
                          </ActionIcon>
                        </Group>

                        <Button
                          leftSection={<IconShoppingCart size={16} />}
                          color="brown"
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.is_available}
                        >
                          {item.is_available ? "Add to Cart" : "Unavailable"}
                        </Button>
                      </Group>

                      <Button
                        component={Link}
                        to={`/menu/${item.id}`}
                        variant="light"
                        color="brown"
                        mt="md"
                        fullWidth
                      >
                        View Details
                      </Button>

                      {addedToCartItems.has(item.id) && (
                        <Notification
                          color="green"
                          mt="sm"
                          withCloseButton={false}
                          title="Added to cart!"
                        >
                          {cart[item.id] || 0} item(s) in cart
                        </Notification>
                      )}
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </div>
          );
        })}
      </Container>
    </Layout>
  );
}