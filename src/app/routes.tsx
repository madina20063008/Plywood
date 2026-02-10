import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';
import { InventoryPage } from './pages/InventoryPage';
import { UsersPage } from './pages/UsersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SoldProductsPage } from './pages/SoldProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerLedgerPage } from './pages/CustomerLedgerPage';
import { ProductCreationPage } from './pages/ProductCreationPage';
import { ProductReceivingPage } from './pages/ProductReceivingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/products" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <DashboardPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProductsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/cart',
    element: (
      <ProtectedRoute>
        <Layout>
          <CartPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/sold-products',
    element: (
      <ProtectedRoute>
        <Layout>
          <SoldProductsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory',
    element: (
      <ProtectedRoute>
        <Layout>
          <InventoryPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <Layout>
          <UsersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <Layout>
          <ReportsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/customers',
    element: (
      <ProtectedRoute>
        <Layout>
          <CustomersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer-ledger',
    element: (
      <ProtectedRoute>
        <Layout>
          <CustomerLedgerPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/product-creation',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProductCreationPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/product-receiving',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProductReceivingPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);
