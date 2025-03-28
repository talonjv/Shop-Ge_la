import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("userData"));

const initialState = {
  user: storedUser || {
    customerId: null,
    name: "",
    avatar: "",
    email: "",
    phone: "",
    gender: "male",
    address: "",
    district: "",
    role: null,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
  console.log("User data in Redux:", action.payload); // ✅ Kiểm tra dữ liệu API
  state.user = {
    customerId: action.payload.customerId || "",
    name: action.payload.name || "",
    avatar: action.payload.avatar  || "",
    email: action.payload.email || "",
    phone: action.payload.phone || "",
    gender: action.payload.gender || "male",
    address: action.payload.address || "",
    district: action.payload.district || "",
    role: action.payload.role || null,
  };
  console.log("Updated user in Redux:", state.user); // ✅ Kiểm tra Redux sau khi cập nhật
  localStorage.setItem("userData", JSON.stringify(state.user));
    },
    clearUser(state) {
      state.user = { ...initialState.user };
    },
    logout(state) {
      state.user = {
        customerId: null,
        name: "",
        avatar: "",
        email: "",
        phone: "",
        gender: "male",
        address: "",
        district: "",
        role: null,
      };
      // Xóa dữ liệu trong localStorage
      localStorage.removeItem("userData");
      localStorage.removeItem("persist:root"); // Xóa dữ liệu redux-persist
    },
  },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;



