import {
  LineChart,     // 折线图本体容器
  Line,          // 折线本身
  XAxis,         // 横坐标轴
  YAxis,         // 纵坐标轴
  CartesianGrid, // 背景网格
  Tooltip,       // 悬停时显示数值
  ResponsiveContainer // 响应式容器（自动适配页面宽度）
} from 'recharts';
import { useTranslation } from "react-i18next";
function DailyLineChart({ data }) {
  const { t } = useTranslation();

  return (
    <section className="chart-section">
        <h3>📈 {t("linechart.hint")}</h3>
        <div style={{ width: '100%', height: 300 }} className="daily-line-chart">
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
                type="monotone"
                dataKey="completed"
                stroke="#ff6600"
                strokeWidth={3}
                dot={{ r: 5 }}
            />
            </LineChart>
        </ResponsiveContainer>
        </div>
     </section>
  );
}

export default DailyLineChart;