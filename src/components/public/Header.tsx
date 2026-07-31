/**
 * Header.tsx — шапка сайту (навігація, CTA, mobile menu, UA|EN)
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LanguageToggle } from "./LanguageToggle";

const DEFAULT_GERMAN_SITE = "https://www.loewen-defence.de";

interface HeaderProps {
  showAdminLink?: boolean;
  germanWebsiteUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showAdminLink = true,
  germanWebsiteUrl,
}) => {
  const { dict } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const germanUrl = germanWebsiteUrl?.trim() || DEFAULT_GERMAN_SITE;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (hash: string) => {
    setMenuOpen(false);
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="site-header">
      <div className="container nav">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#top");
          }}
          aria-label={dict.header.brandAria}
        >
          <div className="brand-mark">
            <img
              src="/logo/logo-mark.png"
              alt="Löwen Defence®"
              className="brand-mark-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(
                  ".logo-fallback"
                ) as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="logo-fallback hidden items-center justify-center w-full h-full text-[#04a64b]">
              <Shield className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="brand-title text-lg font-black tracking-tight block leading-none">
              Löwen Defence®
            </span>
            <small className="brand-tagline block font-extrabold text-[0.68rem] tracking-widest uppercase mt-1">
              {dict.brand.tagline}
            </small>
          </div>
        </a>

        <nav
          className={`nav-links ${menuOpen ? "open" : ""} lg:ml-10`}
          id="navLinks"
          aria-label={dict.header.navLabel}
        >
          <a href="#courses" onClick={() => handleNavClick("#courses")}>
            {dict.header.courses}
          </a>
          <a href="#approach" onClick={() => handleNavClick("#approach")}>
            {dict.header.method}
          </a>
          <a href="#business" onClick={() => handleNavClick("#business")}>
            {dict.header.business}
          </a>
          <a href="#team" onClick={() => handleNavClick("#team")}>
            {dict.header.team}
          </a>
          <a
            href={germanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
            title={dict.header.germanSiteTitle}
          >
            <span>{dict.header.germanSite}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href="#contact" onClick={() => handleNavClick("#contact")}>
            {dict.header.contact}
          </a>
          <div className="lang-toggle-wrap lang-toggle-wrap--menu">
            <LanguageToggle />
          </div>
          {showAdminLink && (
            <Link
              href="/admin"
              className="admin-link admin-link--menu"
              title={dict.header.adminTitle}
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="admin-link-wrap">
          <div className="lang-toggle-wrap lang-toggle-wrap--header">
            <LanguageToggle />
          </div>
          {showAdminLink && (
            <Link
              href="/admin"
              className="admin-link admin-link--header"
              title={dict.header.adminTitle}
            >
              Admin
            </Link>
          )}
          <button
            className="menu-btn"
            id="menuBtn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? dict.header.closeMenu : dict.header.openMenu}
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>
    </header>
  );
};
