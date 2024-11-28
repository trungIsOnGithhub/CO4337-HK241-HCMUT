module.exports = {
    'UnitTest BLOG: Controller': {
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
        },

        'BL2-3_PUT_/upload_image/:bid_200_UploadImageSuccess': {
            mock: {
                params: {
                    bid: "66377327edf989f1ae865513"
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

        'BL2-4_PUT_/api/blog/:bid_200_UpdateSuccess': {
            mock: {
                params: {
                    bid: "66377327edf989f1ae865513"
                },
                body: {
                    title: "New Sample Title3"
                }
            },
            match: {
                updatedBlog: []
            }
        },

        'BL2-5_POST_/api/blog/like_200_LikeSuccess': {
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
        'BL2-6_POST_/api/blog/like_400_LikeThrowError': {
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