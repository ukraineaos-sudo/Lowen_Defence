export interface ResponsiveImageData {
  url: string;
  alt: string;
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
  tag: string;
  title: string;
  description: string;
  meta: string[];
  price: string;
  priceNote: string;
  buttonLabel: string;
  image: ResponsiveImageData;
}

export interface TeamMember {
  id: string;
  enabled: boolean;
  order: number;
  name: string;
  description: string;
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
