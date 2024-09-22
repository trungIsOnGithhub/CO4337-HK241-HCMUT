const path = {
    //Public
    PUBLIC: '/',
    HOME: '',
    ALL: '*',
    LOGIN: 'login',
    SERVICES_CATEGORY: 'service/:category',
    SERVICES: 'service/services',
    PRODUCTS_CATEGORY: 'product/:category',
    PRODUCTS: 'product/products',
    OUR_PROVIDERS: 'our_providers/our_providers',
    BLOGS: 'blogs',
    OUR_PROVIDERS_CATEGORY: 'our_providers/:category',
    FAQS: 'faqs',
    DETAIL_SERVICE__CATEGORY__PID__TITLE: 'service/:category/:sid/:name',
    DETAIL_PRODUCT__CATEGORY__PID__TITLE: 'product/:category/:sid/:name',
    DETAIL_PROVIDER_ID: 'detail_provider/:prid',
    FINAL_REGISTER: 'final_register/:status',
    RESET_PASSWORD: 'reset_password/:token',
    DETAIL_CART: 'detail_cart',
    CHECKOUT_SERVICE: 'checkout_service',
    CHECKOUT_PRODUCT: 'checkout_product',
    BOOKING: 'booking',
    BOOKING_DATE_TIME: 'booking_date_time',

    SERVICE_PROVIDER_REGISTER: 'sp_register',

    //chat
    CHAT: 'chat',

    //Admin
    ADMIN: 'admin',
    DASHBOARD: 'dashboard',
    MANAGE_USER: 'manage_user',
    MANAGE_STAFF: 'manage_staff',
    MANAGE_SERVICE: 'manage_service',
    MANAGE_PRODUCT: 'manage_product',
    MANAGE_ORDER: 'manage_order',
    MANAGE_BOOKING: 'manage_booking',
    MANAGE_BOOKING_DETAIL: 'manage_booking_dt',
    CREATE_PRODUCT: 'create_product',
    ADD_STAFF: 'add_staff',
    ADD_SERVICE: 'add_service',
    STAFF_CALENDAR: 'staff_calendar',
    ADD_POST: 'add_post',
    MANAGE_POST: 'manage_post',
    MANAGE_POST_DETAIL: 'manage_post_detail',
    EDIT_POST_DETAIL: 'edit_post_detail',
    VIEW_POST: 'view_post',

    ADD_VOUCHER: 'add_voucher',
    ADD_SALE_EVENT: 'add_sale_event',
    MANAGE_VOUCHER: 'manage_voucher',
    MANAGE_SALE_EVENT: 'manage_sale_event',
    MANAGE_CHAT: 'manage_chat',

    SETTING: 'setting',
    //User
    USER: 'user',
    PERSONAL: 'personal',
    MYCART: 'mycart',
    HISTORY: 'history',
    WISHLIST: 'wishlist',
    MY_SERVICE_PROVIDER: 'my_sp'
}

export default path