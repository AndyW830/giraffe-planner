import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTranslation } from "react-i18next";

function CustomTooltip({ active, payload, label }) {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        borderRadius: "10px",
        padding: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontFamily: "ZCOOL KuaiLe, cursive",
        fontSize: "14px",
        color: "#333"
      }}>
        <p style={{ marginBottom: "4px", fontWeight: "bold" }}>{t("overduechart.date", { label })}</p>
        <p style={{ color: "#d94848" }}>{t("overduechart.task", { count: payload[0].value })}</p>
      </div>
    );
  }

  return null;
}

function OverdueBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="overdue" fill="#ff6b6b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default OverdueBarChart;
