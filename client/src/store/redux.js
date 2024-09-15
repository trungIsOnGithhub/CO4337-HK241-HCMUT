import { configureStore } from '@reduxjs/toolkit';
import appSlice from './app/appSlice';
import productSlice from './product/productSlice';
import userSlice from './user/userSlice';
import categorySlice from './category/categorySlice';
import blogCategorySlice from './blogCategory/blogCategorySlice';
import storage from 'redux-persist/lib/storage';
import {persistReducer, persistStore,FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER} from 'redux-persist';

const commonConfig = {
  storage
}
const userConfig = {
  ...commonConfig,
  whitelist: ['token', 'isLogin', 'current', 'currentCartService', 'currentCartProduct'],
  key: 'shop/user'
}

const productConfig = {
  ...commonConfig,
  whitelist: ['dealDaily'],
  key: 'shop/deal'
}


export const store = configureStore({
  reducer: {
    app: appSlice,
    product: persistReducer(productConfig, productSlice),
    user: persistReducer(userConfig,userSlice),
    category: categorySlice,
    blogCategory: blogCategorySlice
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});
export const persistor = persistStore(store);