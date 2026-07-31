/**
 * dictionary.ts — статичні рядки публічного UI (uk + en)
 */
import type { Locale } from "./locale";

const uk = {
  brand: {
    tagline: "Захист Лева · Україна",
    footerName: "Löwen Defence® Україна",
    copyright: "Löwen Defence Україна",
  },
  header: {
    navLabel: "Головна навігація",
    courses: "Курси",
    method: "Методика",
    business: "Для організацій",
    team: "Команда",
    germanSite: "Німецький сайт",
    germanSiteTitle: "Перейти на німецький сайт",
    contact: "Контакти",
    adminTitle: "Адмін-панель",
    openMenu: "Відкрити меню",
    closeMenu: "Закрити меню",
    brandAria: "Löwen Defence Україна",
  },
  lang: {
    switchLabel: "Мова сайту",
    uk: "UA",
    en: "EN",
  },
  hero: {
    eyebrow: "Німецька методика · українська команда",
    titleBefore: "Створюємо обізнаність,",
    titleAccent: "не викликаючи страху",
    lead:
      "Практичні курси безпечної поведінки, впевненості, деескалації та самозахисту для дітей, підлітків, жінок, батьків, закладів освіти й компаній.",
    ctaCourses: "Обрати курс",
    ctaTraining: "Запросити тренінг",
    shieldAria: "Коротко про програму",
    statGroupValue: "До 14 осіб",
    statGroupLabel: "у групі",
    statPracticeValue: "Практика",
    statPracticeLabel: "сценарії й вправи",
    ageBadge: "Вік: 5+ років",
    shieldTitle: "Навички безпеки з дитинства",
    shieldText:
      "Навчаємо розпізнавати ризики, діяти впевнено, звертатися по допомогу та захищати себе у зрозумілій і доброзичливій",
    shieldTextLine: "формі.",
  },
  trust: {
    items: [
      "Без залякування",
      "Адаптовано за віком",
      "Навчені тренери",
      "Сертифікат учасника",
    ],
  },
  why: {
    eyebrow: "Навіщо це потрібно",
    title: "Безпечна поведінка — навичка, яку можна тренувати",
    lead:
      "Небезпечні ситуації можуть виникати в школі, громадському транспорті, дорогою додому, у клубі, дитячому таборі або на майданчику. Підготовка допомагає не завмерти, а обрати правильну дію.",
    imageAlt: "Практичне заняття для дітей",
    quote:
      "Мета курсу — щоб дитина пішла додому сильнішою, впевненішою та в гарному настрої.",
    risks: [
      {
        title: "Булінг і тиск",
        desc: "Впевнена постава, голос, кордони та алгоритм звернення по допомогу.",
      },
      {
        title: "Небезпечний контакт",
        desc: "Дистанція, оцінка ситуації, відмова, привернення уваги та безпечний вихід.",
      },
      {
        title: "Переслідування",
        desc: "Куди бігти, кому повідомити, як діяти у публічному просторі.",
      },
      {
        title: "Напад",
        desc: "Прості й ефективні техніки самозахисту лише тоді, коли уникнути небезпеки не вдалося.",
      },
    ],
  },
  courses: {
    eyebrow: "Програми",
    title: "Курси для різних ситуацій і віку",
    lead:
      "Оберіть готовий формат або замовте індивідуальну програму для школи, громади чи організації.",
    defaultButton: "Записатися",
    discount:
      "Пакетна пропозиція: від трьох тренінгів — знижка 10%.",
    discountCta: "Дізнатися деталі →",
    packageTitle: "Пакетна пропозиція (від 3 тренінгів)",
  },
  method: {
    eyebrow: "Методика Löwen Defence",
    title: "Від усвідомлення ризику — до впевненої дії",
    lead:
      "Курс не будується навколо страху чи агресії. Учасники тренують послідовність дій, яку можуть пригадати в реальній ситуації.",
    imageAlt: "Практична вправа на курсі",
    badge: "Важка тема — у безпечній і підтримувальній атмосфері.",
    steps: [
      {
        num: "01",
        title: "Помітити",
        desc: "Розпізнати тривожні сигнали, почути власну інтуїцію та оцінити простір.",
      },
      {
        num: "02",
        title: "Позначити кордон",
        desc: "Використати голос, дистанцію, впевнену позу та чітке «ні».",
      },
      {
        num: "03",
        title: "Вийти з ситуації",
        desc: "Знати, куди бігти, як привернути увагу та до кого звернутися.",
      },
      {
        num: "04",
        title: "Захиститися",
        desc: "Застосувати прості техніки самозахисту, адаптовані до віку й фізичних можливостей.",
      },
    ],
  },
  business: {
    eyebrow: "Для бізнесу та організацій",
    title: "Корпоративний тренінг «Безпекова обізнаність»",
    lead:
      "Працівники, які контактують з клієнтами та відвідувачами, можуть стикатися з образами, погрозами, агресією або нападом. Навчання поєднує комунікацію, деескалацію, правила поведінки у небезпеці та практичний самозахист.",
    cta: "Отримати пропозицію",
    imageAlt: "Корпоративне навчання Löwen Defence",
    blocks: [
      "Розмова з агресивним співрозмовником",
      "Деескалація замість конфронтації",
      "Дії при погрозі або нападі",
      "Практичні сценарії для вашої організації",
    ],
  },
  standards: {
    eyebrow: "Стандарти тренерів",
    title: "Довіра починається з якості підготовки",
    lead:
      "Фелікс Тимченко особисто бере участь у підготовці тренерського складу, щоб забезпечити єдині стандарти, практичність і безпечну взаємодію з учасниками.",
    items: [
      {
        num: "01",
        title: "Навчання методиці",
        desc: "Кожен тренер проходить підготовку Löwen Defence.",
      },
      {
        num: "02",
        title: "Бездоганна репутація",
        desc: "До роботи допускаються лише перевірені фахівці.",
      },
      {
        num: "03",
        title: "Досвід з дітьми",
        desc: "Важливі не лише техніки, а й педагогічна взаємодія.",
      },
      {
        num: "04",
        title: "Постійний розвиток",
        desc: "Тренери регулярно вдосконалюють навички й методику.",
      },
    ],
  },
  team: {
    eyebrow: "Команда",
    title: "Löwen Defence Україна",
    lead:
      "Міжнародна експертиза, українське партнерство та спільна мета — навчати безпеки так, щоб люди ставали сильнішими, а не наляканими.",
  },
  faq: {
    eyebrow: "Поширені питання",
    title: "Перед записом на курс",
    lead:
      "Формат можна адаптувати до віку, групи, місця проведення та запиту організації.",
    items: [
      {
        q: "Чи не налякає курс дитину?",
        a: "Ні. Методика спеціально побудована так, щоб створювати обізнаність без залякування. Є місце для гумору, руху та позитивних емоцій.",
      },
      {
        q: "Чи навчаєте ви дітей битися?",
        a: "Основний акцент — на розпізнаванні ризику, комунікації, дистанції, деескалації та виході з небезпечної ситуації. Самозахист — лише одна з частин програми.",
      },
      {
        q: "Чи можна запросити тренерів до школи або компанії?",
        a: "Так. Команда проводить виїзні курси та адаптує сценарії до потреб закладу, громади чи підприємства.",
      },
      {
        q: "Що отримують учасники після курсу?",
        a: "Кожен учасник отримує сертифікат, а головне — практичні алгоритми й досвід безпечного реагування.",
      },
    ],
  },
  contact: {
    eyebrow: "Зв’язатися",
    title: "Проведемо курс для вашої групи",
    lead:
      "Залиште заявку: допоможемо обрати формат, погодимо вік учасників, тривалість, місце проведення та вартість.",
    name: "Ім’я",
    phone: "Телефон",
    namePlaceholder: "Ваше ім’я",
    phonePlaceholder: "+380...",
    courseLabel: "Який курс цікавить?",
    coursePlaceholder: "-- Оберіть програму або тренінг --",
    corporateOption:
      "Корпоративний тренінг «Безпекова обізнаність» (для компаній)",
    customOption: "Індивідуальний запит / Консультація",
    comment: "Коментар",
    commentPlaceholder:
      "Місто, орієнтовна кількість учасників, бажана дата",
    consentBefore: "Я погоджуюся на обробку моїх персональних даних відповідно до",
    consentLink: "Політики конфіденційності",
    submit: "Надіслати заявку",
    submitting: "Надсилання...",
    successTitle: "Заявку отримано!",
    successText:
      "Дякуємо за звернення. Ми зв’яжемося з вами найближчим часом для узгодження деталей проведення курсу.",
    sendAnother: "Надіслати ще одну заявку",
    errRequired: "Будь ласка, заповніть обов'язкові поля: Ім'я та Телефон.",
    errConsent:
      "Будь ласка, підтвердьте згоду на обробку персональних даних.",
    errSubmit: "Не вдалося надіслати заявку. Спробуйте ще раз.",
    errNetwork:
      "Не вдалося надіслати заявку. Спробуйте ще раз або зв'яжіться телефоном.",
  },
  footer: {
    courses: "Курси",
    team: "Команда",
    contact: "Контакти",
    germanSite: "Німецький сайт",
    privacy: "Політика конфіденційності",
  },
  privacy: {
    modalTitle: "Політика конфіденційності",
    close: "Закрити",
    ok: "Зрозуміло",
    websiteLabel: "Вебсайт",
    effectiveLabel: "Дата набрання чинності:",
  },
};

