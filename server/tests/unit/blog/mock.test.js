module.exports = {
    'Test Sample 1 - Blog API': {
        'BL2-1_POST_/api/blog/_200_CreateSuccess': {
            mock: {
                title: "",
                content: null
            },
            match: {
                success: false,
                mes: "Missing input"
            }
        },
        'BL2-2_POST_/api/blog/_400_MissingInput': {
            mock: {
                title: "",
                content: null
            },
            match: {
                success: false,
                mes: "Missing input"
            }
        }
    }
}