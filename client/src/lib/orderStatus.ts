export const ORDER_STATUS_STEPS = [
  'ORDER_PLACED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'ARRIVED_NEAR_AREA',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
] as const;

export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  ORDER_PLACED: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['ARRIVED_NEAR_AREA', 'OUT_FOR_DELIVERY', 'DELIVERY_FAILED'],
  ARRIVED_NEAR_AREA: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED'],
  DELIVERED: ['RETURN_REQUESTED'],
  DELIVERY_FAILED: ['SHIPPED', 'CANCELLED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: [],
  CANCELLED: [],
};

export type OrderCategory =
  | 'ALL'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export const ORDER_CATEGORIES: { key: OrderCategory; label: string; statuses: string[] }[] = [
  { key: 'ALL', label: 'All Orders', statuses: [] },
  { key: 'PENDING', label: 'Pending', statuses: ['ORDER_PLACED'] },
  { key: 'CONFIRMED', label: 'Confirmed', statuses: ['CONFIRMED'] },
  { key: 'PROCESSING', label: 'Processing', statuses: ['PROCESSING'] },
  { key: 'SHIPPED', label: 'Shipped', statuses: ['SHIPPED', 'ARRIVED_NEAR_AREA', 'OUT_FOR_DELIVERY'] },
  { key: 'DELIVERED', label: 'Delivered', statuses: ['DELIVERED'] },
  { key: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED', 'DELIVERY_FAILED', 'RETURN_REQUESTED', 'RETURNED'] },
];

export const formatOrderStatus = (status: string): string =>
  status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const getOrderStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'ORDER_PLACED':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    case 'CONFIRMED':
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20';
    case 'PROCESSING':
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
    case 'SHIPPED':
    case 'ARRIVED_NEAR_AREA':
    case 'OUT_FOR_DELIVERY':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'DELIVERED':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    case 'CANCELLED':
    case 'DELIVERY_FAILED':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'RETURN_REQUESTED':
    case 'RETURNED':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};
