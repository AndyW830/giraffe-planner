import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './languageswitcher';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation();
  return (
    <header>
      <ul>
        <li><Link to="#" onClick={e => e.preventDefault()}>{t("header.about")}</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>{t("header.contact")}</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>{t("header.feedback")}</Link></li>
        <li><LanguageSwitcher /></li>
      </ul>
    </header>
  );
}


function Header_welcome() {
  const { t } = useTranslation();
  return (
    <header>
      <ul>
        <li><Link to="#" onClick={e => e.preventDefault()}>{t("header.about")}</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>{t("header.contact")}</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>{t("header.feedback")}</Link></li>
        <li><LanguageSwitcher /></li>
      </ul>
      <h1 className="Welcome">{t("Welcome")}</h1>
    </header>
  );
}


export default Header;
export { Header_welcome }; // Export Header_welcome for use in other components
