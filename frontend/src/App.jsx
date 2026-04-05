import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminGuard from "./admin/AdminGuard";
import AdminLayout from "./admin/AdminLayout";
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
      }
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
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}