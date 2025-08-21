import { useState } from "react";
import { API_BASE } from "../config";
import { setToken } from "../auth";
import "../assets/login-style.css"
import { authFetch } from "../auth";

export default function Login({ onSuccess }) {
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
      if (!r.ok) throw new Error(data.error || "登录失败");
      const t = data.token || data.access_token;
        if (!t) throw new Error("登录响应没有 token");
        setToken(t);
      onSuccess?.();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="login-card">
      <h2>登录</h2>
      <form onSubmit={submit}>
        <input placeholder="邮箱" value={email} onChange={e=>setE(e.target.value)} />
        <input placeholder="密码" type="password" value={password} onChange={e=>setP(e.target.value)} />
        <button type="submit">登录</button>
        {msg && <p style={{color:"red"}}>{msg}</p>}
      </form>
      <p style={{marginTop:8}}>没有账号？去 <a href="/register">注册</a></p>
    </div>
  );
}
