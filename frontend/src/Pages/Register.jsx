import { useState } from "react";
import { API_BASE } from "../config";
import "../assets/login-style.css"
import { authFetch } from "../auth";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const [email, setE] = useState("");
  const [password, setP] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const r = await authFetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || t("register.fail"));
      setMsg(t("register.success"));
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="login-card">
      <h2>{t("register.register")}</h2>
      <form onSubmit={submit}>
        <input placeholder={t("register.email")} value={email} onChange={e=>setE(e.target.value)} />
        <input placeholder={t("register.password")} type="password" value={password} onChange={e=>setP(e.target.value)} />
        <button type="submit">{t("register.register")}</button>
        {msg && <p style={{color: msg.includes("successful") ? "green" : "red"}}>{msg}</p>}
      </form>
      <p style={{marginTop:8}}>{t("register.nouser")} <a href="/login">{t("register.login")}</a></p>
    </div>
  );
}
