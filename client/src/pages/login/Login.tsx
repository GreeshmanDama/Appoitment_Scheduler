import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { HeartPulse, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import api from "../../../utils/axios";
import { setUserData } from "../../redux/userSlice";
import type { AppDispatch } from "../../redux/store";

type UserRole = "patient" | "doctor" | "admin";

interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isVerified?: boolean;
  };
}

const dashboardRoutes: Record<UserRole, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { role: routeRole } = useParams<{ role: string }>();

  const expectedRole: UserRole | undefined =
    routeRole === "doctor" || routeRole === "admin"
      ? routeRole
      : undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = expectedRole
        ? `/auth/login/${expectedRole}`
        : "/auth/login";

      const response = await api.post<LoginResponse>(endpoint, {
        email: normalizedEmail,
        password,
      });

      const data = response.data;

      if (!data.success || !data.token || !data.user) {
        setError(data.message || "Unable to log in.");
        return;
      }

      if (expectedRole && data.user.role !== expectedRole) {
        setError("This account cannot access this login portal.");
        return;
      }

      // Persist the JWT for subsequent API requests and page reloads.
      localStorage.setItem("token", data?.token);

      // Restore the authenticated user in Redux.
      dispatch(
        setUserData({
          ...data.user,
          isVerified: data.user.isVerified ?? false,
        }),
      );

      // Navigate according to the authenticated user's role.
      navigate(dashboardRoutes[data.user.role], { replace: true });
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? (
              err as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      setError(message || "Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 text-gray-900">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white">
            <HeartPulse size={27} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">CarePoint</h1>
            <p className="text-sm text-gray-500">Your health, organized.</p>
          </div>
        </Link>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue to your CarePoint account.
            </p>

            {expectedRole && (
              <p className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                {expectedRole} portal
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-gray-950">
                <Mail size={18} className="shrink-0 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-gray-950">
                <Lock size={18} className="shrink-0 text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-transparent py-3 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-gray-400 transition hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {!expectedRole && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-gray-950 hover:underline"
              >
                Create account
              </Link>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Secure access to your healthcare account.
        </p>
      </div>
    </div>
  );
};

export default Login;