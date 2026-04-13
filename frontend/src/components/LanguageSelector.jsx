import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages[language];

  return (
    <div className="relative w-full max-w-[200px] sm:max-w-none" ref={dropdownRef}>
      
      {/* BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span>{currentLang.flag}</span>

          {/* Prevent overflow */}
          <span className="truncate">
            {currentLang.nativeName}
          </span>
        </div>

        <svg
          className={`h-4 w-4 flex-shrink-0 transition ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[180px] max-w-[280px] overflow-hidden rounded-lg border bg-white shadow-lg">
          
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                  language === code
                    ? "bg-cyan-100 font-medium text-cyan-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <span className="flex-shrink-0">{lang.flag}</span>

                <div className="flex-1 min-w-0">
                  <div className="truncate">
                    {lang.nativeName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {lang.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}