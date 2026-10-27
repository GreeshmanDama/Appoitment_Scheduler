import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

import api from "../utils/axios";
import { setUserData } from "./redux/userSlice";

import Home from "./pages/Home";
import Login from "./pages/login/Login";
import Register from "./pages/Register";

import RequireAuth from "./components/auth/RequireAuth";
import GuestOnly from "./components/auth/GuestOnly";
import RoleRedirect from "./components/auth/RoleRedirect";

import PatientDashboard from "./pages/dashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Doctors from "./pages/Doctors";
import DoctorLogin from "./pages/login/DoctorLogin";
import AdminLogin from "./pages/login/AdminLogin";

function App() {
  const dispatch = useDispatch();
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const { data } = await api.get("/auth/me");

        if (!data?.success || !data?.user) {
          throw new Error("Invalid session response");
        }

        if (active) {
          dispatch(setUserData(data.user));
        }
      } catch (error) {
        if (active) {
          dispatch(setUserData(null));

          if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem("token");
          }

          if (axios.isAxiosError(error) && !error.response) {
            setSessionError(true);
          }
        }
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, [dispatch]);

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Unable to connect</h1>
        <p className="max-w-md text-sm text-slate-600">
          We couldn't verify your session because the server is unreachable.
          Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <Routes>

      <Route element={<GuestOnly />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/staff/login" element={<DoctorLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Patient-only pages */}
      <Route element={<RequireAuth allowedRoles={["patient"]} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />

        <Route path="/doctors" element={<Doctors />} />
      </Route>

      {/* Doctor-only pages */}
      <Route element={<RequireAuth allowedRoles={["doctor"]} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      </Route>

      {/* Admin-only pages */}
      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route
        path="/unauthorized"
        element={
          <div className="flex min-h-screen items-center justify-center p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Access denied</h1>
              <p className="mt-2 text-slate-600">
                Your account doesn't have permission to view this page.
              </p>
            </div>
          </div>
        }
      />

      <Route
        path="*"
        element={
          <div className="p-10 text-center">
            <h1 className="text-2xl font-bold">404</h1>
            <p className="mt-2">Page not found.</p>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
