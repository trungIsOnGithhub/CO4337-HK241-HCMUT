module.exports = {
    'UnitTest USER: Controller': {
        'USR1-1_POST_/api/user/register_200_RegisterAdminSuccess': {
            mock: {
                body: {
                    "firstName": "Long Clone",
                    "lastName": "Nguyenn",
                    "email": "nvlongclone@outlook.com",
                    "mobile": "0980234588",
                    "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
                    "role": 1411,
                }
            },
            match: {
                cookie: "",
                success:  true,
                mes: "Please check your email to active accout!"
            }
        },

        'USR1-2_POST_/api/user/register_400_UserAlreadyExist': {
            mock: {
                body: {
                    "firstName": "Long",
                    "lastName": "Nguyen Van",
                    "email": "nvlong@outlook.com",
                    "mobile": "0980234568",
                    "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
                    "role": 1411,
                }
            },
            match: {
                success: false,
                mes: "Missing input"
            }
        },

        'BL2-1_POST_/api/blog/:bid_400_LoginFailed': {
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

        'BL2-4_PUT_/api/blog/:bid_200_UpdateSuccess': {
            mock: {
                params: {
                    bid: "66377327edf989f1ae865513"
                },
                body: {
                    title: "New Sample Title3"
                }
            },
            match: {
                updatedBlog: []
            }
        },

        'BL2-5_POST_/api/blog/like_200_LikeSuccess': {
            mock: {
                body: {
                    _id: "66377327edf989f1ae865588",
                    bid: "66377327edf989f1ae865513"
                }
            },
            match: {
                success: true,
                rs: {}
            }
        },
        'BL2-6_POST_/api/blog/like_400_LikeThrowError': {
            mock: {
                body: {
                    _id: null,
                    bid: null
                }
            },
            match: {}   
        },

        'BL2-7_POST_/api/blog/dislike_200_DislikeSuccess': {
            mock: {
                body: {
                    _id: "66377327edf989f1ae865588",
                    bid: "66377327edf989f1ae865513"
                }
            },
            match: {
                success: true,
                rs: {}
            }
        },
        'BL2-8_POST_/api/blog/dislike_400_DislikeThrowError': {
            mock: {
                body: {}
            },
            match: {}   
        },

        'BL2-9_POST_/api/blog/top_tags_200_GetTopTagsSuccess': {
            mock: {
                body: {
                    // limit 0 return nothing
                    limit: 0
                }
            },
            match: {
                success: true,
                tags: []
            }      
        }
    }
}