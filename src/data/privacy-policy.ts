/**
 * privacy-policy.ts — Політика конфіденційності (uk + en для публічної модалки)
 * URL сайту — константа SITE_PRIVACY_URL; змінити після підключення домену.
 */
import type { Locale } from "@/lib/i18n/locale";

/** Публічна адреса сайту в тексті Політики (потім замінити на прод-домен). */
export const SITE_PRIVACY_URL = "https://lowen-defence.vercel.app/";

export type PrivacySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
};

export type PrivacyPolicyContent = {
  meta: {
    title: string;
    effectiveDate: string;
    brandLine: string;
  };
  intro: string[];
  sections: PrivacySection[];
};

const privacyUk: PrivacyPolicyContent = {
  meta: {
    title: "Політика конфіденційності та захисту персональних даних",
    effectiveDate: "23 липня 2026 року",
    brandLine: "Löwen Defence® Україна («Захист Лева»)",
  },
  intro: [
    `Ця Політика конфіденційності та захисту персональних даних (далі — «Політика») визначає порядок збору, обробки, зберігання та захисту персональних даних користувачів вебсайту ${SITE_PRIVACY_URL} (далі — «Сайт»).`,
    "Політика розроблена відповідно до Закону України «Про захист персональних даних» № 2297-VI, інших нормативно-правових актів України, а також з урахуванням загальних принципів європейського регулювання захисту даних (GDPR).",
  ],
  sections: [
    {
      title: "1. Володілець персональних даних",
      paragraphs: [
        "Володільцем та розпорядником персональних даних користувачів Сайту є:",
      ],
      bullets: [
        "Повна назва: ГРОМАДСЬКА СПІЛКА «ЄВРОПЕЙСЬКЕ СПІВТОВАРИСТВО З ОХОРОНИ ПРАЦІ»",
        "Назва англійською мовою: “EUROPEAN SOCIETY OF OCCUPATIONAL SAFETY HEALS”",
        "Код ЄДРПОУ: 42755196",
        "Юридична адреса: 04107, Україна, місто Київ, вулиця Татарська, будинок 21, літера А",
        "Керівник: Богданова Ольга Віталіївна",
        "Контактний e-mail з питань обробки даних: office@esosh.net",
      ],
    },
    {
      title: "2. Склад та обсяг персональних даних, що збираються",
      paragraphs: [
        "2.1. Спілка збирає та обробляє лише ті персональні дані, які користувач добровільно надає під час заповнення онлайн-форм зворотного зв’язку та заявок на курси/тренінги на Сайті. До таких даних належать:",
      ],
      bullets: [
        "ім’я користувача;",
        "контактний номер телефону;",
        "відомості про обраний курс (ідентифікатор та назва курсу);",
        "текстовий коментар або інша інформація, яку користувач самостійно вказав у формі.",
      ],
    },
    {
      title: "2.2. Дані, які не збираються через публічні форми",
      bullets: [
        "Сайт не запитує та не збирає адреси електронної пошти відвідувачів у формах заявок;",
        "на Сайті відсутні модулі онлайн-оплати, тому збір платіжних даних, реквізитів банківських карток або фінансової інформації не здійснюється;",
        "Сайт не збирає спеціальні (чутливі) категорії персональних даних (про расове чи етнічне походження, політичні погляди, релігійні переконання, стан здоров’я тощо).",
      ],
    },
    {
      title: "2.3. Технічні дані та метадані",
      paragraphs: [
        "Під час відвідування Сайту хостингова інфраструктура (зокрема Vercel) може автоматично фіксувати технічні серверні логи (IP-адресу, тип браузера, дату й час запиту). Такі дані використовуються виключно для забезпечення технічної стабільності та безпеки веб-ресурсу.",
      ],
    },
    {
      title: "3. Файли cookie та сервіси аналітики",
      paragraphs: [
        "3.1. Для звичайних відвідувачів Сайту маркетингові, трекінгові або аналітичні файли cookie не використовуються. На Сайті відсутні сторонні пікселі відстеження (зокрема Facebook Pixel) та зовнішні системи веб-аналітики (зокрема Google Analytics).",
        "3.2. Для авторизованих адміністраторів Сайту використовується технічний файл cookie ld_admin_token (HttpOnly, строк дії близько 12 годин), необхідний виключно для захищеної сесії доступу до панелі управління /admin.",
        "3.3. Для збереження мови інтерфейсу публічного сайту може використовуватися технічний cookie ld_locale (uk|en).",
      ],
    },
    {
      title: "4. Мета та цілі обробки персональних даних",
      paragraphs: [
        "Персональні дані обробляються виключно для таких цілей:",
      ],
      bullets: [
        "надання інформації щодо діяльності Спілки та проєкту Löwen Defence® Україна;",
        "забезпечення зворотного зв’язку та консультування користувачів за їхнім запитом;",
        "обробка заявок на участь у навчальних курсах і тренінгах та узгодження деталей організації навчання;",
        "реалізація статутних завдань Громадської спілки «Європейське співтовариство з охорони праці» (КВЕД 94.99).",
      ],
      note: "Спілка не використовує персональні дані для розсилки спаму, маркетингового аналізу чи рекламних кампаній.",
    },
    {
      title: "5. Правові підстави обробки",
      paragraphs: ["Обробка персональних даних здійснюється на підставі:"],
      bullets: [
        "згоди суб’єкта персональних даних (ст. 6 Закону України «Про захист персональних даних»), яка надається шляхом встановлення відповідної позначки (чекбоксу) у формі надсилання даних на Сайті;",
        "необхідності виконання дій на запит суб’єкта даних (обробка звернення / заявки на навчання з ініціативи користувача).",
      ],
    },
    {
      title: "6. Передача даних третім особам та залучення обробників",
      paragraphs: [
        "6.1. Спілка не продає, не передає та не розголошує персональні дані користувачів у комерційних чи маркетингових цілях третім особам.",
        "6.2. Для технічного забезпечення роботи Сайту та зберігання заявок можуть залучатися інфраструктурні обробники, зокрема сервіси Vercel (хостинг) та Vercel Blob (захищене сховище даних заявок і контенту). Обробка здійснюється в обсязі, необхідному для роботи Сайту.",
        "6.3. Для службових сповіщень про нові заявки на офіційну електронну пошту Спілки (office@esosh.net) можуть залучатися спеціалізовані сервіси транзакційної електронної пошти (зокрема Brevo / Sendinblue). У такому разі сервіс діє як технічний обробник (processor) виключно в межах пересилання вмісту заявки (ім’я, телефон, обраний курс, коментар).",
        "6.4. Передача даних державним органам України можлива виключно у випадках, прямо передбачених чинним законодавством України.",
      ],
    },
    {
      title: "7. Строк зберігання даних",
      paragraphs: [
        "Персональні дані зберігаються протягом строку, необхідного для досягнення цілей їхньої обробки (обробка заявки, проведення консультації, узгодження деталей курсу), але не довше, ніж цього вимагає чинне законодавство, або до моменту відкликання згоди користувачем (якщо інше не передбачено законом).",
      ],
    },
    {
      title: "8. Права суб’єкта персональних даних",
      paragraphs: [
        "Відповідно до статті 8 Закону України «Про захист персональних даних» Ви маєте право, зокрема:",
      ],
      bullets: [
        "знати про джерела збирання, місцезнаходження своїх персональних даних, мету їхньої обробки;",
        "отримувати інформацію про умови надання доступу до персональних даних;",
        "на доступ до своїх персональних даних;",
        "пред’являти вмотивовану вимогу щодо зміни або знищення своїх персональних даних, якщо вони обробляються незаконно чи є недостовірними;",
        "на захист своїх персональних даних від незаконної обробки та випадкової втрати, знищення, пошкодження;",
        "відкликати згоду на обробку персональних даних у будь-який момент.",
      ],
      note: "Для реалізації своїх прав надішліть запит на електронну адресу: office@esosh.net.",
    },
    {
      title: "9. Внесення змін до Політики",
      paragraphs: [
        "Спілка залишає за собою право вносити зміни до цієї Політики у разі зміни функціоналу Сайту або вимог законодавства. Нова редакція Політики набирає чинності з моменту її опублікування на Сайті.",
      ],
    },
  ],
};

