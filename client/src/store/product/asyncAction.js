import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from '../../apis'
export const getNewProducts = createAsyncThunk('product/newProducts',async(data, {rejectWithValue})=>{
    const response = await apis.apiGetServicePublic()
    // {sort: '-createdAt'}

    if(response.success){
        return response.services
    }
    else{
        return rejectWithValue(response)
    }
})