import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from '../../apis'
export const getNewProducts = createAsyncThunk('product/newProducts',async(data, {rejectWithValue})=>{
    const response = await apis.apiGetProduct({sort: '-createdAt'})

    if(response.success){
        return response.products
    }
    else{
        return rejectWithValue(response)
    }
})