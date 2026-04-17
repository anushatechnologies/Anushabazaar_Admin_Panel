import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAdminOrdersQuery } from '../api/orderApi';
import { toast } from '@components/toast/ToastContainer';
import { useAppSelector } from '@app/hooks';

const ADMIN_ORDER_ROLES = new Set(['ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

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

  return null;
};

export default GlobalOrderNotifier;
