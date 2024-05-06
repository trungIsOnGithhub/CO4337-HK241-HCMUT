import { createSlice } from "@reduxjs/toolkit";
import * as actions from './asyncAction'
export const categorySlice = createSlice({
    name: "category",
    initialState: {
        categories_service: null,
    },
    reducers:{

    },
    extraReducers: (builder) => {
        // Bắt đầu thực hiện action login (Promise pending)
        builder.addCase(actions.getCategorieService.pending, (state) => {
          // Bật trạng thái loading
          state.isLoading = true;
        });
    
        // Khi thực hiện action login thành công (Promise fulfilled)
        builder.addCase(actions.getCategorieService.fulfilled, (state, action) => {
          // Tắt trạng thái loading, lưu thông tin user vào store
          state.isLoading = false;
          state.categories_service = action?.payload;
          console.log(state.categories_service)
        });
    
        // Khi thực hiện action login thất bại (Promise rejected)
        builder.addCase(actions.getCategorieService.rejected, (state, action) => {
          // Tắt trạng thái loading, lưu thông báo lỗi vào store
          state.isLoading = false;
          state.errorMessage = action?.payload?.message;
        });
      },
})

export const {} = categorySlice.actions
export default categorySlice.reducer