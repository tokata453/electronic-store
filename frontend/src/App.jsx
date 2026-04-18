import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminGuard from "./admin/AdminGuard";
import AdminLayout from "./admin/AdminLayout";
import DashboardPage from './admin/DashboardPage';
import OrdersPage from './admin/OrdersPage';
import UsersPage from './admin/UsersPage';
import ReportsPage from './admin/ReportsPage';
import Home from './pages/Home';
import LoginForm from './components/login-form';
import Register from './components/Register';
import ProductsPage from "./admin/products/ProductsPage";
import ProductFormPage from "./admin/products/ProductFormPage";
import SettingsPage from "./admin/products/SettingsPage";
import SearchResults from './pages/SearchResults';
import CategoryPage from './pages/CategoryPage';
import { ThemeProvider } from './admin/products/ThemeContext.jsx';
import CategoriesPage from "./admin/products/CategoriesPage";
import CategoryFormPage from "./admin/products/CategoryFormPage";
import ProductPage from './pages/ProductPage';
import TrendingPage from './pages/TrendingPage';
import OnSalePage from './pages/OnSalePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import { Toaster } from 'react-hot-toast';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import HomeCategoriesPage from './pages/HomeCategoriesPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <LoginForm />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "products",
        element: <SearchResults />,
      },
      {
        path: "category/:id",
        element: <CategoryPage />,
      },
      {
        path: "product/:id",
        element: <ProductPage />
      },
      {
        path: "/trending",
        element: <TrendingPage />
      },
      {
        path: "/sale",
        element: <OnSalePage />
      },
      {
        path: "/cart",
        element: <CartPage />
      },
      {
        path: "/checkout",
        element: <CheckoutPage />
      },
      {
        path: "/account",
        element: <AccountPage />
      },
      {
        path: "/help",
        element: <HelpCenterPage />
      },
      {
        path: "/contact",
        element: <ContactPage />
      },
      {
        path: "/categories",
        element: <HomeCategoriesPage />
      },
    ],
  },

  // ADMIN ROUTES — protected by AdminGuard
  {
    path: "/admin",
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'orders',
            element: <OrdersPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: "products",
            element: <ProductsPage />,
          },
          {
            path: "products/new",
            element: <ProductFormPage />
          },
          {
            path: "products/:id",
            element: <ProductFormPage />
          },
          {
            path: "settings",
            element: <SettingsPage />
          },
          {
            path: "categories",
            element: <CategoriesPage />
          },
          {
            path: "categories/new",
            element: <CategoryFormPage />
          },
          {
            path: "categories/:id",
            element: <CategoryFormPage />
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 3000,
          style: {
            background: '#191c1d',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '10px'
          }
        }} 
      />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}