module.exports = {
    'UnitTest STAFF: Controller': {
        'STFF1-1_POST_/api/staff_200_AddStaffMissingInput': {
            mock: {
                body: {
                    firstName: "Duy",
                    lastName: "Nguyen Ngoc",
                    avatar: "https://res.cloudinary.com/dt4gbimrk/image/upload/v1714911845/ecommerce/pwy7r8ykuypjch3brstj.png",
                    mobile: "0938673888",
                    email: "nnduy@outlook.com",
                    provider_id: "663771db2463a33c6f3a39d2"
                }
            },  
            match: {
                success: false,
                mes: "Cannot create new staff"
            }
        },
        'STFF1-2_POST_/api/staff_200_AddStaffSuccess': {
            mock: {
                body: {
                    email: "aaa@aaa.aaa",
                }
            },
            match: {}
        },
        'STFF1-3_POST_/api/staff_400_AddStaffAlreadyExist': {
            mock: {
                body: {
                    "firstName": "Duy",
                    "lastName": "Nguyen Ngoc",
                    "avatar": "https://res.cloudinary.com/dt4gbimrk/image/upload/v1714911845/ecommerce/pwy7r8ykuypjch3brstj.png",
                    "mobile": "0938673888",
                    "email": "nnduy@outlook.com",
                    provider_id: "663771db2463a33c6f3a39d2"
                }
            },  
            match: {
                success: false,
                mes: "Cannot create new staff"
            }
        },

        'STFF2-1_GET_/api/staff_200_GetAllStaffsByProviderOK': {
            mock: {
                query: {
                    limit: 0,
                    page: 100
                },
                user: {
                    _id: "663771db2463a33c6f3a39d2"
                }
            },
            match: {
                success: false,
                error: 'Cannot get all service providers',
            }
        },
        'STFF2-2_GET_/api/staff_400_MissingProviderInput': {
            mock: {
                query: {
                    limit: 0,
                    page: 100
                },
                user: {
                    _id: null
                }
            },
            match: {
                success: false,
                error: 'Cannot get staffs',
            }
        },


        'STFF3-1_DELETE_/api/service_provider_400_DeleteNonExistProvider': {
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
        'STFF3-2_DELETE_/api/service_provider_400_MissingInput': {
            mock: {
                params: {}
            },
            match: {
                success: false,
                deletedServiceProvider: "Cannot delete service provider"
            }
        },


        'STFF4-1_GET_/api/service_provider/owner_400_MissingInput': {
            mock: {
                body: {
                    owner: {}
                }
            },
            match: {}
        },
        'STFF4-2_GET_/api/service_provider/owner_400_GetProviderByNonExistOwner': {
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
        }
    }
}