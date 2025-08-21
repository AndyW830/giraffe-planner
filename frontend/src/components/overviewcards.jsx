function OverviewCards({total_tasks, completed_tasks, streak_days}) {
    return (
        <section className="summary-panel">
        <div className="summary-card">
          <h2>{total_tasks}</h2>
          <p>总任务数</p>
        </div>
        <div className="summary-card">
          <h2>{completed_tasks}</h2>
          <p>已完成任务</p>
        </div>
        <div className="summary-card">
          <h2>{streak_days} 天</h2>
          <p>连续打卡</p>
        </div>
      </section>
    );
}

export default OverviewCards;