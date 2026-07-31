/**
 * content.ts — типи SiteContent / Course / Team / Contacts
 * Текстові CMS-поля: LocalizedText = string (uk) | { uk, en? }.
 */
import type { LocalizedText } from "@/lib/i18n/localized";

export type { LocalizedText };

export interface ResponsiveImageData {
  url: string;
  alt: LocalizedText;
  focalX: number; // 0 - 100
  focalY: number; // 0 - 100
  mobileUrl?: string;
  mobileFocalX?: number;
  mobileFocalY?: number;
}

export interface Course {
  id: string;
  enabled: boolean;
  featured: boolean;
  order: number;
  tag: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  meta: LocalizedText[];
  price: LocalizedText;
  priceNote: LocalizedText;
  buttonLabel: LocalizedText;
  image: ResponsiveImageData;
}

export interface TeamMember {
  id: string;
  enabled: boolean;
  order: number;
  name: LocalizedText;
  description: LocalizedText;
  image: ResponsiveImageData;
}

export interface Contacts {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  websiteDisplay: string;
  websiteUrl: string;
  germanWebsiteUrl: string;
  privacyUrl: string;
}

export interface SiteContent {
  schemaVersion: number;
  updatedAt: string;
  courses: Course[];
  team: TeamMember[];
  contacts: Contacts;
}

export interface ContentHistoryBackup {
  timestamp: string;
  updatedAt: string;
  coursesCount: number;
  teamCount: number;
  content: SiteContent;
}
