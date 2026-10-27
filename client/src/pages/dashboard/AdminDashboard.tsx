
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
  UserRound,
  Ban,
  RefreshCw,
  AlertCircle,
  Mail,
  GraduationCap,
  BriefcaseMedical,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/axios";
import { setUserData } from "../../redux/userSlice";

type Section = "overview" | "doctors" | "appointments" | "patients";

type Doctor = {
  _id: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    isVerified?: boolean;
    isActive?: boolean;
  } | string;
  name?: string;
  email?: string;
  doctorCode: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  isActive?: boolean;
  createdAt?: string;
};

type Patient = {
  _id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  createdAt?: string;
};

type Appointment = {
  _id: string;
  patientName?: string;
  doctorName?: string;
  startAt?: string;
  appointmentDate?: string;
  status: string;
};

type DashboardStats = {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
};

type DoctorForm = {
  name: string;
  email: string;
  password: string;
  doctorCode: string;
  specialization: string;
  qualification: string;
  experienceYears: string;
};

const emptyDoctorForm: DoctorForm = {
  name: "",
  email: "",
  password: "",
  doctorCode: "",
  specialization: "",
  qualification: "",
  experienceYears: "0",
};

const navItems: {
  id: Section;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "patients", label: "Patients", icon: Users },
];

const initialStats: DashboardStats = {
  totalDoctors: 0,
  totalPatients: 0,
  totalAppointments: 0,
  pendingAppointments: 0,
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as { response?: { data?: { message?: string } } }
    ).response;

    if (response?.data?.message) return response.data.message;
  }

  return "Something went wrong. Please try again.";
}

function getDoctorUser(doctor: Doctor) {
  return typeof doctor.userId === "object" && doctor.userId
    ? doctor.userId
    : undefined;
}

function getDoctorName(doctor: Doctor) {
  return doctor.name || getDoctorUser(doctor)?.name || "Unnamed doctor";
}

function getDoctorEmail(doctor: Doctor) {
  return doctor.email || getDoctorUser(doctor)?.email || "—";
}

