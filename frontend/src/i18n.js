// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./i18n/zh.json";
import en from "./i18n/en.json";

const stored = localStorage.getItem("lang");
const defaultLng = stored ? stored : "en"; 

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en }
    },
    lng: defaultLng,
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
