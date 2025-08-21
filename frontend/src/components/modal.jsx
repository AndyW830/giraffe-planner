import dayjs from "dayjs";
import { useState } from "react";

import { API_BASE } from "../config";
import { authFetch } from "../auth";

/** 添加计划弹窗 */
function Add_Modal({ show, onClose, set_function, tasksType, settasksType }) {
  function addNewType() {
  const newType = prompt("请输入新的任务类型：");
  if (!newType) return;
  if (tasksType.includes(newType)) {
    alert("该类型已存在！");
    return;
  }

  authFetch(`/api/task-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newType }),
  })
    .then((res) => res.json())
    .then((data) => {
      // 后端返回完整的类型列表
      settasksType(data.map((t) => t.name));
    })
    .catch((err) => console.error("添加任务类型失败：", err));
}

  if (!show) return null;

  function add_task(event) {
    event.preventDefault(); // 阻止表单默认刷新
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value;
    const deadline = document.getElementById("deadline").value;
    const type = document.getElementById("tasksType").value;

    if (!title) {
      alert("请输入计划名称");
      return;
    }

    // 调用父组件传入的方法（会发起后端请求）
    set_function(title, content, deadline, type);

    // 清空输入
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("tasksType").value = tasksType[0];

    onClose();
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>添加计划</h2>

        <form onSubmit={add_task}>
          <label htmlFor="title">计划名称：</label>
          <input type="text" id="title" name="title" required />

          <label htmlFor="tasksType">任务类型：</label>
          <select id="tasksType" name="tasksType" required defaultValue={tasksType[0]}>
            {tasksType.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button type="button" onClick={addNewType} className="add-type-btn">
            ➕ 添加新类型
          </button>

          <label htmlFor="content">内容：</label>
          <textarea id="content" name="content" required></textarea>

          <label htmlFor="deadline">截止日期：</label>
          <input type="date" id="deadline" name="deadline" required />

          <button type="submit" id="submit">提交</button>
        </form>
      </div>
    </div>
  );
}

/** 计划详情弹窗（完成 / 删除） */
function Task_Modal({ show, onClose, task, onComplete, onDelete }) {
  if (!show) return null;

  function complete_task() {
    onComplete(task.id);
    onClose();
  }
  function delete_task() {
    onDelete(task.id);
    onClose();
  }

  return (
    <div id="task-modal" className="modal">
      <div className="modal-content">
        <span className="close-btn" id="task-closeModal" onClick={onClose}>&times;</span>
        <h2>计划详情</h2>

        <h3>计划名称：</h3>
        <p id="task-title">{task.title}</p>

        <h3>任务类型：</h3>
        <p id="task-type">{task.type}</p>

        <h3>内容：</h3>
        <p id="task-content">{task.content}</p>

        <h3>截止日期：</h3>
        <p id="task-deadline">{task.deadline}</p>

        {task.completed ? (
          <p>任务已完成✅</p>
        ) : (
          <button id="complete-btn" className="modal-button" onClick={complete_task}>
            完成任务
          </button>
        )}
        <button id="delete-btn" className="modal-button" onClick={delete_task}>
          删除任务
        </button>
      </div>
    </div>
  );
}

function DailyTask_Modal({ show, onClose, daily_tasks, set_daily_tasks, dailycheckins, set_daily_checkins }) {
  const [showAddModal, setShowAddModal] = useState(false);
  if (!show) return null;

  function add_task() { setShowAddModal(true); }
  function closeAddModal() { setShowAddModal(false); }

  // 删除模板（调用后端）
  function delete_task(taskID) {
    authFetch(`/api/daily-templates/${taskID}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("删除失败");
        // 1) 列表里移除该模板
        set_daily_tasks(daily_tasks.filter(t => t.id !== taskID));
        // 2) 只清 “今天及以后” 的本地映射
          const todayStr = dayjs().format("YYYY-MM-DD");
          set_daily_checkins(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(d => {
              if (d >= todayStr && next[d]) {
                const m = { ...next[d] };
                delete m[taskID];
                next[d] = m;
              }
            });
            return next;
          });
          })
      .catch(err => console.error("删除打卡任务失败:", err));
  }

  return (
    <div id="daily-task-modal" className="modal">
      <Add_daily_task_modal show={showAddModal} onClose={closeAddModal} set_daily_tasks={set_daily_tasks} set_daily_checkins={set_daily_checkins}/>
      <div className="modal-content">
        <span className="close-btn" id="daily-task-closeModal" onClick={onClose}>&times;</span>
        <h2>打卡任务详情</h2>
        <button className="add-daily-task-btn" onClick={add_task}>添加打卡任务</button>
        <h3>打卡任务列表：</h3>

        {daily_tasks.map(task => (
          <div key={task.id} className="daily-task-item">
            <h4>{task.title}</h4>
            <button className="delete-daily-task-btn" onClick={() => delete_task(task.id)}>
              删除打卡
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 新增打卡任务子弹窗（调用后端） */
function Add_daily_task_modal({ show, onClose, set_daily_tasks, set_daily_checkins }) {
  if (!show) return null;

  function add_daily_task(event) {
    event.preventDefault();
    const title = document.getElementById("daily-task-title").value.trim();
    if (!title) return;

    authFetch(`/api/daily-templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
      .then(res => res.json())
        .then((tpl) => {
            // ① 立刻把今天的 checkins 补上这条新模板（值为 false/0）
            const today = dayjs().format("YYYY-MM-DD");
            set_daily_checkins(prev => ({
              ...prev,
              [today]: { ...(prev[today] || {}), [tpl.id]: false }
            }));
        // 添加成功后重新加载完整列表
        authFetch(`/api/daily-templates`)
          .then(res => res.json())
          .then(data => {
            set_daily_tasks(data);
            document.getElementById("daily-task-title").value = "";
            onClose();
          });
      })
      .catch(err => console.error("添加打卡任务失败:", err));
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>添加打卡任务</h2>
        <form onSubmit={add_daily_task}>
          <label htmlFor="daily-task-title">打卡任务名称：</label>
          <input type="text" id="daily-task-title" name="daily-task-title" required />
          <button type="submit" id="submit-daily-task">提交</button>
        </form>
      </div>
    </div>
  );
}

export default Add_Modal;
export { Task_Modal, DailyTask_Modal };
 // Export Task_Modal and DailyTask_Modal for use in other components