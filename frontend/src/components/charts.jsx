function Charts({tasks, daily_tasks, taskTypes}) {
    return (
        <section className="charts-panel">

        <section className="chart-section">
        <h3>📈 最近30天完成趋势</h3>
        <div className="placeholder">这里将显示柱状图或折线图</div>
      </section>

      <section className="chart-section">
        <h3>🍩 任务类型占比</h3>
        <div className="placeholder">这里将显示圆环图</div>
      </section>

      <section className="calendar-heatmap">
        <h3>🔥 打卡热力图</h3>
        <div className="placeholder">这里将显示打卡密度日历</div>
      </section>

      <section className="table-section">
        <h3>📋 详细任务记录</h3>
        <div className="placeholder">这里将显示任务数据表格</div>
      </section>

    </section>
    );
}

export default Charts;