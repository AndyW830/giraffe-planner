// src/Pages/Buddy.jsx
import "../assets/unified-style.css";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Buddy() {
  const { t } = useTranslation();
  return (
    <div className="buddy-page">
      <div className="container">
        <Sidebar />

        <div className="main-content">
          <Header />

          <div className="topbar">
            <h1>{t("buddy.title")}</h1>
            <p>{t("buddy.message")}</p>
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
                  {t("buddy.constructing")}
                </h2>
                <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
                  {t("buddy.sentence")}
                </p>

                <div style={{ marginTop: "18px", display: "flex", gap: "12px" }}>
                  <Link to="/plan" className="add-task-btn">
                    {t("buddy.plan")}
                  </Link>
                  <Link to="/daily-tasks" className="add-task-btn">
                    {t("buddy.dailytasks")}
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
              {t("buddy.tip")}
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Buddy;
