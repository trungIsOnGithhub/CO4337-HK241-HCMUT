module.exports = {
    'BLOG GET 1': {
        'BL1_/api/blog/_400_Missing input': {
            mock: {
                searchTerm: "",
                selectedTags: []
            },
            match: {
                success: false,
                mes: "Missing input"
            },
            httpStatusCode: 500
        }
    }
}