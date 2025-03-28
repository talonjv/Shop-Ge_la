import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);

  // State cho form
  const [linkFB, setLinkFB] = useState('');
  const [shopname, setShopname] = useState('');
  const [linkIG, setLinkIG] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [slideFiles, setSlideFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Lấy danh sách setting từ API
  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:2000/api/v1/getsettings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lấy danh sách settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const resetForm = () => {
    setLinkFB('');
    setShopname('');
    setLinkIG('');
    setBannerFile(null);
    setSlideFiles([]);
    setEditingId(null);
  };

  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0]);
    } else {
      setBannerFile(null);
    }
  };

  const handleSlideChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSlideFiles(Array.from(e.target.files));
    } else {
      setSlideFiles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('linkFB', linkFB);
      formData.append('shopname', shopname);
      formData.append('linkIG', linkIG);

      if (bannerFile) {
        formData.append('banner', bannerFile);
      }
      if (slideFiles.length > 0) {
        slideFiles.forEach(file => {
          formData.append('slide', file);
        });
      }

      if (editingId) {
        await axios.put(`http://localhost:2000/api/v1/settings/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Cập nhật setting thành công');
      } else {
        await axios.post('http://localhost:2000/api/v1/settings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Tạo setting thành công');
      }

      resetForm();
      fetchSettings();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      alert('Lỗi khi gửi dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá?')) return;
    try {
      await axios.delete(`http://localhost:2000/api/v1/settings/${id}`);
      alert('Xoá thành công');
      fetchSettings();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xoá');
    }
  };

  const handleEdit = (setting) => {
    setEditingId(setting.settingID);
    setLinkFB(setting.linkFB || '');
    setShopname(setting.shopname || '');
    setLinkIG(setting.linkIG || '');
    setBannerFile(null);
    setSlideFiles([]);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="m-5">
      <h2 className="text-2xl font-bold mb-5">Quản lý Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Link FB:</label>
          <input
            type="text"
            value={linkFB}
            onChange={(e) => setLinkFB(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Shop Name:</label>
          <input
            type="text"
            value={shopname}
            onChange={(e) => setShopname(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Link IG:</label>
          <input
            type="text"
            value={linkIG}
            onChange={(e) => setLinkIG(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Banner (1 ảnh):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Slide (nhiều ảnh):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleSlideChange}
            className="border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
            {editingId ? 'Cập nhật' : 'Tạo mới'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded">
              Hủy
            </button>
          )}
        </div>
      </form>
      <table className="table-auto border-collapse border border-gray-300 w-full text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Setting ID</th>
            <th className="border px-4 py-2">Banner</th>
            <th className="border px-4 py-2">Slide</th>
            <th className="border px-4 py-2">Link FB</th>
            <th className="border px-4 py-2">Shop Name</th>
            <th className="border px-4 py-2">Link IG</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(settings) && settings.length > 0 ? (
            settings.map((item) => (
              <tr key={item.settingID} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.settingID}</td>
                <td className="border px-4 py-2">
                  {item.banner ? (
                    <img
                      src={`http://localhost:2000/image/${item.banner}`}
                      alt="banner"
                      className="w-20"
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="border px-4 py-2">
                  {Array.isArray(item.slide) && item.slide.length > 0
                    ? item.slide.map((slideName, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:2000/image/${slideName}`}
                          alt="slide"
                          className="w-12 inline-block mr-2"
                        />
                      ))
                    : 'N/A'}
                </td>
                <td className="border px-4 py-2">{item.linkFB}</td>
                <td className="border px-4 py-2">{item.shopname}</td>
                <td className="border px-4 py-2">{item.linkIG}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(item.settingID)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="7">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SettingsPage;







