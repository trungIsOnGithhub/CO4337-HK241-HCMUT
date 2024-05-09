const path = {
    //Public
    PUBLIC: '/',
    HOME: '',
    ALL: '*',
    LOGIN: 'login',
    PRODUCTS__CATEGORY: ':category',
    BLOGS: 'blogs',
    OUR_SERVICES: 'our_services',
    FAQS: 'faqs',
    DETAIL_PRODUCT__CATEGORY__PID__TITLE: ':category/:sid/:name',
    FINAL_REGISTER: 'final_register/:status',
    RESET_PASSWORD: 'reset_password/:token',
    DETAIL_CART: 'detail_cart',
    CHECKOUT: 'checkout',
    PRODUCTS: 'services',
    BOOKING: 'booking',
    BOOKING_DATE_TIME: 'booking_date_time',

    SERVICE_PROVIDER_REGISTER: 'sp_register',


    //Admin
    ADMIN: 'admin',
    DASHBOARD: 'dashboard',
    MANAGE_USER: 'manage_user',
    MANAGE_STAFF: 'manage_staff',
    MANAGE_SERVICE: 'manage_service',
    MANAGE_PRODUCT: 'manage_product',
    MANAGE_ORDER: 'manage_order',
    CREATE_PRODUCT: 'create_product',
    ADD_STAFF: 'add_staff',
    ADD_SERVICE: 'add_service',

    //User
    USER: 'user',
    PERSONAL: 'personal',
    MYCART: 'mycart',
    HISTORY: 'history',
    WISHLIST: 'wishlist',
    MY_SERVICE_PROVIDER: 'my_sp'
}

export default path