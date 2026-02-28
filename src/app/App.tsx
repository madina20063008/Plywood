import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider } from '../lib/context';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { CartPage } from './pages/CartPage';
import { InventoryPage } from './pages/InventoryPage';
import { UsersPage } from './pages/UsersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SoldProductsPage } from './pages/SoldProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerLedgerPage } from './pages/CustomerLedgerPage';
import { ProductCreationPage } from './pages/ProductCreationPage';
import { ProductReceivingPage } from './pages/ProductReceivingPage';
import Services from './pages/Services';
import SupplierPage from './pages/SupplierPage';
import { ProductsPage } from './pages/ProductsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CartPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sold-products" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SoldProductsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <Layout>
                  <InventoryPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomersPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          {/* <Route 
            path="/customer-ledger" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomerLedgerPage />
                </Layout>
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/product-creation" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductCreationPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/supplier" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SupplierPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/product-receiving" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductReceivingPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Services />
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}
