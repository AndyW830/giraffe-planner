import "../assets/unified-style.css";
import Footer from "../components/footer";
import {Header_welcome} from "../components/header";
import Sidebar from "../components/sidebar";
import Progress from "../components/progress";
import { useState } from "react";
import { useEffect } from "react";
import { TaskCard2 } from "../components/TaskCard";
import dayjs from "dayjs";
import { DailyTaskCardHomePage } from "../components/TaskCard";

function Home({tasks, daily_tasks}) {
    const visibleTasks = tasks.filter(task => !task.deleted);
    console.log("Home component rendered with tasks:", tasks);
    const today = dayjs();
    const todayTasks = daily_tasks.filter(task => task.date === today.format("YYYY-MM-DD"));
    const completedToday = todayTasks.filter(task => task.completed).length;
    const one_week = today.add(7, 'day');
    const weekly_tasks = visibleTasks.filter(task => {
        const task_deadline = dayjs(task.deadline);
        return task_deadline.isAfter(today) && task_deadline.isBefore(one_week);
      });
    const other_tasks = visibleTasks.filter(task => {
        const task_deadline = dayjs(task.deadline);
        return !task_deadline.isAfter(today) || !task_deadline.isBefore(one_week);
      });
    const complete_num = visibleTasks.filter(task => task.completed).length;
    return (
        <div className="index-page">
            <div className="container">
                <Sidebar />
                <div className="main-content">
                    <Header_welcome />

                    <section className="dashboard">
                        <h2>📖 本周计划</h2>
                        {weekly_tasks.length > 0 ? (
                            weekly_tasks.map(task => (
                                <TaskCard2 key={task.id} text={task.title} completed={task.completed} deadline={task.deadline} />
                            ))
                            ) : (
                            <div className="empty-tasks-hint">
                                🎉 本周暂时没有任务安排哦，放松一下吧~  
                            </div>
                            )}
                        
                        {other_tasks.length > 0 && (
                            <div className="other-task-summary">
                                <h3>📂 其他任务</h3>
                                <p>
                                共 {other_tasks.length} 项，
                                已完成 {other_tasks.filter(t => t.completed).length} 项，
                                完成率：{Math.round(other_tasks.filter(t => t.completed).length / other_tasks.length * 100)}%
                                </p>
                            </div>
                            )}


                        <h2>📆 今日打卡</h2>
                        <DailyTaskCardHomePage daily_tasks={todayTasks} />
                    </section>

                    <Progress tasks={visibleTasks} complete_num={complete_num} />

                    <Footer />
                </div>
            </div>
        </div>
    );
    }

export default Home;