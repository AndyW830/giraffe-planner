import { useTranslation } from "react-i18next";
function OverviewCards({total_tasks, completed_tasks, streak_days}) {
  const { t } = useTranslation();
    return (
        <section className="summary-panel">
        <div className="summary-card">
          <h2>{total_tasks}</h2>
          <p>{t("overviewcards.totalTasks")}</p>
        </div>
        <div className="summary-card">
          <h2>{completed_tasks}</h2>
          <p>{t("overviewcards.completedTasks")}</p>
        </div>
        <div className="summary-card">
          <h2>{streak_days} {t("overviewcards.day")}</h2>
          <p>{t("overviewcards.streak")}</p>
        </div>
      </section>
    );
}

export default OverviewCards;