import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../services/authentication";

/**
 * Route guard for admin pages.
 * Validates the token by calling /api/auth/me and checks for admin role.
 * Redirects to /login if:
 *   - No token exists
 *   - Token is invalid/expired
 *   - User is not an admin
 */
export default function AdminGuard() {
  const [status, setStatus] = useState("loading"); // "loading" | "authorized" | "unauthorized"

  useEffect(() => {
    async function verify() {
      const token = localStorage.getItem("token");

      // No token → immediately unauthorized
      if (!token) {
        setStatus("unauthorized");
        return;
      }

      try {
        const result = await authService.getCurrentUser();
        const user = result?.data?.user ?? result?.user ?? result?.data;

        if (user && user.role === "admin") {
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
        }
      } catch {
        // Token invalid/expired — clear stale data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("unauthorized");
      }
    }

    verify();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
          <span className="text-sm text-slate-400">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
