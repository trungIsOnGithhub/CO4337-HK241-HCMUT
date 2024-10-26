module.exports = {
    'Test Sample 1 - Blog API': {
        'BL2-1_POST_/api/blog/_200_CreateSuccess': {
            mock: {
                body: {
                    title: "sample",
                    content: "sample"
                }
            },
            match: {
                createBlog: {
                    _id: "66377327edf989f1ae865513",
                    title: "Sample Title",
                    content: "An interesting blog...",
                    category: "Sample category",
                    numberView: 9999,
                    likes:[],
                    dislikes:[],
                    image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.123rf.com%2Fphoto_133391293_creative-blogging-sketch-on-white-brick-wall-background-blog-and-media-concept-3d-rendering.html&psig=AOvVaw0nd0jBQJauaxJrqQ8TtS9z&ust=1699960308658000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLia9eTrwIIDFQAAAAAdAAAAABAI"
                }
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