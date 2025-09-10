import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

function TaskCard({ text ,completed, onTaskClick,deadline }) {
    const { t } = useTranslation();
    const icon=completed ? "✅":"❗";
    const deadline_dayjs = dayjs(deadline);
  return (
    <div className={completed ?"task-card completed":"task-card"}>
      <span>{icon} {text}  {t("taskcard.jiezhi")}{deadline_dayjs.format('YYYY-MM-DD')}</span>
      <button onClick={onTaskClick}>{t("taskcard.detail")}</button>
    </div>
  );
}

function TaskCard2({ text ,completed,deadline}) {
    const { t } = useTranslation();
    const icon=completed ? "✅":"❌";
    const deadline_dayjs = dayjs(deadline);
  return (
    <div className={completed ?"task-card completed":"task-card"}>
      <span>{icon} {text}{t("taskcard.jiezhi")}{deadline_dayjs.format('YYYY-MM-DD')}</span>
    </div>
  );
}

function DailyTaskCard({ text ,completed, onTaskClick}) {
    const { t } = useTranslation();

  return (
    <div className={completed ?"task-card completed":"task-card"}>
      <span> {text}</span>
      {completed ? <button>{t("taskcard.yidaka")}</button>: 
        <button onClick={onTaskClick}>{t("taskcard.daka")}</button>}
    </div>
  );
}


function DailyTaskCardHomePage({daily_tasks,  onTaskClick }) {
    const { t } = useTranslation();
  const daily_tasks_num = daily_tasks.length;
  if (daily_tasks_num === 0) {
    return <div className="task-card">{t("taskcard.notasks")}</div>;
  }
  const completed_num = daily_tasks.filter(task => task.completed).length;
  if (completed_num === daily_tasks_num) {
    return <div className="task-card completed">
      {t("taskcard.complete")}{completed_num}/{daily_tasks_num}
      <button>{t("taskcard.check")}</button>
      </div>;
  }
  const text = t("taskcard.today") + completed_num + "/" + daily_tasks_num;
  return (
    <div className="task-card">
      <span> {text}</span>
      <button>{t("taskcard.check")}</button>
    </div>
  );
}

export default TaskCard;
export { TaskCard, DailyTaskCard, DailyTaskCardHomePage }; // Export TaskCard and DailyTaskCard for use in other components
export { TaskCard2 }; // Export TaskCard2 for use in other components
