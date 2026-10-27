import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Heart,
  HeartPulse,
  Menu,
  Pill,
  ShieldCheck,
  ShieldPlus,
  Stethoscope,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=85";

const navLinks = [
  { label: "Home", href: "#home", active: true },
  { label: "Services", href: "#services" },
  { label: "Doctors", href: "/login" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const features = [
  {
    icon: ShieldPlus,
    title: "Trusted Doctors",
    lines: ["Verified and experienced", "healthcare professionals"],
  },
  {
    icon: Clock3,
    title: "Easy Booking",
    lines: ["Book appointments", "in just a few clicks"],
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    lines: ["Your health data", "is always protected"],
  },
  {
    icon: Heart,
    title: "Better Health",
    lines: ["Personalized care for", "a healthier you"],
  },
];

const services = [
  {
    icon: Stethoscope,
    title: "General Consultation",
    description: "Get expert advice for your health concerns.",
    tint: "bg-[#e6eefb] text-[#2f63b8]",
  },
  {
    icon: HeartPulse,
    title: "Specialist Consultation",
    description: "Access specialized care from top doctors.",
    tint: "bg-[#dff3ee] text-[#12a08f]",
  },
  {
    icon: CalendarDays,
    title: "Online Appointments",
    description: "Book your appointment anytime, anywhere.",
    tint: "bg-[#ebe8fa] text-[#6a55c9]",
  },
  {
    icon: Pill,
    title: "Health Checkups",
    description: "Stay ahead with regular health checkups.",
    tint: "bg-[#fde8e5] text-[#ef5a4b]",
  },
];

function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        fill="#0ea294"
      />
      <path
        d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavItem({
  item,
  className = "",
  onClick,
}: {
  item: (typeof navLinks)[number];
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  const isHash = item.href.startsWith("#");

  return isHash ? (
    <a href={item.href} onClick={onClick} className={className}>
      {item.label}
    </a>
  ) : (
    <Link to={item.href} onClick={onClick} className={className}>
      {item.label}
    </Link>
  );
}

function Tagline({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none text-[#1b3f7a] ${className}`}
      style={{
        fontFamily: "'Caveat', 'Segoe Script', 'Bradley Hand', cursive",
        transform: "rotate(-8deg)",
        transformOrigin: "left bottom",
      }}
    >
      <p className="text-[22px] font-medium leading-[1.05]">
        Better Care
        <br />
        Brighter Tomorrow
      </p>
      <div className="mt-1 flex items-end gap-1.5">
        <Heart size={15} strokeWidth={1.4} />
        <svg
          width="64"
          height="30"
          viewBox="0 0 64 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M1 26C20 28 48 22 61 3" />
        </svg>
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main
      className="min-h-screen bg-white text-[#14325c]"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-[66px] max-w-[1276px] items-center px-5 sm:px-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-[11px]"
            aria-label="HealthCare+ home"
          >
            <LogoMark />
            <span className="text-[22px] font-bold tracking-tight text-[#14325c]">
              HealthCare<span className="text-[#0ea294]">+</span>
            </span>
          </Link>

          <div className="ml-12 hidden items-center gap-9 md:flex xl:ml-[170px]">
            {navLinks.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                className={
                  item.active
                    ? "relative text-[13.5px] font-semibold text-[#0ea294] after:absolute after:-bottom-[7px] after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#0ea294]"
                    : "text-[13.5px] font-medium text-slate-600 transition hover:text-[#0ea294]"
                }
                onClick={undefined}
              />
            ))}
          </div>

          <div className="ml-auto hidden items-center gap-[15px] md:flex">
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-md border border-[#2b4a73]/70 px-[22px] text-[13px] font-semibold text-[#14325c] transition hover:bg-slate-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex h-9 items-center rounded-md bg-[#0ea294] px-[22px] text-[13px] font-semibold text-white transition hover:bg-[#0b8d81]"
            >
              Sign Up
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-[#14325c] md:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl md:hidden">
            <div className="mx-auto flex max-w-[1276px] flex-col gap-1">
              {navLinks.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  onClick={closeMenu}
                  className={`rounded-lg px-3 py-3 text-sm font-medium hover:bg-slate-50 ${
                    item.active ? "text-[#0ea294]" : "text-slate-700"
                  }`}
                />
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-md border border-[#2b4a73]/70 py-3 text-center text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-md bg-[#0ea294] py-3 text-center text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ----------------------------- Hero ----------------------------- */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-r from-[#eaf3fc] via-[#f3f8fd] to-[#fafdff]"
      >
        <div
          aria-hidden="true"
          className="absolute left-[48.2%] top-[43%] hidden h-[43%] w-[7%] -rotate-[12deg] rounded-[50%] bg-[#d3e6fa] lg:block"
        />

        <div className="absolute inset-y-0 right-0 hidden w-[48.5%] lg:block">
          <img
            src={HERO_IMAGE}
            alt="Smiling doctor speaking with a patient"
            className="h-full w-full object-cover object-[center_30%]"
            style={{ borderRadius: "25% 0 0 25% / 50% 0 0 50%" }}
          />
          <Tagline className="absolute left-[60%] top-[8%]" />
        </div>

        <div className="relative mx-auto max-w-[1276px] px-5 sm:px-8">
          <div className="py-12 lg:flex lg:min-h-[409px] lg:items-center lg:py-0">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#1565c0]">
                Your health, our priority
              </p>

              <h1 className="mt-2.5 text-[34px] font-bold leading-[1.25] tracking-tight text-[#14325c] sm:text-[40px] xl:text-[44px]">
                Quality Healthcare
                <br />
                Made Simple
              </h1>

              <p className="mt-2.5 max-w-lg text-[16px] leading-[26px] text-slate-600">
                Book appointments with trusted doctors, manage your{" "}
                <br className="hidden lg:block" />
                health records, and get the care you deserve — all in one place.
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center justify-center gap-2.5 rounded-md bg-[#0ea294] px-[26px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#0b8d81]"
                >
                  <CalendarDays size={17} strokeWidth={1.8} />
                  Book Appointment
                </Link>

                <Link
                  to="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-400/80 bg-white/70 px-[22px] text-[13.5px] font-medium text-[#14325c] transition hover:bg-white"
                >
                  Explore Doctors
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* photo (mobile / tablet) */}
          <div className="pb-10 lg:hidden">
            <img
              src={HERO_IMAGE}
              alt="Smiling doctor speaking with a patient"
              className="h-72 w-full rounded-3xl object-cover object-[center_30%] sm:h-96"
            />
          </div>
        </div>
      </section>

      {/* --------------------------- Features --------------------------- */}
      <section id="about" className="border-b border-slate-100 bg-[#fbfdff]">
        <div className="mx-auto grid max-w-[1276px] gap-6 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-[286fr_317fr_327fr_282fr] lg:gap-0">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`flex items-start gap-[19px] ${
                  i > 0 ? "lg:border-l lg:border-slate-200/60 lg:pl-[19px]" : ""
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e0f3f1] text-[#0e9f94]">
                  <Icon size={26} strokeWidth={1.7} />
                </div>

                <div className="pt-2.5">
                  <h3 className="text-[14px] font-bold leading-5 text-[#14325c]">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">
                    {feature.lines[0]} <br className="hidden sm:block" />
                    {feature.lines[1]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------- Services --------------------------- */}
      <section
        id="services"
        className="bg-gradient-to-r from-[#eef5fc] to-[#f6f9fd]"
      >
        <div className="mx-auto grid max-w-[1276px] gap-8 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[350px_1fr] lg:gap-0 lg:pb-[30px] lg:pt-9">
          <div>
            <p className="text-[12px] font-bold uppercase leading-4 tracking-[0.14em] text-[#1565c0]">
              Our Services
            </p>
            <h2 className="mt-2 text-[26px] font-bold leading-8 tracking-tight text-[#14325c]">
              Complete Healthcare
              <br />
              Services for You
            </h2>
            <p className="mt-2.5 max-w-sm text-[12.5px] leading-[21.5px] text-slate-500">
              From general checkups to specialized care,{" "}
              <br className="hidden lg:block" />
              we provide a wide range of medical services{" "}
              <br className="hidden lg:block" />
              to meet your needs.
            </p>
            <a
              href="#services"
              className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold leading-4 text-[#0ea294] transition hover:text-[#0b8d81]"
            >
              View All Services <ArrowRight size={13} />
            </a>
          </div>

          <div className="grid gap-[18px] sm:grid-cols-2 lg:mt-3 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="flex min-h-[198px] flex-col rounded-lg bg-white px-5 pb-[18px] pt-[17px] shadow-[0_2px_14px_rgba(30,64,120,0.07)]"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${service.tint}`}
                  >
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-2 text-[14.5px] font-bold leading-5 text-[#14325c]">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">
                    {service.description}
                  </p>

                  <Link
                    to="/register"
                    className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[11.5px] font-bold leading-4 text-[#0b84c2] transition hover:text-[#0a6ea3]"
                  >
                    Learn More <ArrowRight size={13} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="bg-[#1b3a5c] px-5 pb-6 pt-[21px] text-center"
      >
        <h2 className="text-[17px] font-semibold leading-6 text-white">
          Your Health Journey Starts Here
        </h2>
        <p className="mt-1 text-[11px] leading-4 text-slate-300">
          Join thousands of patients who trust us for their healthcare needs.
        </p>

        <div className="mt-[13px] flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex h-8 items-center rounded-md bg-[#0ea294] px-[22px] text-[11.5px] font-semibold text-white transition hover:bg-[#12b5a6]"
          >
            Sign Up Now
          </Link>
          <a
            href="#services"
            className="inline-flex h-8 items-center rounded-md border border-white/60 px-[22px] text-[11.5px] font-semibold text-white transition hover:bg-white/10"
          >
            Learn More
          </a>
          <Link
            to="/staff/login"
            className="text-sm font-medium text-slate-100 transition hover:text-teal-600"
          >
            Staff Portal
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
