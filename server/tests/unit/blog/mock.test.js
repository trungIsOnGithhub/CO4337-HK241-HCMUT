module.exports = {
    'Test Sample 1 - Blog API': {
        'BL2-1_POST_/api/blog/_200_OK': {
            mock: {
                searchTerm: "",
                selectedTags: []
            },
            match: {
                success: false,
                mes: "Missing input"
            }
        }
    }
}