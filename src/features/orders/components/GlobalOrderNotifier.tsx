import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { useGetAdminOrdersQuery } from '../api/orderApi';
import { toast } from '@components/toast/ToastContainer';
import { useAppSelector } from '@app/hooks';
import { firebaseDb } from '../../../lib/firebase';

const ADMIN_ORDER_ROLES = new Set(['ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

// Backend writes to "admin/events/{pushId}" — each child has { type, data, timestamp }
const DASHBOARD_EVENTS_PATH = 'admin/events';

interface DashboardEventData {
  orderNumber?: string;
  orderId?: number;
  storeId?: number;
  storeName?: string;
  subOrderId?: number;
  message?: string;
}

interface DashboardEvent {
  type: 'NEW_ORDER' | 'STORE_ACCEPTED' | 'STORE_REJECTED' | 'ORDER_UPDATE' | string;
  /** String from Java LocalDateTime, e.g. "2025-04-19T10:30:00" */
  timestamp?: string;
  /** Either a plain orderNumber string OR an object with detailed fields */
  data?: string | DashboardEventData;
}

const GlobalOrderNotifier: React.FC = () => {
  const navigate = useNavigate();
  const userRole = useAppSelector((state) => state.auth.user?.role ?? '');
  const shouldListenForOrders = ADMIN_ORDER_ROLES.has(userRole);
  const knownOrderIdsRef = useRef<Set<number>>(new Set());
  const hasInitializedRef = useRef(false);

  const { data: orders } = useGetAdminOrdersQuery(undefined, {
    skip: !shouldListenForOrders,
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const ordersList = useMemo(() => {
    const raw: any = orders;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.orders)) return raw.orders;
    return [];
  }, [orders]);

  // Poll-based new order detection (unchanged)
  useEffect(() => {
    if (!shouldListenForOrders) {
      knownOrderIdsRef.current = new Set();
      hasInitializedRef.current = false;
      return;
    }

    if (typeof orders === 'undefined') {
      return;
    }

    const currentIds = new Set<number>(ordersList.map((order: any) => Number(order.id)));

    if (!hasInitializedRef.current) {
      knownOrderIdsRef.current = currentIds;
      hasInitializedRef.current = true;
      return;
    }

    const newOrders = ordersList
      .filter((order: any) => !knownOrderIdsRef.current.has(Number(order.id)))
      .sort((a: any, b: any) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

    if (newOrders.length > 0) {
      const latestOrder = newOrders[0];
      const message =
        newOrders.length === 1
          ? `New order received: ${latestOrder.orderNumber}`
          : `${newOrders.length} new orders received`;

      toast.custom({
        type: 'success',
        message,
        duration: 7000,
        action: {
          label: 'Open order',
          onClick: () => navigate(`/admin/orders/${latestOrder.id}`),
        },
      });
    }

    knownOrderIdsRef.current = currentIds;
  }, [navigate, orders, ordersList, shouldListenForOrders]);

  // Firebase RTDB listener for store response events
  useEffect(() => {
    if (!shouldListenForOrders || !firebaseDb) return;

    // Record mount time so stale events already in RTDB are ignored
    const mountedAt = new Date().toISOString();

    const eventsRef = ref(firebaseDb, DASHBOARD_EVENTS_PATH);

    const handleEvent = (snapshot: any) => {
      if (!snapshot.exists()) return;

      const raw = snapshot.val() as Record<string, DashboardEvent>;

      Object.values(raw).forEach((event) => {
        // event.timestamp is a Java LocalDateTime string — skip events older than mount
        if (event.timestamp && event.timestamp <= mountedAt) return;

        // data can be a plain orderNumber string or an object
        const d: DashboardEventData =
          typeof event.data === 'string' ? { orderNumber: event.data } : (event.data ?? {});

        const orderNumber = d.orderNumber ?? '';
        const storeName = d.storeName;
        const orderId = d.orderId;

        switch (event.type) {
          case 'STORE_ACCEPTED': {
            toast.custom({
              type: 'success',
              message: `Store accepted order ${orderNumber}${storeName ? ` (${storeName})` : ''}`,
              duration: 8000,
              action: orderId
                ? { label: 'View order', onClick: () => navigate(`/admin/orders/${orderId}`) }
                : undefined,
            });
            break;
          }
          case 'STORE_REJECTED': {
            toast.custom({
              type: 'error',
              message: `Store REJECTED order ${orderNumber}${storeName ? ` (${storeName})` : ''}. Please review.`,
              duration: 10000,
              action: orderId
                ? { label: 'View order', onClick: () => navigate(`/admin/orders/${orderId}`) }
                : undefined,
            });
            break;
          }
          case 'ORDER_UPDATE': {
            toast.custom({
              type: 'warning',
              message: d.message ?? `Order ${orderNumber} updated`,
              duration: 8000,
              action: orderId
                ? { label: 'View order', onClick: () => navigate(`/admin/orders/${orderId}`) }
                : undefined,
            });
            break;
          }
          default:
            break;
        }
      });
    };

    onValue(eventsRef, handleEvent);

    return () => {
      off(eventsRef, 'value', handleEvent);
    };
  }, [navigate, shouldListenForOrders]);

  return null;
};

export default GlobalOrderNotifier;
