import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import WithAuthLayout from '@layouts/WithAuthLayout';
import WithoutAuthLayout from '@layouts/WithoutAuthLayout';
import RegisterPage from '@features/auth/pages/RegisterPage/RegisterPage';
import { Toaster } from 'react-hot-toast';
// Import catalog components directly (can also be lazy if preferred)
import CategoryList from '@features/category/components/pages/CategoryList';
import SubCategoryList from '@features/category/components/subcategories/SubCategoryList';
import ProductList from '@features/products/pages/ProductList';

// Lazy load all other pages
const DashboardPage = lazy(() => import('@features/dashboard/pages/dashboard'));
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage/LoginPage'));
const ForgotPasswordPage = lazy(
  () => import('@features/auth/pages/ForgotPasswordPage/ForgotPasswordPage'),
);
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));
const PrivacyPolicy = lazy(() => import('@features/privacy_policy/pages/privacy_policy'));
const ReturnsRefunds = lazy(() => import('@features/returns_refunds/pages/returns_refunds'));
const TermsConditions = lazy(() => import('@features/terms_conditions/pages/terms_conditions'));
const NotificationManagement = lazy(() => import('@features/notifications/pages/NotificationManagement'));
const StoreType = lazy(() => import('@features/store_type/pages/Store_type'));
const Store = lazy(() => import('@features/store/pages/store'));
const Delevery = lazy(() => import('@features/delivery/pages/delevery'));
const DeleverySetup = lazy(() => import('@features/delevery_setup/pages/delevery_setup'));
const Discount = lazy(() => import('@features/discount/pages/discounts'));
const Settings = lazy(() => import('@features/settings/pages/settings'));
const Users = lazy(() => import('@features/users/pages/users'));
// const Logs = lazy(() => import("@features/logs/pages/Logs")); // Blocked by .gitignore

// Delivery & Payouts (Part 3)
const DeliveryDashboard = lazy(() => import('@features/delivery/pages/DeliveryDashboard'));
const DeliveryPersonList = lazy(() => import('@features/delivery/pages/DeliveryPersonList'));
const DeliveryPersonDetail = lazy(() => import('@features/delivery/pages/DeliveryPersonDetail'));
const DocumentReview = lazy(() => import('@features/delivery/pages/DocumentReview'));
const FareSettings = lazy(() => import('@features/delivery/pages/FareSettings'));
const PayoutList = lazy(() => import('@features/payouts/pages/PayoutList'));
const IncomeManagement = lazy(() => import('@features/admin/pages/IncomeManagement'));

// Marketing
const BannersPage = lazy(() => import('@features/banners/pages/BannersPage'));
const CouponsPage = lazy(() => import('@features/marketing/pages/Coupons'));

// Logs
const UserLogsPage = lazy(() => import('@features/activity_logs/pages/UserLogs'));

// Orders
const AdminOrderDashboard = lazy(() => import('@features/orders/pages/AdminOrderDashboard'));
const OrderDetail = lazy(() => import('@features/orders/pages/OrderDetail'));
const MyOrders = lazy(() => import('@features/orders/pages/MyOrders'));
const CustomerOrderTracking = lazy(() => import('@features/orders/pages/CustomerOrderTracking'));


const Loader: React.FC = () => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    Loading...
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<WithoutAuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<WithAuthLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/returns&refunds" element={<ReturnsRefunds />} />
              <Route path="/terms&conditions" element={<TermsConditions />} />
              <Route path="/notifications" element={<NotificationManagement />} />
              <Route path="/store-type" element={<StoreType />} />
              <Route path="/store" element={<Store />} />

              <Route path="/categories" element={<CategoryList />} />
              <Route path="/subcategories" element={<SubCategoryList />} />
              <Route path="/subcategories/:categoryId" element={<SubCategoryList />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<Users />} />
              {/* <Route path="/logs" element={<Logs />} /> */}

              {/* Delivery & Payouts */}
              <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
              <Route path="/delivery/personnel" element={<DeliveryPersonList />} />
              <Route path="/admin/delivery/persons/:id" element={<DeliveryPersonDetail />} />
              <Route path="/delivery/documents" element={<DocumentReview />} />
              <Route path="/delivery/fare-settings" element={<FareSettings />} />
              <Route path="/admin/payouts" element={<PayoutList />} />
              <Route path="/admin/income" element={<IncomeManagement />} />

              {/* Orders */}
              <Route path="/admin/orders" element={<AdminOrderDashboard />} />
              <Route path="/admin/orders/:orderId" element={<OrderDetail />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/orders/:orderId/tracking" element={<CustomerOrderTracking />} />

              {/* Marketing */}
              <Route path="/marketing/banners" element={<BannersPage />} />
              <Route path="/marketing/coupons" element={<CouponsPage />} />

              {/* Logs */}
              <Route path="/logs/user-logs" element={<UserLogsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRouter;
