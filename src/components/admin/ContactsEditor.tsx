import React from "react";
import { Contacts } from "../../types/content";
import { Phone, Mail, Globe, ExternalLink } from "lucide-react";

interface ContactsEditorProps {
  contacts: Contacts;
  onChange: (updatedContacts: Contacts) => void;
}

export const ContactsEditor: React.FC<ContactsEditorProps> = ({
  contacts,
  onChange,
}) => {
  const handleChange = (field: keyof Contacts, value: string) => {
    onChange({ ...contacts, [field]: value });
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
      <div className="pb-3 border-b border-gray-200">
        <h3 className="font-black text-lg text-[#082d20]">Контактна інформація</h3>
        <p className="text-xs text-[#64726a] mt-1">
          Зміни тут автоматично оновляться у шапці, футері та формі запису на сайті.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#1b7048]" />
            <span>Відображуваний телефон</span>
          </label>
          <input
            type="text"
            value={contacts.phoneDisplay}
            onChange={(e) => handleChange("phoneDisplay", e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-bold"
            placeholder="+38 097 170 20 78"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#1b7048]" />
            <span>Посилання tel:</span>
          </label>
          <input
            type="text"
            value={contacts.phoneHref}
            onChange={(e) => handleChange("phoneHref", e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
            placeholder="tel:+380971702078"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-[#1b7048]" />
            <span>Електронна пошта</span>
          </label>
          <input
            type="email"
            value={contacts.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-bold"
            placeholder="office@esosh.net"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#1b7048]" />
            <span>Відображуваний сайт</span>
          </label>
          <input
            type="text"
            value={contacts.websiteDisplay}
            onChange={(e) => handleChange("websiteDisplay", e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
            placeholder="www.esosh.net"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#1b7048]" />
            <span>Повний URL сайту</span>
          </label>
          <input
            type="url"
            value={contacts.websiteUrl}
            onChange={(e) => handleChange("websiteUrl", e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
            placeholder="https://www.esosh.net"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#082d20] mb-1 flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-[#1b7048]" />
            <span>Німецький сайт (Löwen Defence DE)</span>
          </label>
          <input
            type="url"
            value={contacts.germanWebsiteUrl}
            onChange={(e) => handleChange("germanWebsiteUrl", e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
            placeholder="https://www.loewen-defence.de"
          />
        </div>
      </div>
    </div>
  );
};
