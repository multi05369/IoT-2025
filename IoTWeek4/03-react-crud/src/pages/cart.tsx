import {
  Alert,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Image,
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
  Notification,
  Center,
  TextInput,
  Textarea,
  Modal,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import Layout from "../components/layout";
import { Link } from "react-router-dom";
import { MenuItem } from "../lib/models";
import { IconShoppingCart, IconTrash, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import useSWR from "swr";
import { useCart } from "../context/CartContext";
import axios from "axios";

interface OrderData {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  table_number?: string;
  notes?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  items: Array<{
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }>;
}

export default function CartPage() {
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    table_number: "",
    notes: "",
    order_type: "takeaway",
    items: []
  });
  
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalItems 
  } = useCart();

  // Fetch all menu items (for details)
  const { data: menuItems, isLoading, error } = useSWR<MenuItem[]>("/menu");

  // Get cart items with details
  const cartItems =
    menuItems?.filter((item) => cart[item.id] && cart[item.id] > 0)?.map((item) => ({
      ...item,
      quantity: cart[item.id],
      subtotal: cart[item.id] * item.price,
    })) || [];

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleQuantityChange = (id: number, value: number) => {
    updateQuantity(id, value);
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const openCheckoutModal = () => {
    // Prepare order data
    const items = cartItems.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      special_instructions: null
    }));

    setOrderData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      table_number: "",
      notes: "",
      order_type: "takeaway",
      items: items
    });

    setShowCheckoutModal(true);
    setOrderError(null);
  };

  const handleSubmitOrder = async () => {
    if (!orderData.customer_name.trim()) {
      setOrderError("Customer name is required");
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Make API call to your backend (port 3000)
      const response = await axios.post('http://localhost:3000/api/v1/orders', {
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email || null,
        customer_phone: orderData.customer_phone || null,
        table_number: orderData.table_number || null,
        notes: orderData.notes || null,
        order_type: orderData.order_type,
        items: orderData.items
      });

      if (response.data.success) {
        // Clear cart and show success
        clearCart();
        setShowCheckoutModal(false);
        setCheckoutSuccess(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setCheckoutSuccess(false);
        }, 5000);
      } else {
        setOrderError("Failed to place order. Please try again.");
      }
    } catch (error: any) {
      console.error("Order submission error:", error);
      
      if (error.response?.data?.message) {
        setOrderError(error.response.data.message);
      } else if (error.message.includes('Network Error')) {
        setOrderError("Unable to connect to server. Please check if the API server is running on port 3000.");
      } else {
        setOrderError("Failed to place order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container size="md" py="xl">
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} c="brown.7">
            <IconShoppingCart size={28} style={{ verticalAlign: "middle" }} />{" "}
            Your Cart
          </Title>
          <Button
            component={Link}
            to="/menus"
            leftSection={<IconArrowLeft size={16} />}
            variant="outline"
            color="brown"
          >
            Back to Menu
          </Button>
        </Group>
        
        <Divider mb="md" />

        {isLoading && (
          <Center h={200}>
            <Stack align="center">
              <Text>Loading cart...</Text>
            </Stack>
          </Center>
        )}

        {error && (
          <Alert color="red" title="Error loading menu">
            Failed to load menu items. Please try again later.
          </Alert>
        )}

        {checkoutSuccess && (
          <Notification
            color="green"
            title="Order placed successfully!"
            onClose={() => setCheckoutSuccess(false)}
            mb="md"
            withCloseButton
            icon={<IconCheck size={16} />}
          >
            Thank you for your order. Your items will be prepared shortly.
          </Notification>
        )}

        {cartItems.length === 0 && !isLoading && !checkoutSuccess && (
          <Center h={300}>
            <Stack align="center">
              <IconShoppingCart size={64} color="#8B4513" />
              <Text size="xl" fw={500} c="brown.7">Your cart is empty</Text>
              <Text c="dimmed" ta="center">
                Add some delicious coffee items to your cart to get started
              </Text>
              <Button
                component={Link}
                to="/menus"
                leftSection={<IconArrowLeft size={16} />}
                mt="md"
                color="brown"
                size="lg"
              >
                Browse Menu
              </Button>
            </Stack>
          </Center>
        )}

        {cartItems.length > 0 && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text size="lg" fw={500}>
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart
              </Text>
              <Button
                variant="light"
                color="red"
                onClick={handleClearCart}
                size="sm"
              >
                Clear Cart
              </Button>
            </Group>

            {cartItems.map((item) => (
              <Paper key={item.id} shadow="xs" p="md" radius="md" withBorder>
                <Group align="flex-start" wrap="nowrap">
                  <Image
                    src={
                      item.image_url ||
                      "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
                    }
                    alt={item.name}
                    width={80}
                    height={80}
                    radius="md"
                    fallbackSrc="https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
                    style={{ objectFit: "cover" }}
                  />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text fw={500} size="lg">
                      {item.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {item.name_th}
                    </Text>
                    <Group gap="xs">
                      {item.is_popular && (
                        <Badge color="yellow" variant="filled" size="sm">
                          Popular
                        </Badge>
                      )}
                      {item.is_hot && (
                        <Badge color="red" variant="filled" size="sm">
                          Hot
                        </Badge>
                      )}
                    </Group>
                    {item.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {item.description}
                      </Text>
                    )}
                  </Stack>
                  <Stack align="end" gap={8} style={{ minWidth: 120 }}>
                    <Group gap="xs">
                      <Text size="sm" c="brown.7">
                        ฿{item.price}
                      </Text>
                      <Text size="sm" c="dimmed">×</Text>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) =>
                          handleQuantityChange(item.id, Number(value))
                        }
                        min={1}
                        max={10}
                        size="xs"
                        w={60}
                      />
                    </Group>
                    <Text fw={700} c="brown.7" size="lg">
                      ฿{item.subtotal}
                    </Text>
                    <Button
                      color="red"
                      size="xs"
                      variant="light"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Group>
              </Paper>
            ))}

            <Divider />

            <Paper p="lg" bg="brown.0" radius="md">
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" c="dimmed">Total Amount</Text>
                  <Text fw={700} size="xl" c="brown.8">
                    ฿{total.toFixed(2)}
                  </Text>
                </div>
                <Button
                  color="brown"
                  size="lg"
                  onClick={openCheckoutModal}
                  leftSection={<IconShoppingCart size={18} />}
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </Button>
              </Group>
            </Paper>
          </Stack>
        )}

        {/* Checkout Modal */}
        <Modal
          opened={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          title="Complete Your Order"
          size="md"
        >
          <LoadingOverlay visible={isSubmitting} />
          
          <Stack gap="md">
            <TextInput
              label="Customer Name"
              placeholder="Enter your name"
              required
              value={orderData.customer_name}
              onChange={(e) => setOrderData({
                ...orderData,
                customer_name: e.target.value
              })}
            />
            
            <TextInput
              label="Table Number (Optional)"
              placeholder="Enter table number for dine-in"
              value={orderData.table_number}
              onChange={(e) => setOrderData({
                ...orderData,
                table_number: e.target.value
              })}
            />
            
            <Select
              label="Order Type"
              placeholder="Select order type"
              required
              value={orderData.order_type}
              onChange={(value) => setOrderData({
                ...orderData,
                order_type: value as 'dine_in' | 'takeaway' | 'delivery'
              })}
              data={[
                { value: 'takeaway', label: 'Takeaway' },
                { value: 'dine_in', label: 'Dine In' },
                { value: 'delivery', label: 'Delivery' }
              ]}
            />
            
            <TextInput
              label="Phone (Optional)"
              placeholder="Enter your phone number"
              value={orderData.customer_phone}
              onChange={(e) => setOrderData({
                ...orderData,
                customer_phone: e.target.value
              })}
            />
            
            <TextInput
              label="Email (Optional)"
              placeholder="Enter your email"
              type="email"
              value={orderData.customer_email}
              onChange={(e) => setOrderData({
                ...orderData,
                customer_email: e.target.value
              })}
            />
            
            <Textarea
              label="Special Notes (Optional)"
              placeholder="Any special requests or notes..."
              value={orderData.notes}
              onChange={(e) => setOrderData({
                ...orderData,
                notes: e.target.value
              })}
              minRows={3}
            />

            <Divider />

            <Group justify="space-between">
              <Text size="lg" fw={500}>Total: ฿{total.toFixed(2)}</Text>
            </Group>

            {orderError && (
              <Alert color="red" title="Order Error">
                {orderError}
              </Alert>
            )}

            <Group justify="flex-end" gap="sm">
              <Button
                variant="outline"
                onClick={() => setShowCheckoutModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                color="brown"
                onClick={handleSubmitOrder}
                loading={isSubmitting}
                loadingText="Placing Order..."
              >
                Place Order
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </Layout>
  );
}