import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "@/styles/global";
import { theme } from "@/styles/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import Login from "@/pages/LoginPage";
import Dashboard from "@/pages/DashboardPage";
import PrivateRoute from "@/components/PrivateRoute";
import AdminLayout from "@/layouts/AdminLayout";
import AuthProvider from "@/components/AuthProvider";

import { PATH } from "@/constants/routes";

import "antd/dist/reset.css";
import UsersPage from "./pages/UsersPage";
import BillingPage from "./pages/BillingPage";
import NoticePage from "./pages/NoticePage";
import FeedbackPage from "./pages/FeedbackPage";
import TermsPage from "./pages/TermsPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: PATH.LOGIN, element: <Login /> },

  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: PATH.ROOT, element: <Dashboard /> },
          { path: PATH.USERS, element: <UsersPage /> },
          { path: PATH.BILLING, element: <BillingPage /> },
          { path: PATH.NOTICE, element: <NoticePage /> },
          { path: PATH.FEEDBACK, element: <FeedbackPage /> },
          { path: PATH.TERMS, element: <TermsPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);