import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AuthModal } from './components/auth/AuthModal';

// Storefront Pages
import { HomePage } from './pages/storefront/HomePage';
import { ProductCatalog } from './pages/storefront/ProductCatalog';
import { ProductDetail } from './pages/storefront/ProductDetail';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { OrderSuccess } from './pages/storefront/OrderSuccess';
import { CustomerAccount } from './pages/storefront/CustomerAccount';
import { CustomerOrders } from './pages/storefront/CustomerOrders';
import { LoginPage } from './pages/storefront/LoginPage';
import { RegisterPage } from './pages/storefront/RegisterPage';
import { CmsPage } from './pages/storefront/CmsPage';
import { ContactPage } from './pages/storefront/ContactPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';

// Scroll to top or anchor target on route change
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="page-transition w-full min-h-screen flex flex-col justify-between">
            <Routes>
              {/* Storefront: Curated Home Experience */}
              <Route path="/" element={<HomePage />} />

            {/* Dedicated All Equipment Catalog */}
            <Route path="/products" element={<ProductCatalog />} />

            {/* Product Specifications & Order Placement */}
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />

            {/* Pilot Identity & Management */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<CustomerAccount />} />
            <Route path="/pilot" element={<CustomerAccount />} />
            <Route path="/orders" element={<CustomerOrders />} />

            {/* CMS Informational Pages */}
            <Route path="/about" element={<CmsPage slugOverride="about-us" />} />
            <Route path="/privacy-policy" element={<CmsPage slugOverride="privacy-policy" />} />
            <Route path="/terms-conditions" element={<CmsPage slugOverride="terms-conditions" />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Command Center */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
        </div>

        {/* Quick-Access Modal */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialMode={authMode}
          />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
