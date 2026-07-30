/**
 * Footer.tsx — підвал: контакти, privacy
 */
import React from "react";
import { Contacts } from "../../types/content";
import { Shield, ExternalLink } from "lucide-react";

interface FooterProps {
  contacts: Contacts;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ contacts, onOpenPrivacy }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-mark brand-mark--footer">
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
              <Shield className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
          <span>Löwen Defence® Україна</span>
        </div>

        <div className="footer-links">
          <a href="#courses">Курси</a>
          <a href="#team">Команда</a>
          <a href="#contact">Контакти</a>
          <a
            href={contacts.germanWebsiteUrl || "https://www.loewen-defence.de"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white"
          >
            <span>Німецький сайт</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-white text-left"
          >
            Політика конфіденційності
          </button>
        </div>

        <div className="text-xs text-[#a9cdb8]">
          © {currentYear} Löwen Defence Україна
        </div>
      </div>
    </footer>
  );
};
