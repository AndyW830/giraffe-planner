import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import PomodoroTimer from "../components/pomodoro";
import { useState } from "react";
import "../assets/unified-style.css";
import "../assets/pomodoro.css";
import { useTranslation } from "react-i18next";

function Porodomo() {
    const { t } = useTranslation();
    const [showInfo, setShowInfo] = useState(false);
    return (
        <div className="porodomo-page">
            <div className="container">
                <Sidebar />
                <div className="main-content">
                    <Header />
                    <div className="topbar">
                        <h1>{t("pomodoro.t")}</h1>
                        <div className="info-toggle">
                            <button onClick={() => setShowInfo(prev => !prev)}>
                                {showInfo ? t("pomodoro.hideinfo"): t("pomodoro.showinfo")}
                            </button>
                            </div>

                            {showInfo && (
                            <div className="info-box">
                                <p>{t("pomodoro.info1")}</p>
                                <ul>
                                <li>{t("pomodoro.info2")}</li>
                                <li>{t("pomodoro.info3")}</li>
                                <li>{t("pomodoro.info4")}</li>
                                <li>{t("pomodoro.info5")}</li>
                                </ul>
                                <p>{t("pomodoro.message1")}</p>
                            </div>
                            )}

                        <p>{t("pomodoro.message2")}</p>
                    </div>
                    <PomodoroTimer />
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default Porodomo;