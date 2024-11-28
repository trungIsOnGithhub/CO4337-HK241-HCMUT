module.exports = {
    'UnitTest APP: Middlewares': {
        'MDW1-1_IsAdmin_401_RequireAdminRole': {
            mock: {
                user: {
                    role: "0"
                }
            },
            match: {
                statusCode: 401,
                success: false,
                mes: "Require role admin"
            }
        },
        'MDW1-2_IsAdmin_200_AdminSuccess': {
            mock: {
                user: {
                    role: "1411"
                }
            },
            match: {
                statusCode: 200,
            }
        },

        'MDW2-1_VerifyAccessToken_401_RequireAuthentication': {
            mock: {
                headers: {
                    authorization: "Bearer "
                }
            },
            match: {
                statusCode: 401,
                jwtData: {
                    _id: "66377327edf989f1ae865588",
                    role: 1111,
                    expiresIn: '2d'
                }
            }
        },
        'MDW2-2_VerifyAccessToken_400_InvalidToken': {
            mock: {
                headers: {
                    authorization: "Bearer "
                }
            },
            match: {
                statusCode: 401,
                jwtData: {
                    _id: "66377327edf989f1ae865588",
                    role: 1111,
                    expiresIn: '2d'
                }
            }           
        },
        'MDW2-3_VerifyAccessToken_200_Success': {
            mock: {
                headers: {
                    authorization: "Bearer "
                }
            },
            match: {
                statusCode: 401,
                jwtData: {
                    _id: "66377327edf989f1ae865588",
                    role: 1111,
                    expiresIn: '2d'
                }
            }          
        }
    }
}