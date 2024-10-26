module.exports = {
    'UnitTest USER: Controller': {
        'USR1-1_POST_/api/user/register_200_RegisterAdminSuccess': {
            mock: {
                body: {}
            },
            match: {}
        },

        'USR1-2_POST_/api/user/register_400_UserAlreadyExist': {
            mock: {
                body: {
                    
                },
                files: {
                    thumb: [],
                    images: []
                },
            match: {
                success: false,
                mes: "Missing input"
            }
        },

        'USR2-1_POST_/api/blog/login_400_LoginFailed': {
            mock: {
                body: {
                    "email": "nvlong@outlook.com",
                    "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
                }
            },
            match: {
                success: false,
                mes: "Missing input"
            }
        },

        'USR2-2_POST_/api/blog/login_400_LoginSuccess': {
            mock: {
                body: {
                    "email": "nvlong@outlook.com",
                    "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
                }
            },
            match: {
                success: true,
                accessToken: "",
                userData: {}
            }
        },

        'USR2-3_POST_/api/blog/login_400_AccountBlocked': {
            mock: {
                body: {
                    "email": "nvlong@outlook.com",
                    "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
                }
            },
            match: {
                success: false,
                mes: "Account is blocked"
            }
        },

        'USR3-1_POST_/api/blog/logout_400_LogoutFaikedNoCookie': {
            mock: {},
            match: {}   
        },
        'USR3-2_POST_/api/blog/logout_200_LogoutOK': {
            mock: {
                cookie: ""
            },
            match: {
                success: true,
                rs: {}
            }
        },
        'USR3-3_POST_/api/blog/logout_200_LogoutNotFound': {
            mock: {},
            match: {}   
        },


        'BL4-1_POST_/api/blog/forgotpassword_400_UserNotFound': {
            mock: {
                body: {
                    email: "aaaaa@aaa.aa" // invalid email
                }
            },
            match: {}  
        },
        'BL4-2_POST_/api/blog/forgotpassword_400_MissingEmail': {
            mock: {
                body: {}
            },
            match: {} 
        },
        'BL4-3_POST_/api/blog/forgotpassword_400_ForgotPasswordOK': {
            mock: {
                body: {
                    email: "nvlong@outlook.com" // invalid email
                }
            },
            match: {
                success: true,
                mes: "Please check your email"
            } 
        }
    }
}