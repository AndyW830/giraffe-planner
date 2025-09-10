import "./assets/unified-style.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlanPage from "./Pages/PlanPage";
import Home from "./Pages/Home";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import DailyTasks from "./Pages/DailyTasks";
import Stats from "./Pages/Stats";
import Porodomo from "./Pages/Pomodoro";
import Buddy from "./Pages/Buddy";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import { getToken, clearToken } from "./auth";
import { authFetch } from "./auth"; // 👈 统一带 Authorization 的 fetch
import { useTranslation } from "react-i18next";

// ------- 统计用的小工具函数 -------
function getWeeklyData(tasks) {
  const weekMap = new Map();
  tasks.forEach((task) => {
    if (!task.completed || !task.completed_date) return;
    const date = dayjs(task.completed_date, "YYYY-MM-DD");
    const weekStart = date.startOf("week");
    const weekEnd = weekStart.add(6, "day");
    const label = `${weekStart.format("M.D")}-${weekEnd.format("M.D")}`;
    weekMap.set(label, (weekMap.get(label) || 0) + 1);
  });
  return Array.from(weekMap.entries()).map(([week, completed]) => ({ week, completed }));
}
function getTaskTypeData(tasks) {
  const m = new Map();
  tasks.forEach((t) => { if (t.completed) m.set(t.type || "未分类", (m.get(t.type || "未分类") || 0) + 1); });
  return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
}
function getOverdueData(tasks) {
  const today = dayjs(); const m = new Map();
  for (let i = 3; i >= 1; i--) m.set(today.subtract(i, "day").format("MM-DD"), 0);
  tasks.forEach((t) => {
    const d = dayjs(t.deadline);
    if (!t.completed && d.isBefore(today)) {
      const k = d.format("MM-DD");
      m.set(k, (m.get(k) || 0) + 1);
    }
  });
  return Array.from(m.entries()).map(([date, overdue]) => ({ date, overdue }));
}

// ================= 顶层：只负责鉴权分流 =================
export default function App() {
  const [token, setTokenState] = useState(() => getToken());

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login onSuccess={() => { setTokenState(getToken()); window.location.href = "/"; }} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={<Login onSuccess={() => { setTokenState(getToken()); window.location.href = "/"; }} />}
          />
        </Routes>
      </Router>
    );
  }

  const logout = () => { clearToken(); setTokenState(null); window.location.href = "/login"; };
  return <AuthedApp onLogout={logout} />;
}

// ================= 登录后的应用：所有业务 Hooks 都放这里 =================
function AuthedApp({ onLogout }) {
  const { t } = useTranslation();
  // 业务状态
  const [tasks, setTasks] = useState([]);
  const [tasksType, setTasksType] = useState([]);
  const [dailyTaskTemplates, setDailyTaskTemplates] = useState([]);
  const [dailyCheckins, setDailyCheckins] = useState({});
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [taskTypeData, setTaskTypeData] = useState([]);
  const [overdueData, setOverdueData] = useState([]);

  // 拉任务
  useEffect(() => {
    authFetch("/api/tasks").then(r => r.json()).then(data => {
      setTasks(data.map(t => ({
        ...t,
        completed: t.completed === 1,
        type: t.type || "未分类",
        deleted: t.deleted || false,
      })));
    }).catch(e => console.error(t("app.taskerr"), e));
  }, []);

  // 任务类型
  useEffect(() => {
    authFetch("/api/task-types").then(r => r.json()).then(d => setTasksType(d.map(x => x.name)))
      .catch(e => console.error(t("app.typeerr"), e));
  }, []);

  // 模板
  useEffect(() => {
    authFetch("/api/daily-templates").then(r => r.json()).then(setDailyTaskTemplates)
      .catch(e => console.error(t("app.dailytaskerr1"), e));
  }, []);

  // 本周每天的打卡 map
  useEffect(() => {
    const start = dayjs().startOf("week");
    const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day").format("YYYY-MM-DD"));
    Promise.all(days.map(d =>
      authFetch(`/api/checkins?date=${d}`).then(r => r.ok ? r.json() : {}).then(map => {
        const n = {}; for (const [k, v] of Object.entries(map)) n[k] = v === true || v === 1 || v === "1";
        return [d, n];
      }).catch(() => [d, undefined])
    )).then(entries => setDailyCheckins(Object.fromEntries(entries)));
  }, []);

  // 今天的打卡
  useEffect(() => {
    const today = dayjs().format("YYYY-MM-DD");
    authFetch(`/api/checkins?date=${today}`).then(r => r.json())
      .then(map => setDailyCheckins(prev => ({ ...prev, [today]: map })))
      .catch(e => console.error(t("app.dailytaskerr2"), e));
  }, []);

  // 连续全完成 streak
  useEffect(() => {
    let s = 0, cur = dayjs();
    while (true) {
      const d = cur.format("YYYY-MM-DD"), m = dailyCheckins[d];
      if (!m) break;
      if (Object.values(m).every(x => x)) { s++; cur = cur.subtract(1, "day"); } else break;
    }
    setStreak(s);
  }, [dailyCheckins]);

  // 统计图
  useEffect(() => setWeeklyData(getWeeklyData(tasks)), [tasks]);
  useEffect(() => setTaskTypeData(getTaskTypeData(tasks)), [tasks]);
  useEffect(() => setOverdueData(getOverdueData(tasks)), [tasks]);

  return (
    <Router>
      <button onClick={onLogout} style={{ position: "fixed", right: 16, top: 16 }}>Log out</button>
      <Routes>
        <Route path="/" element={<Home tasks={tasks} daily_tasks={dailyTaskTemplates} />} />
        <Route
          path="/plan"
          element={<PlanPage tasks={tasks} setTasks={setTasks} tasksType={tasksType} settasksType={setTasksType} />}
        />
        <Route
          path="/daily-tasks"
          element={
            <DailyTasks
              dailyTaskTemplates={dailyTaskTemplates}
              setDailyTaskTemplates={setDailyTaskTemplates}
              dailyCheckins={dailyCheckins}
              setDailyCheckins={setDailyCheckins}
            />
          }
        />
        <Route
          path="/stats"
          element={<Stats tasks={tasks} streak={streak} data={weeklyData} taskTypeData={taskTypeData} overdueData={overdueData} />}
        />
        <Route path="/porodomo" element={<Porodomo />} />
        <Route path="/buddy" element={<Buddy />} />
      </Routes>
    </Router>
  );
}