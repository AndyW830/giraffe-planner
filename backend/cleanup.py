import sqlite3

conn = sqlite3.connect("giraffe.db")  # 注意这里是数据库文件，不是 py 文件
cursor = conn.cursor()

cursor.execute("DELETE FROM task_types WHERE name IN ('学习', '工作', '生活', '娱乐');")

# 仅供一次性清理脚本：删除同日同模板的重复行，保留最新的
cursor.execute("""
DELETE FROM checkins
WHERE id NOT IN (
  SELECT MAX(id) FROM checkins
  GROUP BY date, template_id
);
""")


conn.commit()
conn.close()

print("清理完成 ✅")
