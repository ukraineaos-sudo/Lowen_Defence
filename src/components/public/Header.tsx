/**
 * Header.tsx — шапка сайту (навігація, CTA, mobile menu)
 */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X, ExternalLink } from "lucide-react";

const DEFAULT_GERMAN_SITE = "https://www.loewen-defence.de";

interface HeaderProps {
  showAdminLink?: boolean;
  germanWebsiteUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showAdminLink = true,
  germanWebsiteUrl,
}) => {
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
          aria-label="Löwen Defence Україна"
        >
          <div className="brand-mark">
            <img
              src="/logo/logo.png"
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
              Україна · Захист Лева
            </small>
          </div>
        </a>

        <nav
          className={`nav-links ${menuOpen ? "open" : ""} lg:ml-10`}
          id="navLinks"
          aria-label="Головна навігація"
        >
          <a href="#courses" onClick={() => handleNavClick("#courses")}>
            Курси
          </a>
          <a href="#approach" onClick={() => handleNavClick("#approach")}>
            Методика
          </a>
          <a href="#business" onClick={() => handleNavClick("#business")}>
            Для організацій
          </a>
          <a href="#team" onClick={() => handleNavClick("#team")}>
            Команда
          </a>
          <a
            href={germanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
            title="Перейти на німецький сайт"
          >
            <span>Німецький сайт</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href="#contact" onClick={() => handleNavClick("#contact")}>
            Контакти
          </a>
          {showAdminLink && (
            <Link
              href="/admin"
              className="admin-link admin-link--menu"
              title="Адмін-панель"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="admin-link-wrap">
          {showAdminLink && (
            <Link href="/admin" className="admin-link admin-link--header" title="Адмін-панель">
              Admin
            </Link>
          )}
          <button
            className="menu-btn"
            id="menuBtn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>
    </header>
  );
};
