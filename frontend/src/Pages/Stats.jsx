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
import { useTranslation } from "react-i18next";

function Stats({ data, tasks, streak, taskTypeData, overdueData }) {
    const { t } = useTranslation();
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
                        <h1>{t("stats.t")}</h1>
                    </div>
                    <OverviewCards 
                        total_tasks={tasks.length}
                        completed_tasks={tasks.filter(task => task.completed).length}
                        streak_days={streak}
                    />
                    <DailyLineChart data={data} />
                    <h3>{t("stats.type")}</h3>
                    <TaskPieChart data={taskTypeData} />
                    <h3>{t("stats.overdue")}</h3>
                    <OverdueBarChart data={overdueData} />

                    <Footer />
                </div>
            </div>
        </div>
    );
}
export default Stats;