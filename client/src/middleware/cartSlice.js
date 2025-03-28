// cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], 

};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Action: Thêm sản phẩm vào giỏ
    addToCart: (state, action) => {
      const newItem = action.payload; 
      // newItem = { productId, name, price, quantity, color, size, imageURL, ... }

      // Kiểm tra sản phẩm trùng productId + color + size đã có trong giỏ chưa
      const existingItem = state.items.find(
        (item) =>
          item.productId === newItem.productId &&
          item.color === newItem.color &&
          item.size === newItem.size
      );

      if (existingItem) {
        // Nếu đã có, cộng dồn số lượng
        existingItem.quantity += newItem.quantity;
      } else {
        // Nếu chưa có, push vào mảng
        state.items.push(newItem);
      }
    },

    // Action: Xoá sản phẩm khỏi giỏ (theo productId, color, size)
    removeFromCart: (state, action) => {
      const { productId, color, size } = action.payload;
      // Lọc bỏ sản phẩm matching productId + color + size
      state.items = state.items.filter(
        (item) =>
          item.productId !== productId ||
          item.color !== color ||
          item.size !== size
      );
    },

    // Action: Tăng số lượng (1) cho sản phẩm trùng productId + color + size
    increaseQuantity: (state, action) => {
      const { productId, color, size } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.productId === productId &&
          item.color === color &&
          item.size === size
      );
      if (existingItem) {
        existingItem.quantity += 1;
      }
    },

    // Action: Giảm số lượng (1) cho sản phẩm trùng productId + color + size
    decreaseQuantity: (state, action) => {
      const { productId, color, size } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.productId === productId &&
          item.color === color &&
          item.size === size
      );
      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      }
    },
  },
});

export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity } = cartSlice.actions;
export default cartSlice.reducer;




