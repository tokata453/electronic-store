import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/authentication";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const token = searchParams.get("token");

      if (!token) {
        navigate("/login?error=missing_token", { replace: true });
        return;
      }

      localStorage.setItem("token", token);

      try {
        const result = await authService.getCurrentUser();
        const user = result?.data?.user ?? result?.user ?? null;

        if (user?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }

        navigate("/", { replace: true });
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login?error=oauth_failed", { replace: true });
      }
    }

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#003d9b] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-[#64748b]">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
