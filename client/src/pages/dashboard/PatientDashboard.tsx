
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Clock3,
  HeartPulse,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import type { RootState, AppDispatch } from "../../redux/store";
import { clearUser } from "../../redux/userSlice";
import api from "../../../utils/axios";

const PatientDashboard = () => {
  const { userData } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    // Invalidate the JWT on the backend
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Backend logout failed:", error);
  } finally {
    // Always clear the local session
    localStorage.removeItem("token");
    dispatch(clearUser());
    navigate("/login", { replace: true });
  }
};

  const firstName = userData?.name?.trim().split(/\s+/)[0] || "Patient";

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/patient/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white">
              <HeartPulse size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CarePoint</h1>
              <p className="text-xs text-gray-500">Patient portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {userData?.name || "Patient"}
              </p>
              <p className="text-xs capitalize text-gray-500">
                {userData?.role || "patient"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
              <UserRound size={20} />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium transition hover:bg-gray-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto px-5 py-8 sm:px-8 sm:py-10">
        {/* Welcome section */}
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
              <Activity size={14} />
              YOUR HEALTH, YOUR PRIORITY
            </div>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Manage your healthcare journey, explore doctors, and keep
              track of your appointments from one place.
            </p>
          </div>

          <Link
            to="/doctors"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Find a doctor
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* Summary cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <CalendarDays size={21} />
              </div>
              <span className="text-xs font-medium text-gray-400">
                APPOINTMENTS
              </span>
            </div>
            <p className="mt-5 text-lg font-semibold">My appointments</p>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your visits.
            </p>
            <Link
              to="/appointments"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            >
              View appointments <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Stethoscope size={21} />
              </div>
              <span className="text-xs font-medium text-gray-400">
                CARE TEAM
              </span>
            </div>
            <p className="mt-5 text-lg font-semibold">Find a doctor</p>
            <p className="mt-1 text-sm text-gray-500">
              Explore doctors by specialization.
            </p>
            <Link
              to="/doctors"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            >
              Explore doctors <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <ShieldCheck size={21} />
              </div>
              <span className="text-xs font-medium text-gray-400">
                ACCOUNT
              </span>
            </div>
            <p className="mt-5 text-lg font-semibold">My profile</p>
            <p className="mt-1 text-sm text-gray-500">
              Review your account information.
            </p>
            <a
              href="#profile"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            >
              View profile <ArrowRight size={15} />
            </a>
          </div>
        </section>

        {/* Account details and next steps */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div
            id="profile"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <UserRound size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Personal information</h3>
                <p className="text-sm text-gray-500">
                  Your registered account details
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500">Full name</span>
                <span className="text-sm font-medium">
                  {userData?.name || "Not available"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500">Email address</span>
                <span className="break-all text-sm font-medium">
                  {userData?.email || "Not available"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500">Account role</span>
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize">
                  {userData?.role || "patient"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500">
                  Verification status
                </span>
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                  {userData?.isVerified ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-950 p-6 text-white sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <HeartPulse size={24} />
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              Stay on top of your health
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Find the right specialist and plan your next visit. Your
              healthcare journey starts with a simple step.
            </p>

            <Link
              to="/doctors"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
            >
              Browse doctors <ArrowRight size={16} />
            </Link>

            <div className="mt-8 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock3 size={16} />
                Appointments will appear here once booked.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;
