import  { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần bắt buộc
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const RevenueChart = () => {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [filter, setFilter] = useState("daily");

  useEffect(() => {
    axios.get(`http://localhost:2000/api/v1/revenue/${filter}`).then((response) => {
      const labels = response.data.map((item) => item[filter === "daily" ? "date" : filter === "monthly" ? "month" : "quarter"]);
      const revenueData = response.data.map((item) => item.revenue);

      setData({
        labels,
        datasets: [
          {
            label: "Doanh thu",
            data: revenueData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });
    });
  }, [filter]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Biểu đồ doanh thu</h2>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded">
        <option value="daily">Theo ngày</option>
        <option value="monthly">Theo tháng</option>
        <option value="quarterly">Theo quý</option>
      </select>
      <div className="mt-4">
        <Bar data={data} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>
    </div>
  );
};

export default RevenueChart;