function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const style =
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "active" ||
    normalized === "verified"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : normalized === "cancelled" ||
          normalized === "canceled" ||
          normalized === "inactive" ||
          normalized === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-600/20"
        : "bg-amber-50 text-amber-700 ring-amber-600/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState("all");

  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<DoctorForm>(emptyDoctorForm);
  const [savingDoctor, setSavingDoctor] = useState(false);

  const loadOverview = useCallback(async () => {
    const [statsResult, doctorsResult, appointmentsResult] =
      await Promise.allSettled([
        api.get("/admin/dashboard/stats"),
        api.get("/admin/doctors"),
        api.get("/admin/appointments"),
      ]);

    if (statsResult.status === "fulfilled") {
      const data = statsResult.value.data;
      setStats(data.stats ?? data.data ?? data);
    }

    if (doctorsResult.status === "fulfilled") {
      const data = doctorsResult.value.data;
      setDoctors(data.doctors ?? data.data ?? []);
    }

    if (appointmentsResult.status === "fulfilled") {
      const data = appointmentsResult.value.data;
      setAppointments(data.appointments ?? data.data ?? []);
    }

    const failed = [statsResult, doctorsResult, appointmentsResult].some(
      (result) => result.status === "rejected",
    );

    if (failed) {
      setError(
        "Some dashboard data could not be loaded. Check that the admin API endpoints are implemented.",
      );
    }
  }, []);

  const loadDoctors = useCallback(async () => {
    const response = await api.get("/admin/doctors");
    const data = response.data;
    setDoctors(data.doctors ?? data.data ?? []);
  }, []);

  const loadPatients = useCallback(async () => {
    const response = await api.get("/admin/patients");
    const data = response.data;
    setPatients(data.patients ?? data.data ?? []);
  }, []);

  const loadAppointments = useCallback(async () => {
    const response = await api.get("/admin/appointments");
    const data = response.data;
    setAppointments(data.appointments ?? data.data ?? []);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (section === "overview") {
        await loadOverview();
      } else if (section === "doctors") {
        await loadDoctors();
      } else if (section === "patients") {
        await loadPatients();
      } else if (section === "appointments") {
        await loadAppointments();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [
    section,
    loadOverview,
    loadDoctors,
    loadPatients,
    loadAppointments,
  ]);

  useEffect(() => {
    const callLoadData = async () => {
      void loadData();
    }
    callLoadData()
  }, [loadData]);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return doctors;

    return doctors.filter((doctor) =>
      [
        getDoctorName(doctor),
        getDoctorEmail(doctor),
        doctor.doctorCode,
        doctor.specialization,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [doctors, search]);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;

    return patients.filter((patient) =>
      `${patient.name} ${patient.email}`.toLowerCase().includes(term),
    );
  }, [patients, search]);

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus =
        appointmentFilter === "all" ||
        appointment.status.toLowerCase() === appointmentFilter;

      const matchesSearch =
        !term ||
        `${appointment.patientName ?? ""} ${appointment.doctorName ?? ""} ${appointment.status}`
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, appointmentFilter, search]);

  const openCreateDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm(emptyDoctorForm);
    setError("");
    setSuccess("");
    setDoctorModalOpen(true);
  };

  const openEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: getDoctorName(doctor) === "Unnamed doctor" ? "" : getDoctorName(doctor),
      email: getDoctorEmail(doctor) === "—" ? "" : getDoctorEmail(doctor),
      password: "",
      doctorCode: doctor.doctorCode,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experienceYears: String(doctor.experienceYears ?? 0),
    });
    setError("");
    setSuccess("");
    setDoctorModalOpen(true);
  };

  const handleDoctorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const years = Number(doctorForm.experienceYears);

    if (
      !doctorForm.name.trim() ||
      !doctorForm.email.trim() ||
      !doctorForm.doctorCode.trim() ||
      !doctorForm.specialization.trim() ||
      !doctorForm.qualification.trim()
    ) {
      setError("Please fill in all required doctor fields.");
      return;
    }

    if (!editingDoctor && doctorForm.password.length < 8) {
      setError("The initial password must contain at least 8 characters.");
      return;
    }

    if (!Number.isInteger(years) || years < 0 || years > 70) {
      setError("Experience must be a whole number between 0 and 70.");
      return;
    }

    const payload = {
      name: doctorForm.name.trim(),
      email: doctorForm.email.trim().toLowerCase(),
      doctorCode: doctorForm.doctorCode.trim(),
      specialization: doctorForm.specialization.trim(),
      qualification: doctorForm.qualification.trim(),
      experienceYears: years,
      ...(doctorForm.password ? { password: doctorForm.password } : {}),
    };

    setSavingDoctor(true);

    try {
      if (editingDoctor) {
        await api.patch(`/admin/update-doctor/${editingDoctor._id}`, payload);
        setSuccess("Doctor information updated successfully.");
      } else {
        await api.post("/admin/create-doctor", payload);
        setSuccess("Doctor account created successfully.");
      }

      setDoctorModalOpen(false);
      await loadDoctors();
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingDoctor(false);
    }
  };

  const toggleDoctorStatus = async (doctor: Doctor) => {
    const currentlyActive =
      doctor.isActive ?? getDoctorUser(doctor)?.isActive ?? true;

    const confirmed = window.confirm(
      `${currentlyActive ? "Deactivate" : "Activate"} ${getDoctorName(doctor)}'s account?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.patch(`/admin/doctors/${doctor._id}/status`, {
        isActive: !currentlyActive,
      });

      setSuccess(
        `Doctor account ${currentlyActive ? "deactivated" : "activated"} successfully.`,
      );

      await loadDoctors();
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const cancelAppointment = async (appointment: Appointment) => {
    if (
      !window.confirm(
        "Cancel this appointment? This action should follow your clinic's cancellation policy.",
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.patch(`/admin/appointments/${appointment._id}/cancel`);
      setSuccess("Appointment cancelled.");
      await loadAppointments();
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch(
      setUserData({
        id: "",
        name: "",
        email: "",
        role: "patient",
        isVerified: false,
      }),
    );
    navigate("/admin/login", { replace: true });
  };

  const activeNav = navItems.find((item) => item.id === section);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileNavOpen && (
        <button
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CarePoint</h1>
            <p className="text-xs text-slate-500">Clinic administration</p>
          </div>
          <button
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = section === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSection(item.id);
                    setSearch("");
                    setMobileNavOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    selected
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                  {selected && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-teal-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={18} className="text-teal-700" />
              Administrator
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Manage clinic accounts and appointments securely.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                CarePoint / Administration
              </p>
              <h2 className="mt-1 truncate text-lg font-bold">
                {activeNav?.label ?? "Overview"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Admin workspace
            </div>
            <button
              onClick={() => void refresh()}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p className="flex-1">{error}</p>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <Check size={18} />
              <p className="flex-1">{success}</p>
              <button onClick={() => setSuccess("")} aria-label="Dismiss message">
                <X size={17} />
              </button>
            </div>
          )}

          {section === "overview" && (
            <div className="space-y-8">
              <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-medium text-teal-300">
                      ADMINISTRATOR WORKSPACE
                    </p>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                      Your clinic, at a glance.
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                      Manage your medical team, monitor appointments, and keep
                      clinic operations organized from one place.
                    </p>
                  </div>
                  <button
                    onClick={openCreateDoctor}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
                  >
                    <Plus size={18} />
                    Add a doctor
                  </button>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Total doctors"
                  value={stats.totalDoctors}
                  description="Registered medical professionals"
                  icon={Stethoscope}
                />
                <MetricCard
                  title="Total patients"
                  value={stats.totalPatients}
                  description="Patient accounts"
                  icon={Users}
                />
                <MetricCard
                  title="Appointments"
                  value={stats.totalAppointments}
                  description="Appointments across the clinic"
                  icon={CalendarDays}
                />
                <MetricCard
                  title="Pending appointments"
                  value={stats.pendingAppointments}
                  description="Require attention"
                  icon={Clock3}
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Doctor directory</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Recently added doctors
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("doctors")}
                      className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-5 divide-y divide-slate-100">
                    {doctors.slice(0, 5).map((doctor) => (
                      <div
                        key={doctor._id}
                        className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                          <Stethoscope size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {getDoctorName(doctor)}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {doctor.specialization}
                          </p>
                        </div>
                        <StatusBadge
                          status={
                            doctor.isActive ??
                            getDoctorUser(doctor)?.isActive ??
                            true
                              ? "Active"
                              : "Inactive"
                          }
                        />
                      </div>
                    ))}
                    {!loading && doctors.length === 0 && (
                      <p className="py-8 text-center text-sm text-slate-500">
                        No doctors yet. Add your first doctor to get started.
                      </p>
                    )}
                    {loading && (
                      <p className="py-8 text-center text-sm text-slate-500">
                        Loading doctors…
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h3 className="font-bold">Quick actions</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Common administration tasks
                  </p>

                  <div className="mt-5 space-y-3">
                    <button
                      onClick={openCreateDoctor}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
                    >
                      <span className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                        <Plus size={19} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          Create doctor account
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          Assign credentials and professional details
                        </span>
                      </span>
                      <ArrowUpRight size={17} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => setSection("appointments")}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
                    >
                      <span className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                        <CalendarDays size={19} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          Review appointments
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          Inspect bookings and appointment statuses
                        </span>
                      </span>
                      <ArrowUpRight size={17} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => setSection("patients")}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
                    >
                      <span className="rounded-lg bg-violet-50 p-2.5 text-violet-700">
                        <Users size={19} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          Browse patients
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          Find registered patient accounts
                        </span>
                      </span>
                      <ArrowUpRight size={17} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Recent appointments</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest appointment activity
                    </p>
                  </div>
                  <button
                    onClick={() => setSection("appointments")}
                    className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Manage appointments
                  </button>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="rounded-l-lg px-4 py-3 font-semibold">
                          Patient
                        </th>
                        <th className="px-4 py-3 font-semibold">Doctor</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="rounded-r-lg px-4 py-3 font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.slice(0, 5).map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="px-4 py-4 font-medium">
                            {appointment.patientName ?? "—"}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {appointment.doctorName ?? "—"}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatDate(
                              appointment.startAt ??
                                appointment.appointmentDate,
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={appointment.status} />
                          </td>
                        </tr>
                      ))}
                      {!loading && appointments.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-slate-500"
                          >
                            No appointments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {section === "doctors" && (
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h3 className="text-lg font-bold">Doctor management</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Create, update, activate, or deactivate doctor accounts.
                  </p>
                </div>
                <button
                  onClick={openCreateDoctor}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  <Plus size={17} />
                  Add doctor
                </button>
              </div>

              <div className="border-b border-slate-100 p-4 sm:p-6">
                <div className="relative max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email, ID, specialization..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Doctor</th>
                      <th className="px-6 py-4 font-semibold">Doctor ID</th>
                      <th className="px-6 py-4 font-semibold">Specialization</th>
                      <th className="px-6 py-4 font-semibold">Experience</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDoctors.map((doctor) => {
                      const active =
                        doctor.isActive ??
                        getDoctorUser(doctor)?.isActive ??
                        true;

                      return (
                        <tr key={doctor._id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-800">
                                {getDoctorName(doctor).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {getDoctorName(doctor)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {getDoctorEmail(doctor)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">
                            {doctor.doctorCode}
                          </td>
                          <td className="px-6 py-4">
                            {doctor.specialization}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {doctor.experienceYears} years
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge
                              status={active ? "Active" : "Inactive"}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditDoctor(doctor)}
                                title="Edit doctor"
                                aria-label={`Edit ${getDoctorName(doctor)}`}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => void toggleDoctorStatus(doctor)}
                                title={active ? "Deactivate doctor" : "Activate doctor"}
                                aria-label={`${active ? "Deactivate" : "Activate"} ${getDoctorName(doctor)}`}
                                className={`rounded-lg border p-2 ${
                                  active
                                    ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                }`}
                              >
                                {active ? <Ban size={16} /> : <Check size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!loading && filteredDoctors.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-14 text-center text-slate-500"
                        >
                          <Stethoscope className="mx-auto mb-3 text-slate-300" size={30} />
                          <p className="font-medium">No doctors found</p>
                          <p className="mt-1 text-sm">
                            Try a different search or create a doctor account.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </div>
            </section>
          )}

          {section === "appointments" && (
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <h3 className="text-lg font-bold">Appointment management</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Review bookings and cancel appointments when authorized.
                </p>
                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search patient or doctor..."
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={appointmentFilter}
                      onChange={(event) => setAppointmentFilter(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm capitalize outline-none focus:border-teal-500 md:w-52"
                    >
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Patient</th>
                      <th className="px-6 py-4 font-semibold">Doctor</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold">
                          {appointment.patientName ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {appointment.doctorName ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(
                            appointment.startAt ?? appointment.appointmentDate,
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!["cancelled", "canceled", "completed"].includes(
                            appointment.status.toLowerCase(),
                          ) && (
                            <button
                              onClick={() => void cancelAppointment(appointment)}
                              className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredAppointments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No appointments match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === "patients" && (
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <h3 className="text-lg font-bold">Patient management</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search registered patient accounts and review basic account information.
                </p>
                <div className="relative mt-5 max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search patient name or email..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Patient</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Joined</th>
                      <th className="px-6 py-4 font-semibold">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <UserRound size={18} />
                            </div>
                            <span className="font-semibold">{patient.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {patient.email}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(patient.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={patient.isVerified ? "Verified" : "Pending"}
                          />
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredPatients.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          No patients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
                Showing {filteredPatients.length} of {patients.length} patients
              </div>
            </section>
          )}

          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
              <RefreshCw size={16} className="animate-spin" />
              Loading dashboard data…
            </div>
          )}

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
            <p>CarePoint Administration</p>
            <p>Authorized staff only · Protect patient information</p>
          </footer>
        </main>
      </div>

      {doctorModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingDoctor) {
              setDoctorModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-modal-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  {editingDoctor ? <Pencil size={20} /> : <Plus size={20} />}
                </div>
                <h3 id="doctor-modal-title" className="text-xl font-bold">
                  {editingDoctor ? "Update doctor" : "Create doctor account"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingDoctor
                    ? "Update the doctor's professional and account information."
                    : "Create a login account and assign the doctor's clinic details."}
                </p>
              </div>
              <button
                onClick={() => setDoctorModalOpen(false)}
                disabled={savingDoctor}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDoctorSubmit}>
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Full name *
                  <span className="relative block">
                    <UserRound
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      maxLength={100}
                      value={doctorForm.name}
                      onChange={(event) =>
                        setDoctorForm({ ...doctorForm, name: event.target.value })
                      }
                      placeholder="Dr. Jane Smith"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </span>
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Email address *
                  <span className="relative block">
                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      type="email"
                      maxLength={254}
                      value={doctorForm.email}
                      onChange={(event) =>
                        setDoctorForm({ ...doctorForm, email: event.target.value })
                      }
                      placeholder="doctor@clinic.com"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </span>
                </label>

                {!editingDoctor && (
                  <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                    Initial password *
                    <input
                      required
                      type="password"
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      value={doctorForm.password}
                      onChange={(event) =>
                        setDoctorForm({ ...doctorForm, password: event.target.value })
                      }
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                    <span className="block text-xs font-normal text-slate-500">
                      Share initial credentials securely. The backend must hash this password.
                    </span>
                  </label>
                )}

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Doctor ID / Code *
                  <input
                    required
                    maxLength={40}
                    value={doctorForm.doctorCode}
                    onChange={(event) =>
                      setDoctorForm({ ...doctorForm, doctorCode: event.target.value })
                    }
                    placeholder="DOC-1001"
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Specialization *
                  <span className="relative block">
                    <BriefcaseMedical
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      maxLength={100}
                      value={doctorForm.specialization}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          specialization: event.target.value,
                        })
                      }
                      placeholder="Cardiology"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </span>
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Qualification *
                  <span className="relative block">
                    <GraduationCap
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      maxLength={150}
                      value={doctorForm.qualification}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          qualification: event.target.value,
                        })
                      }
                      placeholder="MBBS, MD"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </span>
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Years of experience *
                  <input
                    required
                    type="number"
                    min={0}
                    max={70}
                    step={1}
                    value={doctorForm.experienceYears}
                    onChange={(event) =>
                      setDoctorForm({
                        ...doctorForm,
                        experienceYears: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  disabled={savingDoctor}
                  onClick={() => setDoctorModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoctor}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingDoctor ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      {editingDoctor ? "Save changes" : "Create doctor"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
