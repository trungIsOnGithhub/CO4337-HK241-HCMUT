module.exports = {
    'UnitTest ORDER: Controller': {
        'ORD-1_POST_/api/order/_400_CreateOrderMissingInput': {
            mock: {
                body: {

                },
                user: {

                }
            },
            match: {
                success: false,
                mes: "Missing input"
            }
        },

        'ORD-2_POST_/api/order/_400_MissingInput2': {
            mock: {
                title: "",
                content: null
            },
            match: {
                success: false,
                mes: "Missing input"
            }
        },

        'ORD-3_PUT_/order/update_status/:bid_404_UpdateStatusNoExist': {
            mock: {
                params: {
                    id: "66377327edf989f1ae865513"
                },
                file: {
                    path: "https://monngonmoingay.com/wp-content/smush-webp/2024/10/Bap-hat-chien-gion-2.png.webp"
                }
            },
            match: {
                status: true,
                uploadImage: {}
            }
        },

        'ORD-4_PUT_/api/order/_GetUserOrderNotExist': {
            mock: {
                params: {
                    bid: "66377327edf989f1ae865513"
                },
                // body: {
                //     title: "New Sample Title3"
                // }
            },
            match: {
                updatedBlog: []
            }
        },

        'ORD-5_POST_/api/order/_200_GetOrdersByAdminFail': {
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
        'ORD-6_POST_/api/order/staff_calendar_400_getOrdersForStaffCalendarError': {
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