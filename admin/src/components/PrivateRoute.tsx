import { useAuth } from "../store/auth";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }: any) {
    const user = useAuth((s: any) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    return children;
}