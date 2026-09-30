import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { BookmarkProvider } from './context/BookmarkContext.jsx';

import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import Breadcrumb from './components/common/Breadcrumb.jsx';
import RequireAuth from './components/common/RequireAuth.jsx';
import CartDrawer from './components/interactive/CartDrawer.jsx';
import ChatbotWidget from './components/interactive/ChatbotWidget.jsx';
import MobileBottomNav from './components/common/MobileBottomNav.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import RequireAdmin from './components/common/RequireAdmin.jsx';
import Home from './pages/Home.jsx';

// Lazy loading secondary page views for code splitting
const CategoryHub = lazy(() => import('./pages/CategoryHub.jsx'));
const ContentDetail = lazy(() => import('./pages/ContentDetail.jsx'));
const TrailersHub = lazy(() => import('./pages/TrailersHub.jsx'));
const Merchandise = lazy(() => import('./pages/Merchandise.jsx'));
const Bookmarks = lazy(() => import('./pages/Bookmarks.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const OrdersHistory = lazy(() => import('./pages/OrdersHistory.jsx'));
const SearchResults = lazy(() => import('./pages/SearchResults.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));

function RouteLoadingFallback() {
  return (
    <div
      className="d-flex align-items-center justify-content-center w-100"
      style={{ minHeight: '60vh' }}
    >
      <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            />
          </Routes>
        </Suspense>
      </>
    );
  }

  return (
    <div className="app-layout">
      {/* Scroll restoration on route changes */}
      <ScrollToTop />

      {/* Header Navigation */}
      <Navbar />

      {/* Main Application Container */}
      <main className="main-content">
        <Breadcrumb />

        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<CategoryHub />} />
            <Route path="/category/:categoryId/article/:contentId" element={<ContentDetail />} />
            <Route path="/trailers" element={<TrailersHub />} />
            <Route path="/merchandise" element={<Merchandise />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/my-account" element={<Profile />} />
            <Route path="/orders" element={<OrdersHistory />} />
            <Route path="/order-history" element={<OrdersHistory />} />
            <Route path="/history" element={<OrdersHistory />} />
            <Route path="/transactions" element={<OrdersHistory />} />
            <Route path="/profile/orders" element={<OrdersHistory />} />
            <Route path="/checkout/success" element={<Checkout />} />
            <Route path="/order-success" element={<Checkout />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Persistent Global Interactive Overlays */}
      <CartDrawer />
      <ChatbotWidget />
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <BookmarkProvider>
                <AppContent />
              </BookmarkProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </HashRouter>
  );
}
