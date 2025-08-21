import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { useState, useEffect } from "react";
import "../assets/unified-style.css";
import "../assets/stats.css";
import Footer from "../components/footer";
import DailyLineChart from "../components/dailylinechart";
import OverviewCards from "../components/overviewcards";
import dayjs from "dayjs";
import TaskPieChart from "../components/piechart";
import OverdueBarChart from "../components/overduerchart";

function Stats({ data, tasks, streak, taskTypeData, overdueData }) {
    console.log("Stats component rendered with data:", data);
    console.log(dayjs("2025-07-27").startOf("week").format("YYYY-MM-DD"))
    console.log(dayjs("2025-07-28").startOf("week").format("YYYY-MM-DD"))
    console.log(dayjs("2025-07-29").startOf("week").format("YYYY-MM-DD"))
    return (
        <div className="stats-page">
            <div className="container">
                <Sidebar />
                <div className="main-content">
                    <Header />
                    <div className="topbar">
                        <h1>📊 学习统计分析</h1>
                    </div>
                    <OverviewCards 
                        total_tasks={tasks.length}
                        completed_tasks={tasks.filter(task => task.completed).length}
                        streak_days={streak}
                    />
                    <DailyLineChart data={data} />
                    <h3>🍩 已完成任务类型占比</h3>
                    <TaskPieChart data={taskTypeData} />
                    <h3>📉 每日逾期任务数量</h3>
                    <OverdueBarChart data={overdueData} />

                    <Footer />
                </div>
            </div>
        </div>
    );
}
export default Stats;