import {useMemo, useState } from "react";
import TaskCard from "../components/TaskCard";
import "../assets/unified-style.css";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Add_Modal from "../components/modal";
import { Task_Modal } from "../components/modal";
import dayjs from "dayjs";
import { useEffect } from "react";
import Footer from "../components/footer";
import { useLocation, useNavigate } from "react-router-dom";
import { authFetch } from "../auth";



function PlanPage({ tasks, setTasks, tasksType, settasksType }) {
  // ======== 时间基准 ========
  const today = dayjs();
  const oneWeekLater = today.add(7, "day");

  // ======== 纯派生数据：用 useMemo，而不是 useEffect + setState ========
  const visibleTasks = useMemo(
    () => (tasks || []).filter((t) => !t.deleted),
    [tasks]
  );

  const weekly_tasks = useMemo(() => {
    return visibleTasks.filter((task) => {
      if (!task.deadline) return false;
      const d = dayjs(task.deadline);
      return d.isAfter(today, "day") && d.isBefore(oneWeekLater, "day");
    });
  }, [visibleTasks, today, oneWeekLater]);

  const other_tasks = useMemo(() => {
    return visibleTasks.filter((task) => {
      if (!task.deadline) return false;
      const d = dayjs(task.deadline);
      // 不在“本周区间” 或者 已经是过去且已完成
      const notInThisWeek = !(d.isAfter(today, "day") && d.isBefore(oneWeekLater, "day"));
      const pastAndCompleted = d.isBefore(today, "day") && task.completed;
      return notInThisWeek || pastAndCompleted;
    });
  }, [visibleTasks, today, oneWeekLater]);

  const pastDueTasks = useMemo(() => {
    return visibleTasks.filter((task) => {
      if (!task.deadline) return false;
      const d = dayjs(task.deadline);
      return d.isBefore(today, "day") && !task.completed;
    });
  }, [visibleTasks, today]);

  // ======== 任务 CRUD ========
  function add_task(title, content, deadline, type) {
    authFetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, deadline, type }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("添加失败");
        return res.json();
      })
      .then(() => {
        return authFetch("/api/tasks");
      })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((task) => ({
          ...task,
          completed: task.completed === 1,
          type: task.type || "未分类",
          deleted: task.deleted || false,
        }));
        setTasks(formatted);
      })
      .catch((err) => {
        console.error("添加任务失败：", err);
      });
  }

  function complete_task(task_id) {
    const completed_date = dayjs().format("YYYY-MM-DD");
    authFetch(`/api/tasks/${task_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true, completed_date }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("完成失败");
        return res.json();
      })
      .then(() => authFetch("/api/tasks"))
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((task) => ({
          ...task,
          completed: task.completed === 1,
          type: task.type || "未分类",
          deleted: task.deleted || false,
        }));
        setTasks(formatted);
      })
      .catch((err) => {
        console.error("完成任务失败：", err);
      });
  }

  function delete_task(task_id) {
    authFetch(`/api/tasks/${task_id}`, {
      method: "PATCH", // 软删除
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted: true }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("删除失败");
        return res.json();
      })
      .then(() => authFetch("/api/tasks"))
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((task) => ({
          ...task,
          completed: task.completed === 1,
          type: task.type || "未分类",
          deleted: task.deleted || false,
        }));
        setTasks(formatted);
      })
      .catch((err) => {
        console.error("删除任务失败：", err);
      });
  }

  // ======== 弹窗控制 ========
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  function openAddModal() {
    setShowAddModal(true);
  }
  function closeAddModal() {
    setShowAddModal(false);
  }
  function openTaskModal(task) {
    setSelectedTask(task);
    setShowTaskModal(true);
  }
  function closeTaskModal() {
    setShowTaskModal(false);
  }

  return (
    <div className="plan-page">
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Header />

          <div className="topbar">
            <h1>📋 我的计划</h1>
          </div>

          <button className="add-task-btn" onClick={openAddModal}>
            ➕ 添加新任务
          </button>

          <Add_Modal
            show={showAddModal}
            onClose={closeAddModal}
            set_function={add_task}
            tasksType={tasksType}
            settasksType={settasksType}
          />

          <Task_Modal
            show={showTaskModal}
            onClose={closeTaskModal}
            tasks={tasks}
            task={selectedTask}
            onComplete={complete_task}
            onDelete={delete_task}
          />

          <div className="task-section">
            <h3>📅 本周任务</h3>
            {weekly_tasks.length > 0 ? (
              weekly_tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  text={task.title}
                  completed={task.completed}
                  onTaskClick={() => openTaskModal(task)}
                  deadline={task.deadline}
                />
              ))
            ) : (
              <div className="empty-tasks-hint">🎉 本周暂时没有任务安排哦，放松一下吧~</div>
            )}

            <h3>📅 其他任务</h3>
            {other_tasks.length > 0 ? (
              other_tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  text={task.title}
                  completed={task.completed}
                  onTaskClick={() => openTaskModal(task)}
                  deadline={task.deadline}
                />
              ))
            ) : (
              <div className="empty-tasks-hint">
                🎉 暂时没有更远的任务安排，可以专注完成本周任务～
              </div>
            )}

            <h3>⚠️ 逾期任务</h3>
            {pastDueTasks.length > 0 ? (
              pastDueTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  text={task.title}
                  completed={task.completed}
                  onTaskClick={() => openTaskModal(task)}
                  deadline={task.deadline}
                />
              ))
            ) : (
              <div className="empty-tasks-hint">🎉 没有逾期任务，继续保持！</div>
            )}
          </div>

          <div className="tip">
            🍋 每一次努力，都是在为未来的惊喜积蓄力量，加油呀长颈鹿少年！
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default PlanPage;