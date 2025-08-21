from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection, init_db
from datetime import datetime

# 初始化数据库（如果表不存在会创建）
init_db()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}
})

# 获取任务（默认包含已删除）
# 如需只看未删除，可以传 ?only_active=1
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    only_active = request.args.get('only_active', '0') == '1'
    conn = get_db_connection()
    if only_active:
        rows = conn.execute('SELECT * FROM tasks WHERE deleted = 0').fetchall()
    else:
        rows = conn.execute('SELECT * FROM tasks').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows]), 200

# 新增任务（包含 type）
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json or {}
    title = data.get('title', '').strip()
    content = data.get('content', '')
    deadline = data.get('deadline', '')
    task_type = data.get('type', '未分类')

    if not title:
        return jsonify({'error': 'title is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO tasks (title, content, deadline, type) VALUES (?, ?, ?, ?)',
        (title, content, deadline, task_type)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({'message': 'Task added successfully!', 'id': new_id}), 201

# 更新任务（支持完成、删除、修改类型等）
@app.route('/api/tasks/<int:task_id>', methods=['PATCH'])
def update_task(task_id):
    data = request.json or {}

    # 允许更新的字段
    allowed = ['completed', 'completed_date', 'deleted', 'title', 'content', 'deadline', 'type']
    fields, values = [], []
    for key in allowed:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])

    if not fields:
        return jsonify({'message': 'No updatable fields provided'}), 400

    conn = get_db_connection()
    sql = f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?"
    values.append(task_id)
    conn.execute(sql, values)
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task updated successfully'}), 200


# -----------------
# 任务类型
# -----------------
@app.route('/api/task-types', methods=['GET', 'POST'])
def task_types():
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.json
        cursor.execute("INSERT INTO task_types (name) VALUES (?)", (data['name'],))
        conn.commit()
    types = cursor.execute("SELECT * FROM task_types").fetchall()
    conn.close()
    return jsonify([dict(row) for row in types])

# -----------------
# 打卡模板
# -----------------
@app.route('/api/daily-templates', methods=['GET', 'DELETE']) 
def daily_templates():
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'DELETE':
        tid = request.args.get("id")
        cursor.execute("DELETE FROM daily_templates WHERE id = ?", (tid,))
        conn.commit()
    templates = cursor.execute("SELECT * FROM daily_templates").fetchall()
    conn.close()
    return jsonify([dict(row) for row in templates])

@app.route('/api/daily-templates', methods=['POST'])
def add_daily_template():
    data = request.json
    title = data.get('title')
    if not title:
        return jsonify({"error": "title required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO daily_templates(title) VALUES (?)", (title,))
    template_id = cur.lastrowid

    # 为今天补一条未完成
    today = datetime.now().strftime("%Y-%m-%d")
    cur.execute("""
        INSERT INTO checkins(date, template_id, completed)
        VALUES(?, ?, 0)
        ON CONFLICT(date, template_id) DO NOTHING
    """, (today, template_id))
    conn.commit()
    conn.close()

    return jsonify({"id": template_id, "title": title})


# 新增：REST 风格删除 + 预检
@app.route('/api/daily-templates/<int:template_id>', methods=['DELETE', 'OPTIONS'])
def delete_daily_template_rest(template_id):
    if request.method == 'OPTIONS':
        return ('', 204)

    today = datetime.now().strftime("%Y-%m-%d")
    conn = get_db_connection()
    cur = conn.cursor()
    # 只删今天及之后
    cur.execute("DELETE FROM checkins WHERE template_id = ? AND date >= ?", (template_id, today))
    # 模板本身仍然删除（历史 checkins 保留孤儿 id 不影响查询）
    cur.execute("DELETE FROM daily_templates WHERE id = ?", (template_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# -----------------
# 每日打卡
# -----------------
@app.route('/api/checkins', methods=['POST'])
def upsert_checkin():
    data = request.json
    date = data.get('date')
    template_id = data.get('template_id')
    completed = 1 if data.get('completed') else 0

    if not date or not template_id:
        return jsonify({"error": "date & template_id required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO checkins(date, template_id, completed)
        VALUES(?, ?, ?)
        ON CONFLICT(date, template_id)
        DO UPDATE SET completed = excluded.completed
    """, (date, int(template_id), completed))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route('/api/checkins', methods=['GET'])
def get_checkins_by_date():
    date = request.args.get('date')
    if not date:
        return jsonify({"error": "date required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # 取全部模板ID
    template_rows = cur.execute("SELECT id FROM daily_templates").fetchall()
    template_ids = [r["id"] for r in template_rows]

    # 已有记录
    rows = cur.execute(
        "SELECT template_id, completed FROM checkins WHERE date = ?",
        (date,)
    ).fetchall()
    existing = {r["template_id"]: r["completed"] for r in rows}

    # 仅“今天及以后”才真正补0写库；过去的日期不写库
    today_str = datetime.now().strftime("%Y-%m-%d")
    if date >= today_str:
        to_insert = [(date, tid, 0) for tid in template_ids if tid not in existing]
        if to_insert:
            cur.executemany(
                "INSERT INTO checkins(date, template_id, completed) VALUES (?, ?, ?)",
                to_insert
            )
            conn.commit()
        # 重新查一次，返回写库后的完整映射
        rows = cur.execute(
            "SELECT template_id, completed FROM checkins WHERE date = ?",
            (date,)
        ).fetchall()

    conn.close()

    # 返回值：不再强行给“过去的日期”补键；只返回已有记录
    resp = {r["template_id"]: bool(r["completed"]) for r in rows}
    return jsonify(resp)



if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
