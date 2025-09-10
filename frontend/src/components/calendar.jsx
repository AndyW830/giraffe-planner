import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
function Calendar({ dailyCheckins, dailyTaskTemplates }) {
  const { t } = useTranslation();

  const today = dayjs();
  const startOfWeek = today.startOf("week"); // 周日开始
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));

  // 以“模板全集”为基准判断是否完成（逐条检查，而不是只比较键数）
  // 以“当天实际返回的键”为准；未来日期一律 missed；今天叠加 today 样式
  const getDayClass = (date) => {
      const base = "calendar-day";
      const isToday = date.isSame(dayjs(), "day");
      const dateStr = date.format("YYYY-MM-DD");
      const map = dailyCheckins?.[dateStr]; // { [template_id]: true/false | 1/0 }

      // 未来一律灰
      if (date.isAfter(dayjs(), "day")) return `${base} missed`;

      let cls = base;
      if (isToday) cls += " today";

      // 没数据：保持中性（今天会有描边）
      if (!map || Object.keys(map).length === 0) return cls;

      // 仅依据“当天 map 里实际存在的键”判断是否全完成（历史不会因删除模板而被误判）
      const allDone = Object.values(map).every(
        v => v === true || v === 1 || v === "1"
      );

      return allDone ? `${cls} completed` : `${cls} not-completed`;
    };



  return (
    <section className="task-section">
      <h3>📅 {t("calendar.hint")}</h3>
      <div className="calendar">
        <div className="calendar-header">
          <span>{t("calendar.sun")}</span><span>{t("calendar.mon")}</span><span>{t("calendar.tue")}</span><span>{t("calendar.wed")}</span>
          <span>{t("calendar.thu")}</span><span>{t("calendar.fri")}</span><span>{t("calendar.sat")}</span>
        </div>
        <div className="calendar-body">
          {weekDays.map((day) => (
            <div key={day.format("YYYY-MM-DD")} className={getDayClass(day)}>
              {day.date()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Calendar;
