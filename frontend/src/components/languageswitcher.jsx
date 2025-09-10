// src/components/LanguageSwitcher.jsx
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh";

  const toggle = () => {
    const next = isZh ? "en" : "zh";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next); // 记住选择
  };

  return (
    <button
      onClick={toggle}
       style={{
        border: "1px solid #ff6600",
        padding: "4px 12px",
        borderRadius: "20px",
        background: "#fff",
        color: "#ff6600",
        fontWeight: "bold",
        cursor: "pointer",
        marginLeft: "10px"
      }}
      title={isZh ? "Switch to English" : "切换到中文"}
    >
      {isZh ? "EN" : "中"}
    </button>
  );
}
