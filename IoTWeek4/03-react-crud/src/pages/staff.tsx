import React, { useState } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Select,
  Paper,
  Divider,
  Image,
  Modal,
  Alert,
  ActionIcon,
  Tabs,
  NumberFormatter,
  Loader,
  Center,
  ScrollArea,
} from '@mantine/core';
import { 
  IconClock, 
  IconChefHat, 
  IconCheck, 
  IconX, 
  IconEye,
  IconRefresh,
  IconTrendingUp,
  IconUsers,
  IconShoppingCart,
  IconCurrencyBaht
} from '@tabler/icons-react';
import useSWR, { mutate } from 'swr';

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  menu_item: {
    id: number;
    name: string;
    name_th?: string;
    image_url?: string;
    category: {
      name: string;
      name_th?: string;
    };
  };
}

interface Order {
  id: number;
  customer_name?: string;
  customer_phone?: string;
  table_number?: string;
  total_amount: number;
  status: string;
  order_type: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

interface DashboardStats {
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  today_revenue: number;
  today_orders: number;
}

const statusColors = {
  pending: 'orange',
  confirmed: 'blue',
  preparing: 'yellow',
  ready: 'green',
  completed: 'gray',
  cancelled: 'red'
} as const;

const statusIcons = {
  pending: IconClock,
  confirmed: IconCheck,
  preparing: IconChefHat,
  ready: IconCheck,
  completed: IconCheck,
  cancelled: IconX
} as const;

export default function StaffPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch dashboard stats
  const { data: stats, error: statsError } = useSWR<DashboardStats>(
    'http://localhost:3000/api/v1/orders/stats/dashboard'
  );

