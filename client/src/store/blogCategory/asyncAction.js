import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from '../../apis'
export const getCategorieService = createAsyncThunk('category/categories_service',async(data, {rejectWithValue})=>{
    const response = await apis.apiGetCategorieService()

    // if(response.success){
    //     return response.serviceCategories
    // }
    // else{
    //     return rejectWithValue(response)
    // }
    return [{title: 'djaslkdjlkajdko'}]
})