import { createSlice } from "@reduxjs/toolkit";
import * as actions from './asyncAction'

export const userSlice = createSlice({
    name: "user",
    initialState: {
        isLogin: false,
        current: null, 
        token: null,
        isLoading: false,
        mes: '',
        currentCartService: [],
        currentCartProduct: [],
    },
    reducers:{
        login: (state, action) => {
            state.isLogin = action.payload.isLogin
            state.token = action.payload.token
        },
        logout: (state, action) => {
          state.isLogin= false
          state.current= null
          state.token= null
          state.isLoading= false
          state.mes= ''
        },
        clearMessage: (state) => {
          state.mes = ''
        },
        updateCartProduct: (state, action) => {
          const {pid, color, quantity} = action.payload
          const updatingCart = JSON.parse(JSON.stringify(state.currentCartProduct))
          const updatedCart = updatingCart.map(el=>{
            if(el.color === color && el.product?._id === pid){
              return {...el, quantity}
            }
            else return el
          })
          state.currentCartProduct = updatedCart
          
        }
    },
    extraReducers: (builder) => {
        // Bắt đầu thực hiện action login (Promise pending)
        builder.addCase(actions.getCurrent.pending, (state) => {
          // Bật trạng thái loading
          state.isLoading = true;
        });
    
        // // Khi thực hiện action login thành công (Promise fulfilled)
        builder.addCase(actions.getCurrent.fulfilled, (state, action) => {
          // Tắt trạng thái loading, lưu thông tin user vào store
          state.isLoading = false;
          state.current = action.payload;
          state.currentCartService = action.payload?.cart_service;
          state.currentCartProduct = action.payload?.cart_product;
          state.isLogin = true;
        });
    
        // // Khi thực hiện action login thất bại (Promise rejected)
        builder.addCase(actions.getCurrent.rejected, (state, action) => {
          // Tắt trạng thái loading, lưu thông báo lỗi vào store
          state.isLoading = false;
          state.current = null;
          state.isLogin = false;
          state.token = null;
          state.mes = 'Your session has expired, please log in again!'
        });
      },
})

export const {login, logout, clearMessage, updateCartProduct} = userSlice.actions
export default userSlice.reducer