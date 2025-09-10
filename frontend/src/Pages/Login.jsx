import { useState } from "react";
import { API_BASE } from "../config";
import { setToken } from "../auth";
import "../assets/login-style.css"
import { authFetch } from "../auth";
import { useTranslation } from "react-i18next";

export default function Login({ onSuccess }) {
  const { t } = useTranslation();
  const [email, setE] = useState("");
  const [password, setP] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const r = await authFetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || t("login.err"));
      const t = data.token || data.access_token;
        if (!t) throw new Error(t("login.err2"));
        setToken(t);
      onSuccess?.();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="login-card">
      <h2>{t("login.login")}</h2>
      <form onSubmit={submit}>
        <input placeholder={t("login.email")} value={email} onChange={e=>setE(e.target.value)} />
        <input placeholder={t("login.password")} type="password" value={password} onChange={e=>setP(e.target.value)} />
        <button type="submit">{t("login.login")}</button>
        {msg && <p style={{color:"red"}}>{msg}</p>}
      </form>
      <p style={{marginTop:8}}>{t("login.nouser")}<a href="/register">{t("login.register")}</a></p>
    </div>
  );
}
