import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer>
        <p>{t("footer.copyright")}</p>
      </footer>
  );
}
export default Footer;
export { Footer }; // Export Footer for use in other components