export type Dictionary = typeof uk;

const en: Dictionary = {
  brand: {
    tagline: "Lion Defence · Ukraine",
    footerName: "Löwen Defence® Ukraine",
    copyright: "Löwen Defence Ukraine",
  },
  header: {
    navLabel: "Main navigation",
    courses: "Courses",
    method: "Method",
    business: "For organisations",
    team: "Team",
    germanSite: "German website",
    germanSiteTitle: "Open the German website",
    contact: "Contact",
    adminTitle: "Admin panel",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    brandAria: "Löwen Defence Ukraine",
  },
  lang: {
    switchLabel: "Site language",
    uk: "UA",
    en: "EN",
  },
  hero: {
    eyebrow: "German method · Ukrainian team",
    titleBefore: "We build awareness",
    titleAccent: "without creating fear",
    lead:
      "Practical courses in safe behaviour, confidence, de-escalation and self-defence for children, teens, women, parents, schools and companies.",
    ctaCourses: "Choose a course",
    ctaTraining: "Request a training",
    shieldAria: "Program at a glance",
    statGroupValue: "Up to 14 people",
    statGroupLabel: "per group",
    statPracticeValue: "Practice",
    statPracticeLabel: "scenarios & drills",
    ageBadge: "Age: 5+",
    shieldTitle: "Safety skills from childhood",
    shieldText:
      "We teach how to recognise risks, act confidently, ask for help and protect yourself in a clear and supportive",
    shieldTextLine: "way.",
  },
  trust: {
    items: [
      "No scare tactics",
      "Age-adapted",
      "Trained instructors",
      "Participant certificate",
    ],
  },
  why: {
    eyebrow: "Why it matters",
    title: "Safe behaviour is a skill you can train",
    lead:
      "Risky situations can happen at school, on public transport, on the way home, at a club, camp or playground. Preparation helps you act — not freeze.",
    imageAlt: "Practical session for children",
    quote:
      "The goal is for a child to go home stronger, more confident and in a good mood.",
    risks: [
      {
        title: "Bullying and pressure",
        desc: "Confident posture, voice, boundaries and a clear help-seeking plan.",
      },
      {
        title: "Unsafe contact",
        desc: "Distance, situation assessment, refusal, attracting attention and a safe exit.",
      },
      {
        title: "Being followed",
        desc: "Where to run, whom to tell, how to act in public space.",
      },
      {
        title: "Assault",
        desc: "Simple, effective self-defence only when avoiding danger is no longer possible.",
      },
    ],
  },
  courses: {
    eyebrow: "Programs",
    title: "Courses for different ages and situations",
    lead:
      "Choose a ready-made format or request a custom program for a school, community or organisation.",
    defaultButton: "Sign up",
    discount: "Package offer: 10% off from three trainings.",
    discountCta: "Learn more →",
    packageTitle: "Package offer (from 3 trainings)",
  },
  method: {
    eyebrow: "Löwen Defence method",
    title: "From risk awareness to confident action",
    lead:
      "The course is not built around fear or aggression. Participants practise a sequence of actions they can recall in a real situation.",
    imageAlt: "Practical exercise on a course",
    badge: "A serious topic — in a safe, supportive atmosphere.",
    steps: [
      {
        num: "01",
        title: "Notice",
        desc: "Recognise warning signs, trust intuition and assess the space.",
      },
      {
        num: "02",
        title: "Set a boundary",
        desc: "Use voice, distance, confident posture and a clear “no”.",
      },
      {
        num: "03",
        title: "Leave the situation",
        desc: "Know where to run, how to attract attention and whom to ask for help.",
      },
      {
        num: "04",
        title: "Protect yourself",
        desc: "Apply simple self-defence techniques adapted to age and physical ability.",
      },
    ],
  },
  business: {
    eyebrow: "For business and organisations",
    title: "Corporate training “Safety awareness”",
    lead:
      "Staff who interact with clients and visitors may face insults, threats, aggression or assault. Training combines communication, de-escalation, safety rules and practical self-defence.",
    cta: "Get a proposal",
    imageAlt: "Corporate training by Löwen Defence",
    blocks: [
      "Talking to an aggressive counterpart",
      "De-escalation instead of confrontation",
      "Actions under threat or attack",
      "Practical scenarios for your organisation",
    ],
  },
  standards: {
    eyebrow: "Trainer standards",
    title: "Trust starts with quality of training",
    lead:
      "Felix Tymchenko personally takes part in preparing the coaching team to ensure shared standards, practical focus and safe interaction with participants.",
    items: [
      {
        num: "01",
        title: "Method training",
        desc: "Every trainer completes Löwen Defence preparation.",
      },
      {
        num: "02",
        title: "Strong reputation",
        desc: "Only vetted professionals are allowed to teach.",
      },
      {
        num: "03",
        title: "Experience with children",
        desc: "Techniques matter — and so does pedagogical interaction.",
      },
      {
        num: "04",
        title: "Continuous development",
        desc: "Trainers regularly improve skills and methodology.",
      },
    ],
  },
  team: {
    eyebrow: "Team",
    title: "Löwen Defence Ukraine",
    lead:
      "International expertise, Ukrainian partnership and a shared goal — teaching safety so people become stronger, not frightened.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Before you book a course",
    lead:
      "The format can be adapted to age, group size, venue and organisation needs.",
    items: [
      {
        q: "Will the course scare my child?",
        a: "No. The method is designed to build awareness without intimidation. There is room for humour, movement and positive emotion.",
      },
      {
        q: "Do you teach children to fight?",
        a: "The focus is on risk recognition, communication, distance, de-escalation and leaving a dangerous situation. Self-defence is only one part of the program.",
      },
      {
        q: "Can you come to a school or company?",
        a: "Yes. The team runs on-site courses and adapts scenarios to the needs of a school, community or business.",
      },
      {
        q: "What do participants receive after the course?",
        a: "Every participant receives a certificate — and, more importantly, practical algorithms and experience of safe response.",
      },
    ],
  },
  contact: {
    eyebrow: "Get in touch",
    title: "We’ll run a course for your group",
    lead:
      "Leave a request: we’ll help choose the format and agree on age group, duration, venue and pricing.",
    name: "Name",
    phone: "Phone",
    namePlaceholder: "Your name",
    phonePlaceholder: "+380...",
    courseLabel: "Which course interests you?",
    coursePlaceholder: "-- Choose a program or training --",
    corporateOption:
      "Corporate training “Safety awareness” (for companies)",
    customOption: "Custom request / Consultation",
    comment: "Comment",
    commentPlaceholder: "City, approx. group size, preferred date",
    consentBefore:
      "I agree to the processing of my personal data in accordance with the",
    consentLink: "Privacy Policy",
    submit: "Send request",
    submitting: "Sending...",
    successTitle: "Request received!",
    successText:
      "Thank you for reaching out. We will contact you shortly to arrange the course details.",
    sendAnother: "Send another request",
    errRequired: "Please fill in the required fields: Name and Phone.",
    errConsent: "Please confirm consent to personal data processing.",
    errSubmit: "Could not send the request. Please try again.",
    errNetwork:
      "Could not send the request. Please try again or call us.",
  },
  footer: {
    courses: "Courses",
    team: "Team",
    contact: "Contact",
    germanSite: "German website",
    privacy: "Privacy policy",
  },
  privacy: {
    modalTitle: "Privacy policy",
    close: "Close",
    ok: "Got it",
    websiteLabel: "Website",
    effectiveLabel: "Effective date:",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { uk, en };

/** Повертає словник для локалі. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.uk;
}
