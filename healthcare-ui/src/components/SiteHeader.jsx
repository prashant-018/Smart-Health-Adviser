import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import NearbyHospitalsModal from "./NearbyHospitalsModal";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { label: t("home"), to: "/" },
    { label: t("about"), to: "/about" },
    { label: `${t("bodyMap")} `, to: "/body-map" },
    { label: t("uploadLabReport"), to: "/upload-lab-report" },
    { label: t("uploadMedicine"), to: "/upload-medicine" },
    { label: t("skinDetector"), to: "/skin-detector" },
    { label: t("contactUs"), to: "/contact" },
  ];

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-cyan-600 ${
      isActive ? "text-cyan-600" : "text-slate-500"
    }`;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-cyan-600">
          Healthcare AI Assistant 🩺
        </Link>

        <button
          type="button"
          className="inline-flex rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav
          className={`${menuOpen ? "flex" : "hidden"} w-full basis-full flex-col gap-3 md:flex md:w-auto md:basis-auto md:flex-row md:items-center md:gap-8`}
        >
          {navLinks.map((link) => (
            <NavLink key={link.label} to={link.to} end={link.to === "/"} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            type="button"
            onClick={() => setNearbyOpen(true)}
            className="hidden items-center gap-1.5 rounded-md bg-pink-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 md:inline-flex"
          >
            <span aria-hidden>📍</span>
            {t("findNearbyHospital")}
          </button>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 pb-4 md:hidden">
        <button
          type="button"
          onClick={() => setNearbyOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-pink-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700"
        >
          <span aria-hidden>📍</span>
          {t("findNearbyHospital")}
        </button>
      </div>

      <NearbyHospitalsModal open={nearbyOpen} onClose={() => setNearbyOpen(false)} />
    </header>
  );
}
