from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection, init_db, run_db_setup
from datetime import datetime, timedelta
import os
import sqlite3

# ---------- 基础初始化 ----------
app = Flask(__name__)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)

if os.getenv("RUN_DB_SETUP") == "1":
    run_db_setup()


app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")

# 明确声明 JWT 从请求头读取，并且头名/类型
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"]    = "Authorization"
app.config["JWT_HEADER_TYPE"]    = "Bearer"

jwt = JWTManager(app)

# 允许本地联调的前端来源（5173/3000 二选一或都保留）
CORS(app, resources={ r"/api/*": {
    "origins": os.getenv("CORS_ORIGINS", "").split(","),
    "allow_headers": ["Content-Type", "Authorization"],
    "expose_headers": ["Content-Type", "Authorization"]
}}, supports_credentials=False)


# 让 401/422 返回更可读，便于你在前端 Console 直接看到原因
@jwt.unauthorized_loader
def _unauthorized(err):
    return jsonify(error=f"Missing/invalid Authorization header: {err}"), 401

@jwt.invalid_token_loader
def _invalid(err):
    return jsonify(error=f"Invalid token: {err}"), 422

@jwt.expired_token_loader
def _expired(jwt_header, jwt_payload):
    return jsonify(error="Token has expired"), 401


# ---------- Auth：注册 / 登录 ----------
@app.post("/api/auth/register")
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "email & password required"}), 400

    pw_hash = generate_password_hash(password)
    conn = get_db_connection(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users(email, password_hash) VALUES (?,?)", (email, pw_hash))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "email already exists"}), 409
    finally:
        conn.close()
    return jsonify({"ok": True})


@app.post("/api/auth/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("SELECT id, password_hash FROM users WHERE email=?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_access_token(identity=str(row["id"]))  # 身份用 str

    return jsonify({"token": token})


# ---------- 任务（按 user_id 隔离） ----------
@app.get('/api/tasks')
@jwt_required()
def get_tasks():
    uid = int(get_jwt_identity())
    only_active = request.args.get('only_active', '0') == '1'
    conn = get_db_connection()
    if only_active:
        rows = conn.execute('SELECT * FROM tasks WHERE deleted = 0 AND user_id = ?', (uid,)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM tasks WHERE user_id = ?', (uid,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows]), 200


@app.post('/api/tasks')
@jwt_required()
def add_task():
    uid = int(get_jwt_identity())
    data = request.json or {}
    title = (data.get('title') or '').strip()
    content = data.get('content', '')
    deadline = data.get('deadline', '')
    task_type = data.get('type', '未分类')

    if not title:
        return jsonify({'error': 'title is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO tasks (title, content, deadline, type, user_id) VALUES (?, ?, ?, ?, ?)',
        (title, content, deadline, task_type, uid)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({'message': 'Task added successfully!', 'id': new_id}), 201


@app.patch('/api/tasks/<int:task_id>')
@jwt_required()
def update_task(task_id):
    uid = int(get_jwt_identity())
    data = request.json or {}

    allowed = ['completed', 'completed_date', 'deleted', 'title', 'content', 'deadline', 'type']
    fields, values = [], []
    for key in allowed:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])

    if not fields:
        return jsonify({'message': 'No updatable fields provided'}), 400

    conn = get_db_connection()
    sql = f"UPDATE tasks SET {', '.join(fields)} WHERE id = ? AND user_id = ?"
    values.extend([task_id, uid])
    conn.execute(sql, values)
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task updated successfully'}), 200


# ---------- 任务类型（如需私有可同样加 user_id；这里保持全局共享） ----------
@app.route('/api/task-types', methods=['GET', 'POST'])
@jwt_required()
def task_types():
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.json or {}
        name = (data.get('name') or '').strip()
        if not name:
            conn.close()
            return jsonify({"error": "name required"}), 400
        cursor.execute("INSERT OR IGNORE INTO task_types (name) VALUES (?)", (name,))
        conn.commit()
    types = cursor.execute("SELECT * FROM task_types").fetchall()
    conn.close()
    return jsonify([dict(row) for row in types])


# ---------- 打卡模板 ----------
@app.route('/api/daily-templates', methods=['GET'])
@jwt_required()
def get_daily_templates():
    uid = int(get_jwt_identity())
    conn = get_db_connection(); cur = conn.cursor()
    rows = cur.execute("SELECT id, title, created_at FROM daily_templates WHERE user_id = ?", (uid,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.post('/api/daily-templates')
@jwt_required()
def add_daily_template():
    uid = int(get_jwt_identity())
    data = request.json or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({"error": "title required"}), 400

    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("INSERT INTO daily_templates(title, user_id) VALUES (?, ?)", (title, uid))
    template_id = cur.lastrowid

    # 为今天补一条未完成（只给当前用户）
    today = datetime.now().strftime("%Y-%m-%d")
    cur.execute("""
        INSERT OR IGNORE INTO checkins(date, template_id, completed, user_id)
        VALUES(?, ?, 0, ?)
    """, (today, template_id, uid))
    conn.commit(); conn.close()

    return jsonify({"id": template_id, "title": title})


# REST 风格删除 + 预检（只删“今天及以后”的当前用户记录）
@app.route('/api/daily-templates/<int:template_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required(optional=True)  # 让预检 OPTIONS 放行
def delete_daily_template_rest(template_id):
    if request.method == 'OPTIONS':
        return ('', 204)

    uid = int(get_jwt_identity())
    today = datetime.now().strftime("%Y-%m-%d")
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("DELETE FROM checkins WHERE template_id = ? AND date >= ? AND user_id = ?", (template_id, today, uid))
    cur.execute("DELETE FROM daily_templates WHERE id = ? AND user_id = ?", (template_id, uid))
    conn.commit(); conn.close()
    return jsonify({"ok": True})


# ---------- 每日打卡 ----------
# 允许 POST + 预检 OPTIONS；预检不需要鉴权
# 允许 POST + 预检 OPTIONS；预检不需要鉴权
@app.route('/api/checkins', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def upsert_checkin():
    if request.method == 'OPTIONS':
        # 预检直接放行；Flask-CORS 会自动补全 CORS 响应头
        return ('', 204)

    uid = int(get_jwt_identity())  # 真实用户
    data = request.json or {}
    date = data.get('date')
    template_id = data.get('template_id')
    completed = 1 if data.get('completed') else 0

    if not date or not template_id:
        return jsonify({"error": "date & template_id required"}), 400

    conn = get_db_connection(); cur = conn.cursor()

    # 1) 先尝试更新
    cur.execute("""
        UPDATE checkins
           SET completed = ?
         WHERE date = ? AND template_id = ? AND user_id = ?
    """, (completed, date, int(template_id), uid))

    if cur.rowcount == 0:
        # 2) 没有就插入
        cur.execute("""
            INSERT INTO checkins(date, template_id, completed, user_id)
            VALUES(?, ?, ?, ?)
        """, (date, int(template_id), completed, uid))

    conn.commit(); conn.close()
    return jsonify({"ok": True})




@app.get('/api/checkins')
@jwt_required()
def get_checkins_by_date():
    uid = int(get_jwt_identity())
    date = request.args.get('date')
    if not date:
        return jsonify({"error": "date required"}), 400

    conn = get_db_connection(); cur = conn.cursor()

    # 当前用户的所有模板
    template_rows = cur.execute("SELECT id FROM daily_templates WHERE user_id = ?", (uid,)).fetchall()
    template_ids = [r["id"] for r in template_rows]

    # 已有记录（当前用户）
    rows = cur.execute(
        "SELECT template_id, completed FROM checkins WHERE date = ? AND user_id = ?",
        (date, uid)
    ).fetchall()
    existing = {r["template_id"]: r["completed"] for r in rows}

    # 仅“今天及以后”才真正补0写库；过去的日期不写库
    today_str = datetime.now().strftime("%Y-%m-%d")
    if date >= today_str:
        to_insert = [(date, tid, 0, uid) for tid in template_ids if tid not in existing]
        if to_insert:
            cur.executemany(
                "INSERT INTO checkins(date, template_id, completed, user_id) VALUES (?, ?, ?, ?)",
                to_insert
            )
            conn.commit()
        rows = cur.execute(
            "SELECT template_id, completed FROM checkins WHERE date = ? AND user_id = ?",
            (date, uid)
        ).fetchall()

    conn.close()

    resp = {r["template_id"]: bool(r["completed"]) for r in rows}
    return jsonify(resp)



if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
