module.exports = {
    'UnitTest SERVICE: Controller': {
        'SVC1-1_POST_/api/service_200_CreateServiceMissingInput': {
            mock: {
                body: {}
            },
            match: {}
        },
        'SVC1-2_POST_/api/service_400_CreateServiceOK': {
            mock: {
                body: {
                    name: "Yoga Class For Beginner",
                    description: [
                      "<p>Relax and Soothe your muscle with our Yoga Professionals.</p>\r\n<p>Suitable for All Members</p>"
                    ],
                    price: 880000,
                    category: "Yoga",
                    duration: 50,
                    provider_id: "663771db2463a33c6f3a39d2",
                    assigned_staff: [],
                    variantss: [],
                    hour: 1,
                    minute: 0
                },
                files: {
                    thumb: "https://res.cloudinary.com/dt4gbimrk/image/upload/v1714912894/ecommerce/o770lsinlsnvjazpyedb.jpg",
                    images: [
                        "https://res.cloudinary.com/dt4gbimrk/image/upload/v1714912894/ecommerce/uwz4dsugfbquub80mrvo.jpg"
                    ]
                }
            },  
            match: {
                success: true,
                mes: 'Created successfully'
            }
        },

        'SVC2-1_POST_/api/service_200_AdminUpdateServiceOK': {
            mock: {
                params: {
                    sid: "66377b05e479e46dab038112"
                },
                body: {
                    "price": 980000
                }
            },
            match: {
                success: true,
                mes: 'Updated successfully'
            }
        },
        'SVC2-2_POST_/api/service_400_MissingInputError': {
            mock: {
                params: {
                    sid: null
                }
            },
            match: {}
        },
        'SVC2-3_POST_/api/service_400_AdminUpdateNotFoundService': {
            mock: {
                params: {
                    sid: "69388b05e479a46dab038112"
                },
                body: {
                    "category": "Barber",
                }
            },
            match: {
                success: false,
                mes: "Cannot update service"
            }
        },


        'SVC3-1_GET_/api/service_400_MissingInput': {
            mock: {
                user: null
            },
            match: {}
        },
        'SVC3-2_GET_/api/service_400_GetAllServiceByAdminOK': {
            mock: {
                user: {
                    _id: "663771db2463a33c6f3a39cf"
                }
            },
            match: {
                success: true,
                counts: 0,
                services: [],
            }
        },

        // 'SVC2-1_POST_/api/service_200_CreateServiceOK': {
        //     mock: {
        //         body: {
        //             "email": "nvlong@outlook.com",
        //             "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
        //         }
        //     },
        //     match: {
        //         success: false,
        //         mes: "Missing input"
        //     }
        // },
        // 'SVC2-2_POST_/api/service_200_CreateServiceOK': {
        //     mock: {
        //         body: {
        //             "email": "nvlong@outlook.com",
        //             "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
        //         }
        //     },
        //     match: {
        //         success: false,
        //         mes: "Missing input"
        //     }
        // },

        // 'SVC2-1_POST_/api/service_200_CreateServiceOK': {
        //     mock: {
        //         body: {
        //             "email": "nvlong@outlook.com",
        //             "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
        //         }
        //     },
        //     match: {
        //         success: false,
        //         mes: "Missing input"
        //     }
        // },
        // 'SVC2-2_POST_/api/service_200_CreateServiceOK': {
        //     mock: {
        //         body: {
        //             "email": "nvlong@outlook.com",
        //             "password": "$2b$10$7C..IuefFhV2SAo1yvvcQeK/xAD1UZgzQVtHTlCCK1fDs.XW4qsEq",
        //         }
        //     },
        //     match: {
        //         success: false,
        //         mes: "Missing input"
        //     }
        // },
    }
}