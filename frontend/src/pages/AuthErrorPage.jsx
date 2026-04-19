import { Link } from "react-router-dom";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500">
          Sign-in failed
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#191c1d]">
          We couldn&apos;t complete your login.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#64748b]">
          Please try again, or return to the login page and choose another sign-in method.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-full bg-[#003d9b] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
