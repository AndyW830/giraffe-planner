import "../assets/unified-style.css";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { DailyTaskCard } from "../components/TaskCard";
import { useState } from "react";
import Footer from "../components/footer";
import dayjs from "dayjs";
import { DailyTask_Modal } from "../components/modal";
import Calendar from "../components/calendar";
import { API_BASE } from "../config";
import { authFetch } from "../auth";


function DailyTasks({ dailyTaskTemplates, setDailyTaskTemplates, dailyCheckins, setDailyCheckins }) {
    const [showTaskModal, setShowTaskModal] = useState(false);
    const today = dayjs().format("YYYY-MM-DD");
    const todayCheckins = dailyCheckins[today] || {};

    const completedToday = Object.values(todayCheckins).filter(done => done).length;

    function openTaskModal() {
        setShowTaskModal(true);
    }

    function closeTaskModal() {
        setShowTaskModal(false);
    }

    function completeTask(taskID) {
        const today = dayjs().format("YYYY-MM-DD");
        authFetch(`/api/checkins`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: today, template_id: taskID, completed: 1 })
        })
        .then(() => {
            setDailyCheckins(prev => ({
            ...prev,
            [today]: { ...(prev[today] || {}), [taskID]: true }
            }));
        })
        .catch(err => console.error("打卡更新失败:", err));
        }


    return (
        <div className="daily-tasks-page">
            <div className="container">
                <Sidebar />
                <div className="main-content">
                    <Header />
                    <div className="topbar">
                        <h1>📆 打卡记录</h1>
                        <p>今日打卡情况：✅{completedToday} / {dailyTaskTemplates.length}</p>
                    </div>

                    <DailyTask_Modal
                        show={showTaskModal}
                        onClose={closeTaskModal}
                        daily_tasks={dailyTaskTemplates}
                        set_daily_tasks={setDailyTaskTemplates}
                        dailycheckins={dailyCheckins}
                        set_daily_checkins={setDailyCheckins}
                    />

                    <section className="task-section">
                        <h3>✅ 今日打卡任务</h3>

                        {dailyTaskTemplates.length > 0 ? (
                            dailyTaskTemplates.map(task => (
                                <DailyTaskCard
                                    key={task.id}
                                    text={task.title}
                                    completed={todayCheckins[task.id] || false}
                                    onTaskClick={() => completeTask(task.id)}
                                />
                            ))
                        ) : (
                            <div className="empty-tasks-hint">今日暂无打卡任务</div>
                        )}
                        <button className="add-task-btn" onClick={openTaskModal}>➕ ➖管理打卡项目</button>
                    </section>

                    <Calendar dailyCheckins={dailyCheckins} dailyTaskTemplates={dailyTaskTemplates}/>

                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default DailyTasks;