  // Fetch orders based on selected status
  const ordersUrl = selectedStatus === 'all' 
    ? 'http://localhost:3000/api/v1/orders' 
    : `http://localhost:3000/api/v1/orders/status/${selectedStatus}`;
  const { data: orders, error: ordersError, isLoading } = useSWR<Order[]>(ordersUrl);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_SECRET}`
        },
        body: JSON.stringify({
          status: newStatus,
          changed_by: 'Staff',
          notes: `Status changed to ${newStatus}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Refresh data
      mutate(ordersUrl);
      mutate('http://localhost:3000/api/v1/orders/stats/dashboard');
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const refreshData = () => {
    mutate(ordersUrl);
    mutate('http://localhost:3000/api/v1/orders/stats/dashboard');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed'
    } as const;
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const StatsCards = () => (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6, lg: 2.4 }}>
        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Pending Orders
              </Text>
              <Text fw={700} size="xl">
                {stats?.pending_orders || 0}
              </Text>
            </div>
            <IconClock size={24} color="orange" />
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, lg: 2.4 }}>
        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Preparing
              </Text>
              <Text fw={700} size="xl">
                {stats?.preparing_orders || 0}
              </Text>
            </div>
            <IconChefHat size={24} color="yellow" />
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, lg: 2.4 }}>
        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Ready
              </Text>
              <Text fw={700} size="xl">
                {stats?.ready_orders || 0}
              </Text>
            </div>
            <IconCheck size={24} color="green" />
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, lg: 2.4 }}>
        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Today Orders
              </Text>
              <Text fw={700} size="xl">
                {stats?.today_orders || 0}
              </Text>
            </div>
            <IconShoppingCart size={24} color="blue" />
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, lg: 2.4 }}>
        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Today Revenue
              </Text>
              <Text fw={700} size="xl">
                <NumberFormatter 
                  value={stats?.today_revenue || 0} 
                  prefix="฿" 
                  thousandSeparator
                />
              </Text>
            </div>
            <IconCurrencyBaht size={24} color="green" />
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );

  const OrderCard = ({ order }: { order: Order }) => {
    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || IconClock;
    const nextStatus = getNextStatus(order.status);

    return (
      <Card withBorder shadow="sm" mb="md">
        <Group justify="space-between" mb="sm">
          <Group>
            <Badge 
              color={statusColors[order.status as keyof typeof statusColors]} 
              variant="filled"
              leftSection={<StatusIcon size={14} />}
            >
              {order.status.toUpperCase()}
            </Badge>
            <Text fw={500}>Order #{order.id}</Text>
            <Text size="sm" c="dimmed">
              {formatTime(order.created_at)}
            </Text>
          </Group>
          
          <Group>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => setSelectedOrder(order)}
            >
              <IconEye size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Stack gap="xs" mb="md">
          <Group justify="space-between">
            <Text size="sm">
              <strong>Customer:</strong> {order.customer_name || 'Guest'}
            </Text>
            <Text size="sm">
              <strong>Type:</strong> {order.order_type.replace('_', ' ')}
            </Text>
          </Group>
          
          {order.table_number && (
            <Text size="sm">
              <strong>Table:</strong> {order.table_number}
            </Text>
          )}
          
          <Text size="sm">
            <strong>Items:</strong> {order.items?.length || 0} items
          </Text>
          
          <Text size="sm" fw={700} c="green">
            Total: <NumberFormatter value={order.total_amount} prefix="฿" thousandSeparator />
          </Text>
        </Stack>

        <Group justify="space-between">
          <Group gap="xs">
            {nextStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
              <Button
                size="xs"
                loading={isUpdating === order.id}
                onClick={() => updateOrderStatus(order.id, nextStatus)}
                color={statusColors[nextStatus as keyof typeof statusColors]}
              >
                Mark as {nextStatus}
              </Button>
            )}
            
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <Button
                size="xs"
                variant="light"
                color="red"
                loading={isUpdating === order.id}
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
              >
                Cancel
              </Button>
            )}
          </Group>
        </Group>
      </Card>
    );
  };

  const OrderDetailsModal = () => (
    <Modal
      opened={!!selectedOrder}
      onClose={() => setSelectedOrder(null)}
      title={`Order #${selectedOrder?.id} Details`}
      size="lg"
    >
      {selectedOrder && (
        <Stack>
          <Group justify="space-between">
            <Badge 
              size="lg"
              color={statusColors[selectedOrder.status as keyof typeof statusColors]}
              variant="filled"
            >
              {selectedOrder.status.toUpperCase()}
            </Badge>
            <Text c="dimmed">
              {formatDate(selectedOrder.created_at)} at {formatTime(selectedOrder.created_at)}
            </Text>
          </Group>

          <Paper p="md" withBorder>
            <Text fw={500} mb="sm">Customer Information</Text>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Name:</Text>
                <Text size="sm">{selectedOrder.customer_name || 'Guest'}</Text>
              </Group>
              {selectedOrder.customer_phone && (
                <Group justify="space-between">
                  <Text size="sm">Phone:</Text>
                  <Text size="sm">{selectedOrder.customer_phone}</Text>
                </Group>
              )}
              <Group justify="space-between">
                <Text size="sm">Order Type:</Text>
                <Text size="sm">{selectedOrder.order_type.replace('_', ' ')}</Text>
              </Group>
              {selectedOrder.table_number && (
                <Group justify="space-between">
                  <Text size="sm">Table:</Text>
                  <Text size="sm">{selectedOrder.table_number}</Text>
                </Group>
              )}
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Text fw={500} mb="sm">Order Items</Text>
            <ScrollArea.Autosize maxHeight={300}>
              <Stack gap="sm">
                {selectedOrder.items?.map((item) => (
                  <Group key={item.id} align="flex-start" wrap="nowrap">
                    <Image
                      src={item.menu_item.image_url || 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=100&h=100&fit=crop'}
                      alt={item.menu_item.name}
                      width={60}
                      height={60}
                      radius="md"
                    />
                    <div style={{ flex: 1 }}>
                      <Text fw={500}>{item.menu_item.name}</Text>
                      {item.menu_item.name_th && (
                        <Text size="sm" c="dimmed">{item.menu_item.name_th}</Text>
                      )}
                      <Text size="sm" c="dimmed">
                        Category: {item.menu_item.category.name}
                      </Text>
                      {item.special_instructions && (
                        <Text size="sm" c="orange" fs="italic">
                          Note: {item.special_instructions}
                        </Text>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text size="sm">Qty: {item.quantity}</Text>
                      <Text size="sm">
                        <NumberFormatter value={item.unit_price} prefix="฿" /> each
                      </Text>
                      <Text fw={500}>
                        <NumberFormatter value={item.total_price} prefix="฿" thousandSeparator />
                      </Text>
                    </div>
                  </Group>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </Paper>

          {selectedOrder.notes && (
            <Paper p="md" withBorder>
              <Text fw={500} mb="sm">Special Notes</Text>
              <Text size="sm">{selectedOrder.notes}</Text>
            </Paper>
          )}

          <Group justify="space-between" pt="md">
            <Text size="lg" fw={700}>
              Total: <NumberFormatter value={selectedOrder.total_amount} prefix="฿" thousandSeparator />
            </Text>
          </Group>
        </Stack>
      )}
    </Modal>
  );

  if (statsError || ordersError) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error Loading Data">
          Failed to load staff dashboard. Please check your API connection and try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Staff Dashboard</Title>
        <Button leftSection={<IconRefresh size={16} />} onClick={refreshData}>
          Refresh
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'dashboard')}>
        <Tabs.List>
          <Tabs.Tab value="dashboard" leftSection={<IconTrendingUp size={16} />}>
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab value="orders" leftSection={<IconShoppingCart size={16} />}>
            Orders
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md">
          <StatsCards />
        </Tabs.Panel>

        <Tabs.Panel value="orders" pt="md">
          <Group justify="space-between" mb="md">
            <Select
              placeholder="Filter by status"
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value || 'all')}
              data={[
                { value: 'all', label: 'All Orders' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'preparing', label: 'Preparing' },
                { value: 'ready', label: 'Ready' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              w={200}
            />
          </Group>

          {isLoading ? (
            <Center h={300}>
              <Loader size="lg" />
            </Center>
          ) : (
            <Grid>
              {orders?.map((order) => (
                <Grid.Col key={order.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <OrderCard order={order} />
                </Grid.Col>
              ))}
            </Grid>
          )}

          {orders?.length === 0 && !isLoading && (
            <Center h={300}>
              <Stack align="center">
                <IconShoppingCart size={64} color="gray" />
                <Text size="xl" c="dimmed">No orders found</Text>
                <Text c="dimmed">
                  {selectedStatus === 'all' 
                    ? 'No orders have been placed yet.' 
                    : `No ${selectedStatus} orders found.`
                  }
                </Text>
              </Stack>
            </Center>
          )}
        </Tabs.Panel>
      </Tabs>

      <OrderDetailsModal />
    </Container>
  );
}