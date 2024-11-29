module.exports = {
    'UnitTest PROVIDER: Controller': {
        'PRVD1-1_POST_/api/service_provider_200_CreateProviderMissingInput': {
            mock: {
                body: {
                    email: "cc@cc.cccc"
                }
            },  
            match: {
                success: false,
                mes: "Missing input"
            }
        },
        'PRVD1-3_POST_/api/service_provider_400_CreateProviderAlreadyExist': {
            mock: {
                body: {
                    email: "aaa@aaa.aaa",
                    password: "",
                    firstName: "QQQQQQQ",
                    lastName: "AAAAAAAA",
                    mobile: "099999999",
                    bussinessName: "aaaaaaaaaaaa",
                    province: "qqqqqqq"
                }
            },
            match: {
                success: false,
                mes: "User has existed already"
            }
        },
        'PRVD1-2_POST_/api/service_provider_200_CreateProviderSuccess': {
            mock: {
                body: {
                    email: "aaa@aaa.aaa",
                    password: "",
                    firstName: "QQQQQQQ",
                    lastName: "AAAAAAAA",
                    mobile: "099999999",
                    bussinessName: "aaaaaaaaaaaa",
                    province: "qqqqqqq"
                }
            },
            match: {
                success: true,
                mes: "Created Provider and Account Successful"
            }
        },


        'PRVD2-1_GET_/api/service_provider_200_GetAllProviderTimeout': {
            mock: {
                query: {
                    limit: 0,
                    page: 100
                }
            },
            match: {
                success: false,
                error: 'Cannot get all service providers',
            }
        },
        'PRVD2-2_GET_/api/service_provider_400_GetNoProvider': {
            mock: {
                query: {
                    limit: 0,
                    page: 100
                }
            },
            match: {
                success: true,
                counts: 0,
                AllServiceProviders: [],
            }
        },


        'PRVD3-1_DELETE_/api/service_provider_400_DeleteNonExistProvider': {
            mock: {
                params: {
                    cid: "663771db2463a33c6f3ahhhh"
                }
            },
            match: {
                success: false,
                deletedServiceProvider: "Cannot delete service provider"
            }
        },
        'PRVD3-2_DELETE_/api/service_provider_400_MissingInput': {
            mock: {
                params: {}
            },
            match: {
                success: false,
                deletedServiceProvider: "Cannot delete service provider"
            }
        },


        'PRVD4-1_GET_/api/service_provider/owner_400_MissingInput': {
            mock: {
                body: {
                    owner: {}
                }
            },
            match: {}
        },
        'PRVD4-2_GET_/api/service_provider/owner_400_GetProviderByNonExistOwner': {
            mock: {
                body: {
                    owner: {
                        _id: "aaaaaaaaaaaaaaa"
                    }
                }
            },
            match: {
                success: false,
                provider:   "Cannot get service provider"
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
    }
}