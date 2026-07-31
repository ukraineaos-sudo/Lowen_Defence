/**
 * default-site-content.ts — дефолтний контент сайту (bootstrap)
 * Текстові поля: string (uk) або { uk, en } для публічного i18n.
 */
import { SiteContent } from "../types/content";

export const defaultSiteContent: SiteContent = {
  schemaVersion: 1,
  updatedAt: "2026-07-22T12:00:00.000Z",
  courses: [
    {
      id: "course-1",
      enabled: true,
      featured: true,
      order: 1,
      tag: { uk: "5–7 років", en: "Ages 5–7" },
      title: {
        uk: "Перші навички самозахисту",
        en: "First self-defence skills",
      },
      description: {
        uk: "Ігрове знайомство з особистими кордонами, інтуїцією, голосом і правилами безпечної поведінки.",
        en: "A playful introduction to personal boundaries, intuition, voice and safe behaviour rules.",
      },
      meta: [
        { uk: "до 14 дітей", en: "up to 14 children" },
        { uk: "1,5 години", en: "1.5 hours" },
        { uk: "очно", en: "in person" },
      ],
      price: { uk: "850 грн", en: "UAH 850" },
      priceNote: { uk: "за учасника", en: "per participant" },
      buttonLabel: { uk: "Записатися", en: "Sign up" },
      image: {
        url: "/courses/course-5-7.png",
        alt: {
          uk: "Курс для дітей 5–7 років",
          en: "Course for children aged 5–7",
        },
        focalX: 50,
        focalY: 50,
      },
    },
    {
      id: "course-2",
      enabled: true,
      featured: false,
      order: 2,
      tag: { uk: "8–11 років", en: "Ages 8–11" },
      title: {
        uk: "Впевненість і безпечна дія",
        en: "Confidence and safe action",
      },
      description: {
        uk: "Розпізнавання небезпеки, комунікація, пошук допомоги та адаптований самозахист.",
        en: "Recognising danger, communication, seeking help and age-adapted self-defence.",
      },
      meta: [
        { uk: "до 14 дітей", en: "up to 14 children" },
        { uk: "3 години", en: "3 hours" },
        { uk: "очно", en: "in person" },
      ],
      price: { uk: "1 250 грн", en: "UAH 1,250" },
      priceNote: { uk: "за учасника", en: "per participant" },
      buttonLabel: { uk: "Записатися", en: "Sign up" },
      image: {
        url: "/courses/course-8-11.png",
        alt: {
          uk: "Курс для дітей 8–11 років",
          en: "Course for children aged 8–11",
        },
        focalX: 50,
        focalY: 50,
      },
    },
    {
      id: "course-3",
      enabled: true,
      featured: false,
      order: 3,
      tag: { uk: "12–16 років", en: "Ages 12–16" },
      title: {
        uk: "Самовпевненість без конфронтації",
        en: "Confidence without confrontation",
      },
      description: {
        uk: "Булінг, словесні й фізичні конфлікти, впевнена поведінка, деескалація та самозахист у критичній ситуації.",
        en: "Bullying, verbal and physical conflict, confident behaviour, de-escalation and self-defence in critical situations.",
      },
      meta: [
        { uk: "до 14 учасників", en: "up to 14 participants" },
        { uk: "3 години", en: "3 hours" },
        { uk: "очно", en: "in person" },
      ],
      price: { uk: "1 250 грн", en: "UAH 1,250" },
      priceNote: { uk: "за учасника", en: "per participant" },
      buttonLabel: { uk: "Записатися", en: "Sign up" },
      image: {
        url: "/courses/course-12-16.png",
        alt: {
          uk: "Курс для підлітків 12–16 років",
          en: "Course for teens aged 12–16",
        },
        focalX: 50,
        focalY: 50,
      },
    },
    {
      id: "course-4",
      enabled: true,
      featured: false,
      order: 4,
      tag: { uk: "16+ років", en: "Ages 16+" },
      title: {
        uk: "Безпека для жінок і дівчат",
        en: "Safety for women and girls",
      },
      description: {
        uk: "Потенційно небезпечні ситуації, право сказати «ні», впевнена поведінка, кордони та практичний самозахист.",
        en: "Potentially dangerous situations, the right to say “no”, confident behaviour, boundaries and practical self-defence.",
      },
      meta: [
        { uk: "груповий формат", en: "group format" },
        { uk: "практика", en: "practice" },
      ],
      price: { uk: "За запитом", en: "On request" },
      priceNote: {
        uk: "індивідуальна пропозиція",
        en: "individual offer",
      },
      buttonLabel: { uk: "Дізнатися", en: "Learn more" },
      image: {
        url: "/courses/course-women.png",
        alt: { uk: "Курс для жінок", en: "Course for women" },
        focalX: 50,
        focalY: 50,
      },
    },
    {
      id: "course-5",
      enabled: true,
      featured: false,
      order: 5,
      tag: { uk: "Для батьків", en: "For parents" },
      title: {
        uk: "Як захистити своїх дітей?",
        en: "How to protect your children?",
      },
      description: {
        uk: "Ризики й міфи, реалістичне прочитання статистики, комунікація з дитиною, поведінка в небезпеці та зміцнення впевненості.",
        en: "Risks and myths, a realistic reading of statistics, talking with your child, behaviour in danger and building confidence.",
      },
      meta: [
        { uk: "5 відеоуроків", en: "5 video lessons" },
        { uk: "інфозустріч", en: "info session" },
      ],
      price: { uk: "За запитом", en: "On request" },
      priceNote: {
        uk: "онлайн або наживо",
        en: "online or in person",
      },
      buttonLabel: { uk: "Дізнатися", en: "Learn more" },
      image: {
        url: "/courses/course-parents.png",
        alt: { uk: "Курс для батьків", en: "Course for parents" },
        focalX: 50,
        focalY: 50,
      },
    },
    {
      id: "course-6",
      enabled: true,
      featured: false,
      order: 6,
      tag: { uk: "Освітнім закладам", en: "For schools" },
      title: {
        uk: "Курси для садків і шкіл",
        en: "Courses for kindergartens and schools",
      },
      description: {
        uk: "Індивідуальна програма для вашого закладу з виїздом тренерів, адаптацією до віку дітей та потреб команди.",
        en: "A custom program for your institution with trainers on site, adapted to children’s ages and team needs.",
      },
      meta: [
        { uk: "виїзний формат", en: "on-site format" },
        { uk: "індивідуальна програма", en: "custom program" },
      ],
      price: { uk: "За запитом", en: "On request" },
      priceNote: { uk: "для закладу", en: "for the institution" },
      buttonLabel: { uk: "Запросити", en: "Invite us" },
      image: {
        url: "/courses/course-schools.png",
        alt: {
          uk: "Курси для освітніх закладів",
          en: "Courses for educational institutions",
        },
        focalX: 50,
        focalY: 50,
      },
    },
  ],
  team: [
    {
      id: "team-1",
      enabled: true,
      order: 1,
      name: "Фелікс Тимченко",
      description: {
        uk: "Засновник Löwen Defence®, автор методики, експерт із безпеки з 25-річним досвідом.",
        en: "Founder of Löwen Defence®, method author, security expert with 25 years of experience.",
      },
      image: {
        url: "/team/felix-tymchenko.jpg",
        alt: { uk: "Фелікс Тимченко", en: "Felix Tymchenko" },
        focalX: 50,
        focalY: 30,
      },
    },
    {
      id: "team-2",
      enabled: true,
      order: 2,
      name: "Ольга Богданова",
      description: {
        uk: "Розвиток партнерства ESOSH та впровадження програми в Україні.",
        en: "Developing the ESOSH partnership and rolling out the program in Ukraine.",
      },
      image: {
        url: "/team/olga-bogdanova.jpg",
        alt: { uk: "Ольга Богданова", en: "Olga Bohdanova" },
        focalX: 50,
        focalY: 30,
      },
    },
    {
      id: "team-3",
      enabled: true,
      order: 3,
      name: "Олександр Шевченко",
      description: {
        uk: "Координатор проєкту Löwen Defence Україна.",
        en: "Project coordinator for Löwen Defence Ukraine.",
      },
      image: {
        url: "/team/oleksandr-shevchenko.jpg",
        alt: { uk: "Олександр Шевченко", en: "Oleksandr Shevchenko" },
        focalX: 50,
        focalY: 30,
      },
    },
    {
      id: "team-4",
      enabled: true,
      order: 4,
      name: "Валентина Забеліна",
      description: {
        uk: "Команда проєкту Löwen Defence Україна.",
        en: "Löwen Defence Ukraine project team.",
      },
      image: {
        url: "/team/valentyna-zabelina.jpg",
        alt: { uk: "Валентина Забеліна", en: "Valentyna Zabelina" },
        focalX: 50,
        focalY: 30,
      },
    },
    {
      id: "team-5",
      enabled: true,
      order: 5,
      name: "Анна Скотинянська",
      description: {
        uk: "Команда проєкту Löwen Defence Україна.",
        en: "Löwen Defence Ukraine project team.",
      },
      image: {
        url: "/team/anna-skotynianska.jpg",
        alt: { uk: "Анна Скотинянська", en: "Anna Skotynianska" },
        focalX: 50,
        focalY: 30,
      },
    },
  ],
  contacts: {
    phoneDisplay: "+38 097 170 20 78",
    phoneHref: "tel:+380971702078",
    email: "office@esosh.net",
    websiteDisplay: "www.esosh.net",
    websiteUrl: "https://www.esosh.net",
    germanWebsiteUrl: "https://www.loewen-defence.de",
    privacyUrl: "/privacy",
  },
};
