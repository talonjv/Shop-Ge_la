

import { useState, useEffect } from "react";
import axios from "axios";

function ModeraTor() {
  // State lưu danh sách reports
  const [salesReports, setSalesReports] = useState([]);

  // State cho form (tạo/sửa)
  const [formData, setFormData] = useState({
    ProductID: "",
    TotalSales: "",
    QuantitySold: "",
    ReportDate: ""
  });

  // Lưu ID đang edit (nếu có)
  const [editingReportID, setEditingReportID] = useState(null);

  // Gọi API GET để lấy danh sách khi component mount
  useEffect(() => {
    fetchSalesReports();
  }, []);

  // Hàm gọi API GET /api/v1/salesreports
  const fetchSalesReports = async () => {
    try {
      const res = await axios.get("/api/v1/salesreports");
      console.log("Kết quả API salesreports:", res.data);

      // TH1: Nếu server trả về { data: [...] }
      if (res.data && Array.isArray(res.data.data)) {
        setSalesReports(res.data.data);
      }
      // TH2: Nếu server trả về mảng trực tiếp [ {...}, {...} ]
      else if (Array.isArray(res.data)) {
        setSalesReports(res.data);
      }
      // TH3: Các trường hợp khác => đặt về mảng rỗng
      else {
        setSalesReports([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sales reports:", error);
      // Nếu lỗi, đặt về mảng rỗng để tránh lỗi .map
      setSalesReports([]);
    }
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Tạo mới (POST)
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/salesreports", formData);
      alert("Tạo report mới thành công!");
      // Reset form
      setFormData({ ProductID: "", TotalSales: "", QuantitySold: "", ReportDate: "" });
      // Cập nhật lại danh sách
      fetchSalesReports();
    } catch (error) {
      console.error("Lỗi khi tạo report:", error);
    }
  };

  // Khi bấm "Edit", ta nạp dữ liệu vào form để chỉnh
  const handleEditClick = (report) => {
    setEditingReportID(report.ReportID);
    setFormData({
      ProductID: report.ProductID,
      TotalSales: report.TotalSales,
      QuantitySold: report.QuantitySold,
      ReportDate: report.ReportDate ? report.ReportDate.substring(0, 10) : ""
    });
  };

  // Cập nhật (PUT)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/v1/salesreports/${editingReportID}`, formData);
      alert("Cập nhật report thành công!");
      setFormData({ ProductID: "", TotalSales: "", QuantitySold: "", ReportDate: "" });
      setEditingReportID(null);
      fetchSalesReports();
    } catch (error) {
      console.error("Lỗi khi cập nhật report:", error);
    }
  };

  // Xóa (DELETE)
  const handleDelete = async (reportID) => {
    if (!window.confirm("Bạn có chắc muốn xóa report này?")) return;
    try {
      await axios.delete(`/api/v1/salesreports/${reportID}`);
      alert("Đã xóa report!");
      fetchSalesReports();
    } catch (error) {
      console.error("Lỗi khi xóa report:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Reports</h1>

      {/* Form Tạo/Sửa */}
      <form
        onSubmit={editingReportID ? handleUpdate : handleCreate}
        className="space-y-4 max-w-md mb-8"
      >
        <div>
          <label className="block mb-1 font-semibold">ProductID</label>
          <input
            type="number"
            name="ProductID"
            value={formData.ProductID}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">TotalSales</label>
          <input
            type="number"
            name="TotalSales"
            value={formData.TotalSales}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">QuantitySold</label>
          <input
            type="number"
            name="QuantitySold"
            value={formData.QuantitySold}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">ReportDate</label>
          <input
            type="date"
            name="ReportDate"
            value={formData.ReportDate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          {editingReportID ? "Cập nhật" : "Tạo mới"}
        </button>

        {/* Nút Hủy khi đang Edit */}
        {editingReportID && (
          <button
            type="button"
            onClick={() => {
              setEditingReportID(null);
              setFormData({ ProductID: "", TotalSales: "", QuantitySold: "", ReportDate: "" });
            }}
            className="ml-2 px-4 py-2 bg-gray-300 text-black font-semibold rounded hover:bg-gray-400"
          >
            Hủy
          </button>
        )}
      </form>

      {/* Bảng hiển thị danh sách Sales Reports */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ReportID</th>
            <th className="border p-2">ProductID</th>
            <th className="border p-2">TotalSales</th>
            <th className="border p-2">QuantitySold</th>
            <th className="border p-2">ReportDate</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesReports.map((report) => (
            <tr key={report.ReportID}>
              <td className="border p-2 text-center">{report.ReportID}</td>
              <td className="border p-2 text-center">{report.ProductID}</td>
              <td className="border p-2 text-center">{report.TotalSales}</td>
              <td className="border p-2 text-center">{report.QuantitySold}</td>
              <td className="border p-2 text-center">
                {report.ReportDate ? report.ReportDate.substring(0, 10) : ""}
              </td>
              <td className="border p-2 text-center">
                {/* Nút Sửa */}
                <button
                  onClick={() => handleEditClick(report)}
                  className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 mr-2"
                >
                  Edit
                </button>
                {/* Nút Xóa */}
                <button
                  onClick={() => handleDelete(report.ReportID)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Nếu rỗng */}
          {salesReports.length === 0 && (
            <tr>
              <td colSpan="6" className="border p-2 text-center">
                Chưa có báo cáo nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ModeraTor;

