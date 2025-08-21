import { Link } from "react-router-dom";
function Sidebar() {
  return (
    <nav className="sidebar">
      <h2><Link to={"/"}>🦒 长颈鹿计划</Link></h2>
      <ul>
        <li><Link to="/plan">我的计划 📖</Link></li>
        <li><Link to="/daily-tasks">打卡记录 📆</Link></li>
        <li><Link to="/stats">统计分析 📊</Link></li>
        <li><Link to="/porodomo">番茄钟 🍅</Link></li>
        <li><Link to="/buddy">学习搭子 📚</Link></li>
      </ul>
    </nav>
  );
}

export default Sidebar;
