# db.py
import os, sqlite3

# 统一 DB 路径：环境变量优先，否则放到代码同目录
DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "giraffe.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # 打开外键 & WAL，提升可靠性
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

def _column_exists(cur, table, col):
    cur.execute(f"PRAGMA table_info({table})")
    return any(r[1] == col for r in cur.fetchall())

def _table_exists(cur, table):
    cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,))
    return cur.fetchone() is not None

def run_db_setup():
    """
    幂等：可多次调用，不会破坏已有数据。
    - 创建必须的表
    - 为旧表补 user_id 列
    - 若没有任何用户，则创建 owner@local 并把历史数据归属过去
    """
    conn = get_db_connection()
    cur  = conn.cursor()

    # 1) users 表（认证）
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2) 任务/类型/打卡相关表：如果不存在就带 user_id 创建；如果已存在则后续补列
    cur.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        deadline TEXT,
        completed INTEGER DEFAULT 0,
        completed_date TEXT,
        deleted INTEGER DEFAULT 0,
        type TEXT DEFAULT '未分类',
        user_id INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS task_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
    """)
    # 默认任务类型
    for t in ("📘 学习", "🧹 生活", "🖥️ 工作", "💪 锻炼"):
        cur.execute("INSERT OR IGNORE INTO task_types (name) VALUES (?);", (t,))

    cur.execute("""
    CREATE TABLE IF NOT EXISTS daily_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        template_id INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        user_id INTEGER
    )
    """)
    # 同一天同一模板唯一
    cur.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_unique
    ON checkins(date, template_id, user_id);
    """)

    conn.commit()

    # 3) 兼容旧库：为已有但缺列的表补 user_id
    for tbl in ("daily_templates", "checkins", "tasks"):
        if _table_exists(cur, tbl) and not _column_exists(cur, tbl, "user_id"):
            cur.execute(f"ALTER TABLE {tbl} ADD COLUMN user_id INTEGER")
    conn.commit()

    # 4) 若库里还没有任何用户 -> 创建占位用户，并把历史数据归属过来
    cur.execute("SELECT id FROM users LIMIT 1")
    owner_row = cur.fetchone()
    if not owner_row:
        cur.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", ("owner@local", "INIT"))
        owner_id = cur.lastrowid
        for tbl in ("daily_templates", "checkins", "tasks"):
            cur.execute(f"UPDATE {tbl} SET user_id = ? WHERE user_id IS NULL", (owner_id,))
        conn.commit()

    conn.close()

# 兼容老名字（如果你其他地方还引用了 init_db）
def init_db():
    run_db_setup()
