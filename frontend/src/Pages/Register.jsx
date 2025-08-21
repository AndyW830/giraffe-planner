import { useState } from "react";
import { API_BASE } from "../config";
import "../assets/login-style.css"
import { authFetch } from "../auth";

export default function Register() {
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
      if (!r.ok) throw new Error(data.error || "注册失败");
      setMsg("注册成功，请去登录");
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="login-card">
      <h2>注册</h2>
      <form onSubmit={submit}>
        <input placeholder="邮箱" value={email} onChange={e=>setE(e.target.value)} />
        <input placeholder="密码" type="password" value={password} onChange={e=>setP(e.target.value)} />
        <button type="submit">注册</button>
        {msg && <p style={{color: msg.includes("成功") ? "green" : "red"}}>{msg}</p>}
      </form>
      <p style={{marginTop:8}}>已有账号？去 <a href="/login">登录</a></p>
    </div>
  );
}