const privacyEn: PrivacyPolicyContent = {
  meta: {
    title: "Privacy Policy and Personal Data Protection",
    effectiveDate: "23 July 2026",
    brandLine: "Löwen Defence® Ukraine (“Lion Defence”)",
  },
  intro: [
    `This Privacy Policy and Personal Data Protection notice (the “Policy”) describes how personal data of users of the website ${SITE_PRIVACY_URL} (the “Site”) is collected, processed, stored and protected.`,
    "The Policy is prepared in accordance with the Law of Ukraine “On Personal Data Protection” No. 2297-VI and other applicable Ukrainian law, and takes into account general principles of European data protection regulation (GDPR).",
  ],
  sections: [
    {
      title: "1. Data controller",
      paragraphs: [
        "The controller and processor of personal data of Site users is:",
      ],
      bullets: [
        "Full name: PUBLIC UNION “EUROPEAN SOCIETY OF OCCUPATIONAL SAFETY HEALS”",
        "English name: “EUROPEAN SOCIETY OF OCCUPATIONAL SAFETY HEALS”",
        "EDRPOU code: 42755196",
        "Legal address: 04107, Ukraine, Kyiv, Tatarska Street 21, letter A",
        "Director: Olga Bohdanova",
        "Contact e-mail for data processing questions: office@esosh.net",
      ],
    },
    {
      title: "2. Categories and scope of personal data collected",
      paragraphs: [
        "2.1. The Union collects and processes only personal data that the user voluntarily provides when filling in online contact forms and course/training requests on the Site. Such data may include:",
      ],
      bullets: [
        "user name;",
        "contact phone number;",
        "information about the selected course (course id and title);",
        "a text comment or other information the user enters in the form.",
      ],
    },
    {
      title: "2.2. Data not collected via public forms",
      bullets: [
        "The Site does not request or collect visitors’ e-mail addresses in application forms;",
        "there are no online payment modules on the Site, so payment data, card details or financial information are not collected;",
        "the Site does not collect special (sensitive) categories of personal data (racial or ethnic origin, political opinions, religious beliefs, health data, etc.).",
      ],
    },
    {
      title: "2.3. Technical data and metadata",
      paragraphs: [
        "When you visit the Site, hosting infrastructure (including Vercel) may automatically record technical server logs (IP address, browser type, date and time of the request). Such data is used solely to maintain technical stability and security of the web resource.",
      ],
    },
    {
      title: "3. Cookies and analytics",
      paragraphs: [
        "3.1. For ordinary Site visitors, marketing, tracking or analytics cookies are not used. The Site has no third-party tracking pixels (including Facebook Pixel) and no external web analytics systems (including Google Analytics).",
        "3.2. For authorised Site administrators, a technical cookie ld_admin_token is used (HttpOnly, about 12 hours), required solely for a protected session to the /admin control panel.",
        "3.3. A technical cookie ld_locale (uk|en) may be used to remember the public site interface language.",
      ],
    },
    {
      title: "4. Purposes of processing",
      paragraphs: ["Personal data is processed solely for the following purposes:"],
      bullets: [
        "providing information about the Union’s activities and the Löwen Defence® Ukraine project;",
        "providing feedback and consulting users upon their request;",
        "processing applications for training courses and agreeing organisational details;",
        "carrying out the statutory tasks of the Public Union “European Society of Occupational Safety Heals” (NACE 94.99).",
      ],
      note: "The Union does not use personal data for spam, marketing analysis or advertising campaigns.",
    },
    {
      title: "5. Legal bases for processing",
      paragraphs: ["Personal data is processed on the basis of:"],
      bullets: [
        "consent of the data subject (Art. 6 of the Law of Ukraine “On Personal Data Protection”), given by ticking the relevant checkbox in the Site form;",
        "the need to take steps at the request of the data subject (handling an enquiry / training application initiated by the user).",
      ],
    },
    {
      title: "6. Sharing with third parties and processors",
      paragraphs: [
        "6.1. The Union does not sell, transfer or disclose users’ personal data for commercial or marketing purposes to third parties.",
        "6.2. Infrastructure processors may be engaged to run the Site and store applications, including Vercel (hosting) and Vercel Blob (secure storage of applications and content). Processing is limited to what is necessary for Site operation.",
        "6.3. Transactional e-mail services (including Brevo / Sendinblue) may be used for internal notifications about new applications to office@esosh.net. In that case the service acts as a technical processor solely for forwarding application content (name, phone, selected course, comment).",
        "6.4. Disclosure to Ukrainian public authorities is possible only where expressly required by applicable Ukrainian law.",
      ],
    },
    {
      title: "7. Retention period",
      paragraphs: [
        "Personal data is stored for as long as needed to achieve the processing purposes (handling the application, consultation, agreeing course details), but no longer than required by applicable law, or until consent is withdrawn (unless otherwise required by law).",
      ],
    },
    {
      title: "8. Rights of the data subject",
      paragraphs: [
        "Under Article 8 of the Law of Ukraine “On Personal Data Protection” you have the right, in particular, to:",
      ],
      bullets: [
        "know the sources of collection, location of your personal data and the purpose of processing;",
        "receive information about the conditions of access to personal data;",
        "access your personal data;",
        "submit a reasoned request to change or destroy your personal data if it is processed unlawfully or is inaccurate;",
        "protect your personal data against unlawful processing and accidental loss, destruction or damage;",
        "withdraw consent to processing at any time.",
      ],
      note: "To exercise your rights, send a request to: office@esosh.net.",
    },
    {
      title: "9. Changes to this Policy",
      paragraphs: [
        "The Union may update this Policy if the Site functionality or legal requirements change. The new version takes effect when published on the Site.",
      ],
    },
  ],
};

/** Повертає текст Політики для локалі (en з повним перекладом UI/змісту). */
export function getPrivacyPolicy(locale: Locale): PrivacyPolicyContent {
  return locale === "en" ? privacyEn : privacyUk;
}

/** @deprecated — сумістність імпортів; використовуйте getPrivacyPolicy. */
export const privacyPolicyMeta = privacyUk.meta;
/** @deprecated — сумістність імпортів; використовуйте getPrivacyPolicy. */
export const privacyPolicySections = privacyUk.sections;
