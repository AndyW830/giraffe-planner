import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function Sidebar() {
  const { t } = useTranslation();
  return (
    <nav className="sidebar">
      <h2><Link to={"/"}>{t("sidebar.giraffePlanner")}</Link></h2>
      <ul>
        <li><Link to={"/"}>{t("sidebar.home")}</Link></li>
        <li><Link to="/plan">{t("sidebar.plan")}</Link></li>
        <li><Link to="/daily-tasks">{t("sidebar.checkin")}</Link></li>
        <li><Link to="/stats">{t("sidebar.stats")}</Link></li>
        <li><Link to="/porodomo">{t("sidebar.pomodoro")}</Link></li>
        <li><Link to="/buddy">{t("sidebar.studyBuddy")}</Link></li>
      </ul>
    </nav>
  );
}

export default Sidebar;
