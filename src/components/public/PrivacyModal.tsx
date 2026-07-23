import React from "react";
import { X, ShieldCheck } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#dbe5dd]">
        <div className="px-6 py-5 bg-[#082d20] text-white flex items-center justify-between border-b border-[#13563a]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#ffd51f]" />
            <h3 className="text-lg font-black tracking-wide text-white m-0">
              Політика конфіденційності
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#13241c] leading-relaxed">
          <p className="font-extrabold text-[#082d20]">
            Löwen Defence® Україна («Захист Лева»)
          </p>
          <p>
            Ця Політика конфіденційності пояснює, як ми збираємо, використовуємо та
            захищаємо персональні дані, які ви надаєте при заповненні заявки на
            нашому сайті.
          </p>

          <h4 className="font-extrabold text-[#0d3f2c] pt-2">
            1. Збір та категорія даних
          </h4>
          <p>
            Ми збираємо лише ті дані, які ви добровільно надаєте у формі зв’язку:
            ім’я, контактний номер телефону, обрану програму курсу та ваш
            коментар.
          </p>

          <h4 className="font-extrabold text-[#0d3f2c] pt-2">
            2. Мета обробки даних
          </h4>
          <p>
            Ваші дані використовуються виключно для зворотного зв’язку, узгодження
            деталей проведення тренінгу, відповіді на ваші запитання та підтвердження
            запису.
          </p>

          <h4 className="font-extrabold text-[#0d3f2c] pt-2">
            3. Захист та передача даним
          </h4>
          <p>
            Ми не передаємо ваші персональні дані третім особам, не використовуємо їх
            для спаму та не продаємо рекламним мережам. Усі отримані заявки зберігаються
            в захищеному серверному середовищі.
          </p>

          <h4 className="font-extrabold text-[#0d3f2c] pt-2">
            4. Ваші права
          </h4>
          <p>
            Ви маєте право в будь-який момент запросити видалення або уточнення ваших
            персональних даних, звернувшись за електронною адресою{" "}
            <a
              href="mailto:office@esosh.net"
              className="text-[#1b7048] font-bold underline"
            >
              office@esosh.net
            </a>
            .
          </p>
        </div>

        <div className="p-4 bg-[#f7f3e9] border-t border-[#dbe5dd] flex justify-end">
          <button onClick={onClose} className="btn btn-dark text-sm py-2 px-6">
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
