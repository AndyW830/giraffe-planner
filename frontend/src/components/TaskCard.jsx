import dayjs from "dayjs";

function TaskCard({ text ,completed, onTaskClick,deadline }) {
    const icon=completed ? "✅":"❌";
    const deadline_dayjs = dayjs(deadline);
  return (
    <div className={completed ?"task-card completed":"task-card"}>
      <span>{icon} {text}  截止至:{deadline_dayjs.format('YYYY-MM-DD')}</span>
      <button onClick={onTaskClick}>查看详情</button>
    </div>
  );
}

function TaskCard2({ text ,completed,deadline}) {
    const icon=completed ? "✅":"❌";
    const deadline_dayjs = dayjs(deadline);
  return (
    <div className={completed ?"task-card completed":"task-card"}>
      <span>{icon} {text} 截止至:{deadline_dayjs.format('YYYY-MM-DD')}</span>
    </div>
  );
}

function DailyTaskCard({ text ,completed, onTaskClick}) {

  return (
    <div className={completed ?"task-card completed":"task-card"}>
      <span> {text}</span>
      {completed ? <button>✅ 已打卡</button>: 
        <button onClick={onTaskClick}>打卡</button>}
    </div>
  );
}


function DailyTaskCardHomePage({daily_tasks,  onTaskClick }) {
  const daily_tasks_num = daily_tasks.length;
  if (daily_tasks_num === 0) {
    return <div className="task-card">今日暂无打卡任务</div>;
  }
  const completed_num = daily_tasks.filter(task => task.completed).length;
  if (completed_num === daily_tasks_num) {
    return <div className="task-card completed">
      今日打卡已完成：✅{completed_num}/{daily_tasks_num}
      <button>查看打卡</button>
      </div>;
  }
  const text = "今日打卡情况： ✅" + completed_num + "/" + daily_tasks_num;
  return (
    <div className="task-card">
      <span> {text}</span>
      <button>查看打卡</button>
    </div>
  );
}

export default TaskCard;
export { TaskCard, DailyTaskCard, DailyTaskCardHomePage }; // Export TaskCard and DailyTaskCard for use in other components
export { TaskCard2 }; // Export TaskCard2 for use in other components
