module.exports = {
    'UnitTest APP: Middlewares': {
        'MDW2-1_401_RequireAuthentication': {
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

        'BL2-2_POST_/api/blog/_400_MissingInput': {
            mock: {
                title: "",
                content: null
            },
            match: {
                statusCode: 401,
                success: false,
                mes: "Missing input"
            }
        }
    }
}