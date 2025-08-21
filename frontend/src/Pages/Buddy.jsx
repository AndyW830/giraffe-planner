// src/Pages/Buddy.jsx
import "../assets/unified-style.css";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import { Link } from "react-router-dom";

function Buddy() {
  return (
    <div className="buddy-page">
      <div className="container">
        <Sidebar />

        <div className="main-content">
          <Header />

          <div className="topbar">
            <h1>🦒 学习搭子</h1>
            <p>小长颈鹿正在搭建学习伙伴中心，敬请期待～</p>
          </div>

          <section className="task-section">
            <div
              className="placeholder-card"
              style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: "16px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                padding: "28px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                className="emoji"
                style={{
                  fontSize: "64px",
                  lineHeight: 1,
                  transform: "translateY(-4px)",
                }}
              >
                🚧
              </div>

              <div className="texts">
                <h2
                  style={{
                    margin: "0 0 8px",
                    color: "#ff7a00",
                    fontWeight: 800,
                    fontSize: "24px",
                  }}
                >
                  功能建设中…
                </h2>
                <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
                  小长颈鹿正在搬砖：匹配学习搭子、共享任务、互相监督打卡… 很快见面！
                </p>

                <div style={{ marginTop: "18px", display: "flex", gap: "12px" }}>
                  <Link to="/plan" className="add-task-btn">
                    去我的计划 📖
                  </Link>
                  <Link to="/daily-tasks" className="add-task-btn">
                    去打卡记录 ✅
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="tips"
              style={{
                marginTop: "18px",
                color: "#999",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Tip：学习搭子会在后续版本开放～
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Buddy;
