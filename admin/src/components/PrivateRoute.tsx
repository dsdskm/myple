// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function PrivateRoute() {
    const { user, initialized } = useAuth();

    // 초기화 전에는 상위(AuthProvider)에서 로딩을 보여주고 있을 것이므로 null
    if (!initialized) return null;

    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />; // ← children 대신 Outlet 반환
}