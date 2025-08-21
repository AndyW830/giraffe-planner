
import { API_BASE } from "./config";

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

// 统一的 fetch：自动带 Authorization；401 自动跳登录
export async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const full = url.startsWith("http") ? url : `${API_BASE}${url}`;
  const res = await fetch(full, { ...options, headers });

  if (!res.ok) {
    // 尝试读出后端错误信息，便于你定位
    let detail = "";
    try {
      const data = await res.json();
      detail = data.error || data.msg || JSON.stringify(data);
    } catch {
      try { detail = await res.text(); } catch {}
    }
    console.error(`[authFetch] ${res.status} ${res.statusText} ${full} ->`, detail);

    // 401/422 都当成需要重新登录（JWT 失效/不合法/CSRF等）
    if (res.status === 401 || res.status === 422) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} ${detail}`.trim());
  }

  return res;
}