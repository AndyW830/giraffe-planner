import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import PomodoroTimer from "../components/pomodoro";
import { useState } from "react";
import "../assets/unified-style.css";
import "../assets/pomodoro.css";

function Porodomo() {
    const [showInfo, setShowInfo] = useState(false);
    return (
        <div className="porodomo-page">
            <div className="container">
                <Sidebar />
                <div className="main-content">
                    <Header />
                    <div className="topbar">
                        <h1>⏳ 番茄钟</h1>
                        <div className="info-toggle">
                            <button onClick={() => setShowInfo(prev => !prev)}>
                                {showInfo ? "❌ 隐藏说明" : "ℹ️ 什么是番茄钟？"}
                            </button>
                            </div>

                            {showInfo && (
                            <div className="info-box">
                                <p>番茄钟是一种专注时间管理法，每次专注 25 分钟，然后休息 5 分钟。</p>
                                <ul>
                                <li>✔️ 每完成 4 个番茄钟，休息 30 分钟</li>
                                <li>✔️ 本番茄钟支持自动切换模式</li>
                                <li>✔️ 点击“开始”按钮即可开始专注</li>
                                <li>✔️ 下方会统计你今日完成的番茄数</li>
                                </ul>
                                <p>加油！集中注意力，把任务一个个完成吧～</p>
                            </div>
                            )}

                        <p>专注工作，提升效率！</p>
                    </div>
                    <PomodoroTimer />
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default Porodomo;