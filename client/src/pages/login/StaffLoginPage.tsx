import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Activity,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import api from "../../../utils/axios";
import { setUserData } from "../../redux/userSlice";

type StaffRole = "doctor" | "admin";

interface StaffLoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "patient" | "doctor" | "admin";
    isVerified?: boolean;
  };
}

interface StaffLoginPageProps {
  role: StaffRole;
}

export default function StaffLoginPage({ role }: StaffLoginPageProps) {
  const isDoctor = role === "doctor";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      console.log(role, normalizedEmail)

      const { data } = await api.post<StaffLoginResponse>(
        `/auth/login/${role}`,
        {
          email: normalizedEmail,
          password,
        },
      );

      if (!data.success || !data.token || !data.user) {
        setError(data.message || "Unable to sign in.");
        return;
      }

      if (data.user.role !== role) {
        setError(
          isDoctor
            ? "This account cannot access the doctor portal."
            : "This account cannot access the administrator portal.",
        );
        return;
      }

      localStorage.setItem("token", data.token);

      dispatch(
        setUserData({
          ...data.user,
          isVerified: data.user.isVerified ?? false,
        }),
      );

      navigate(role === "doctor" ? "/doctor/dashboard" : "/admin/dashboard", {
        replace: true,
      });
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "response" in err
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -left-28 -top-28 h-80 w-80 rounded-full ${
            isDoctor ? "bg-teal-100/70" : "bg-slate-200/70"
          } blur-3xl`}
        />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-100/50 blur-3xl" />
      </div>

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 md:grid-cols-2">
        {/* Branding panel */}
        <aside
          className={`relative hidden flex-col justify-between overflow-hidden p-10 text-white md:flex ${
            isDoctor ? "bg-teal-800" : "bg-slate-900"
          }`}
        >
          <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-4 h-40 w-40 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/5" />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <Activity size={23} />
              </span>
              <span>
                <span className="block text-lg font-bold tracking-tight">
                  HealthCare+
                </span>
                <span className="block text-xs text-white/60">
                  Hospital Management
                </span>
              </span>
            </Link>
          </div>

          <div className="relative py-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              {isDoctor ? (
                <Stethoscope size={32} strokeWidth={1.6} />
              ) : (
                <ShieldCheck size={32} strokeWidth={1.6} />
              )}
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              {isDoctor
                ? "Medical professional portal"
                : "Administration portal"}
            </p>

            <h1 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
              {isDoctor
                ? "Your practice. Your patients. One workspace."
                : "Manage your clinic with confidence."}
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
              {isDoctor
                ? "Access your appointments, manage your schedule, and stay connected with your patients."
                : "Manage doctors, oversee clinic operations, and keep your appointment system organized."}
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Secure access for authorized{" "}
            {isDoctor ? "doctors" : "administrators"}
          </div>
        </aside>

        {/* Login form */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-9 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to homepage
            </Link>

            <div className="mb-8">
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isDoctor
                    ? "bg-teal-50 text-teal-700"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {isDoctor ? (
                  <Stethoscope size={24} />
                ) : (
                  <ShieldCheck size={24} />
                )}
              </div>

              <p
                className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  isDoctor ? "text-teal-700" : "text-slate-500"
                }`}
              >
                {isDoctor ? "Doctor portal" : "Admin portal"}
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in with your authorized{" "}
                {isDoctor ? "doctor" : "administrator"} account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor={`${role}-email`}
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id={`${role}-email`}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={
                      isDoctor ? "doctor@clinic.com" : "admin@clinic.com"
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${role}-password`}
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id={`${role}-password`}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDoctor
                    ? "bg-teal-700 shadow-teal-700/15 hover:bg-teal-800 focus:ring-teal-700/20"
                    : "bg-slate-900 shadow-slate-900/15 hover:bg-slate-800 focus:ring-slate-900/20"
                }`}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to {isDoctor ? "doctor" : "admin"} portal
                    <ArrowLeft className="rotate-180" size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 border-t border-slate-100" />

            <p className="text-center text-xs leading-5 text-slate-500">
              Authorized personnel only. If you need account access, contact
              your hospital administrator.
            </p>

            <p className="mt-5 text-center text-sm text-slate-500">
              Looking for patient access?{" "}
              <Link
                to="/login"
                className="font-semibold text-teal-700 transition hover:text-teal-900"
              >
                Patient login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
