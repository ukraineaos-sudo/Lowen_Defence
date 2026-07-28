/**
 * default-site-content.ts — дефолтний контент сайту (bootstrap)
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
      tag: "5–7 років",
      title: "Перші навички самозахисту",
      description: "Ігрове знайомство з особистими кордонами, інтуїцією, голосом і правилами безпечної поведінки.",
      meta: ["до 14 дітей", "1,5 години", "очно"],
      price: "850 грн",
      priceNote: "за учасника",
      buttonLabel: "Записатися",
      image: {
        url: "/courses/course-5-7.png",
        alt: "Курс для дітей 5–7 років",
        focalX: 50,
        focalY: 50
      }
    },
    {
      id: "course-2",
      enabled: true,
      featured: false,
      order: 2,
      tag: "8–11 років",
      title: "Впевненість і безпечна дія",
      description: "Розпізнавання небезпеки, комунікація, пошук допомоги та адаптований самозахист.",
      meta: ["до 14 дітей", "3 години", "очно"],
      price: "1 250 грн",
      priceNote: "за учасника",
      buttonLabel: "Записатися",
      image: {
        url: "/courses/course-8-11.png",
        alt: "Курс для дітей 8–11 років",
        focalX: 50,
        focalY: 50
      }
    },
    {
      id: "course-3",
      enabled: true,
      featured: false,
      order: 3,
      tag: "12–16 років",
      title: "Самовпевненість без конфронтації",
      description: "Булінг, словесні й фізичні конфлікти, впевнена поведінка, деескалація та самозахист у критичній ситуації.",
      meta: ["до 14 учасників", "3 години", "очно"],
      price: "1 250 грн",
      priceNote: "за учасника",
      buttonLabel: "Записатися",
      image: {
        url: "/courses/course-12-16.png",
        alt: "Курс для підлітків 12–16 років",
        focalX: 50,
        focalY: 50
      }
    },
    {
      id: "course-4",
      enabled: true,
      featured: false,
      order: 4,
      tag: "16+ років",
      title: "Безпека для жінок і дівчат",
      description: "Потенційно небезпечні ситуації, право сказати «ні», впевнена поведінка, кордони та практичний самозахист.",
      meta: ["груповий формат", "практика"],
      price: "За запитом",
      priceNote: "індивідуальна пропозиція",
      buttonLabel: "Дізнатися",
      image: {
        url: "/courses/course-women.png",
        alt: "Курс для жінок",
        focalX: 50,
        focalY: 50
      }
    },
    {
      id: "course-5",
      enabled: true,
      featured: false,
      order: 5,
      tag: "Для батьків",
      title: "Як захистити своїх дітей?",
      description: "Ризики й міфи, реалістичне прочитання статистики, комунікація з дитиною, поведінка в небезпеці та зміцнення впевненості.",
      meta: ["5 відеоуроків", "інфозустріч"],
      price: "За запитом",
      priceNote: "онлайн або наживо",
      buttonLabel: "Дізнатися",
      image: {
        url: "/courses/course-parents.png",
        alt: "Курс для батьків",
        focalX: 50,
        focalY: 50
      }
    },
    {
      id: "course-6",
      enabled: true,
      featured: false,
      order: 6,
      tag: "Освітнім закладам",
      title: "Курси для садків і шкіл",
      description: "Індивідуальна програма для вашого закладу з виїздом тренерів, адаптацією до віку дітей та потреб команди.",
      meta: ["виїзний формат", "індивідуальна програма"],
      price: "За запитом",
      priceNote: "для закладу",
      buttonLabel: "Запросити",
      image: {
        url: "/courses/course-schools.png",
        alt: "Курси для освітніх закладів",
        focalX: 50,
        focalY: 50
      }
    }
  ],
  team: [
    {
      id: "team-1",
      enabled: true,
      order: 1,
      name: "Фелікс Тимченко",
      description: "Засновник Löwen Defence®, автор методики, експерт із безпеки з 25-річним досвідом.",
      image: {
        url: "/team/felix-tymchenko.jpg",
        alt: "Фелікс Тимченко",
        focalX: 50,
        focalY: 30
      }
    },
    {
      id: "team-2",
      enabled: true,
      order: 2,
      name: "Ольга Богданова",
      description: "Розвиток партнерства ESOSH та впровадження програми в Україні.",
      image: {
        url: "/team/olga-bogdanova.jpg",
        alt: "Ольга Богданова",
        focalX: 50,
        focalY: 30
      }
    },
    {
      id: "team-3",
      enabled: true,
      order: 3,
      name: "Олександр Шевченко",
      description: "Координатор проєкту Löwen Defence Україна.",
      image: {
        url: "/team/oleksandr-shevchenko.jpg",
        alt: "Олександр Шевченко",
        focalX: 50,
        focalY: 30
      }
    },
    {
      id: "team-4",
      enabled: true,
      order: 4,
      name: "Валентина Забеліна",
      description: "Команда проєкту Löwen Defence Україна.",
      image: {
        url: "/team/valentyna-zabelina.jpg",
        alt: "Валентина Забеліна",
        focalX: 50,
        focalY: 30
      }
    },
    {
      id: "team-5",
      enabled: true,
      order: 5,
      name: "Анна Скотинянська",
      description: "Команда проєкту Löwen Defence Україна.",
      image: {
        url: "/team/anna-skotynianska.jpg",
        alt: "Анна Скотинянська",
        focalX: 50,
        focalY: 30
      }
    }
  ],
  contacts: {
    phoneDisplay: "+38 097 170 20 78",
    phoneHref: "tel:+380971702078",
    email: "office@esosh.net",
    websiteDisplay: "www.esosh.net",
    websiteUrl: "https://www.esosh.net",
    germanWebsiteUrl: "https://www.loewen-defence.de",
    privacyUrl: "/privacy"
  }
};
