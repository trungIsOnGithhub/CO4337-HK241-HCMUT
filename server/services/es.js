const { Client } = require('@elastic/elasticsearch');
// const { match } = require('assert');
// const { kMaxLength } = require('buffer');
const fs = require('fs');
const ELASTIC_INDEX_NAME_MAP = require('./constant');
// const { constrainedMemory } = require('process');

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

function initializeElasticClient() {
    // SECURITY OFF
    // const certFileContent = fs.readFileSync('/home/pc/Downloads/elasticsearch-8.14.3-linux-x86_64/elasticsearch-8.14.3/config/certs/http_ca.crt');

    const esClient = new Client({
        node: 'http://localhost:9200'
        // auth: {
        //    username: 'elastic',
        //    password: 'yVuVvtKOBiUBCwM1ll32'
        // }
        // tls: {
        //     ca: certFileContent,
        //     rejectUnauthorized: false
        // }
    });

    return esClient;
}

async function setUpElasticConnection() {
    const esClient = initializeElasticClient();

    if (! (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.SERVICES })) ) {
        const response = await esClient.indices.create({
            index: ELASTIC_INDEX_NAME_MAP.SERVICES,
            // settings: {
            //   number_of_shards: 1, // default only 1 shard
            // },
            mappings: {
            properties: {
                id: {
                    type: "text"
                },
                name: {
                    type: "text"
                },
                category: {
                    type: "text"
                },
                providername: {
                    type: "text"
                },
                province: {
                    type: "text"
                },
                price: {
                    type: "float"
                },
                locations : {
                    type : "geo_point"
                },
                totalRatings: {
                    type: "integer"
                },
                isHidden:{
                    type: "boolean"
                }
            },
            },
        });
        console.log('CREATE SERVICES IDX RESPONSE', response);
    }

    if (! (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.PROVIDERS })) ) {
        const response = await esClient.indices.create({
            index: ELASTIC_INDEX_NAME_MAP.PROVIDERS,
            // settings: {
            //   number_of_shards: 1, // default only 1 shard
            // },
            mappings: {
                properties: {
                    id: {
                        type: "text"
                    },
                    bussinessName: {
                        type: "text"
                    },
                    mobile: {
                        type: "text"
                    },
                    address: {
                        type: "text",
                    },
                    province: {
                        type: "keyword"
                    },
                    locations : {
                        type : "geo_point"
                    },
                    isHidden:{
                        type: "boolean"
                    }
                }
            },
        });
        console.log('CREATE SERVICES IDX RESPONSE', response);
    }

    if (! (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.BLOGS })) ) {
        const response = await esClient.indices.create({
            index: ELASTIC_INDEX_NAME_MAP.BLOGS,
            // settings: {
            //   number_of_shards: 1, // default only 1 shard
            // },
            mappings: {
            properties: {
                title: {
                    type: "text"
                },
                category: {
                    type: "text"
                },
                // content:{
                //     type:Array,
                //     required:true
                // },
                providername: {
                    type: "text"
                },
                tags:{
                    type: "keyword"
                },
                createdAt:{
                    type: "date"
                },
                numberView: {
                    type: "integer"
                },
                likes: {
                    type: "integer"
                },
                dislikes: {
                    type: "integer"
                },
                authorname: {
                    type: "text"
                },
                isHidden:{
                    type: "boolean"
                }
            },
            },
        });
        console.log('CREATE BLOGS IDX RESPONSE', response);
    }
}

async function resetElasticConnection(indexToDelete) {
    const esClient = initializeElasticClient();

    const deleteResponse1 = await esClient.indices.delete({ index: indexToDelete });
    console.log(`DELETE ${indexToDelete} RESPONSE1`, deleteResponse1);
}

async function fullTextSearchAdvanced(indexName, searchTerm, fieldNameArrayToMatch,
                fieldNameArrayToGet, limit, offset, elasticSortScheme,
                geoFilter, geoSort, categoriesIncluded, province, tagsIncluded, includeHidden) {
    const esClient = initializeElasticClient();

    const numLimit = +limit;
    const numOffset = +offset;
    const elementOffset = numOffset * numLimit;

    const hiddenTerm = includeHidden ?
    {
        terms: {
            isHidden: [false, true]
        }
    }
    :
    {
        term: {
            isHidden: false
        }
    };

    const queryObject = {
        index: indexName,
        track_scores: true,
        query: {
            bool: {
                must: [hiddenTerm]
            }
        },
        size: numLimit,
        from: elementOffset,
        _source: fieldNameArrayToGet,
        sort:[]
    };

    if (searchTerm?.length) {
        // if (!queryObject.query.bool.must) queryObject.query.bool.must = [];

        queryObject.query.bool.must.push({
            multi_match: {
                query: searchTerm,
                fields: fieldNameArrayToMatch,
                fuzziness : "AUTO",
                prefix_length : 2
            }
        });

        delete queryObject.query.match_all;
    }

    if (province?.length) {
        // if (!queryObject.query.bool.must) queryObject.query.bool.must = [];

        queryObject.query.bool.must.push({
            match: {
                province
            }
        });

        delete queryObject.query.match_all;
    }

    // if (!queryObject.query.bool?.must?.length) {
    //     delete queryObject.query.bool;
    // }

    if (geoFilter?.distanceText && geoFilter?.clientLat && geoFilter?.clientLon) {
        // if (!queryObject.query.bool.must) queryObject.query.bool.must = [];

        queryObject.query.bool.must.push({
            geo_distance: {
                distance: geoFilter.distanceText,// example: '200km', '188m'...
                locations: {
                    lat: geoFilter.clientLat,
                    lon: geoFilter.clientLon
                }
            }
        });

        delete queryObject.query.match_all;
    }

    if (!queryObject.query.bool?.must?.length) {
        delete queryObject.query.bool;
    }

    if (geoSort?.unit && geoSort?.order) {
        console.log('========:::::::', geoFilter);
        queryObject.sort.push({
            _geo_distance:{
                locations: {
                    lat: geoFilter.clientLat,
                    lon: geoFilter.clientLon
                },
                unit: geoSort.unit,
                // distance_type:"plane",
                order: geoSort.order
            }
        });
    }
    if (elasticSortScheme?.length) {
        queryObject.sort = [...queryObject.sort, ...elasticSortScheme];
    }

    if (categoriesIncluded?.length && queryObject?.query) {
        if (!queryObject.query.bool) queryObject.query.bool = {};
        // queryObject.query.bool.filter = categoriesIncluded.map(categoryLabel => { return { term: { catergory: categoryLabel } }; });
        if (!queryObject.query.bool.must) queryObject.query.bool.must = [];

        for (const categoryLabel of categoriesIncluded) {
            queryObject.query.bool.must.push({
                match: {
                    category: categoryLabel
                }
            });
        }

        delete queryObject.query.match_all;
    }

    if (tagsIncluded?.length && queryObject?.query) {
        // if (!queryObject.query.bool) queryObject.query.bool = {};
        // queryObject.query.bool.filter = categoriesIncluded.map(categoryLabel => { return { term: { catergory: categoryLabel } }; });
        // if (!queryObject.query.bool.must) queryObject.query.bool.must = [];

        for (const tagLabel of tagsIncluded) {
            queryObject.query.bool.must.push({
                term: {
                    tags: tagLabel
                }
            });
        }

        delete queryObject.query.match_all;
    }

    console.log("QUERY OBJECT: ",JSON.stringify(queryObject), "END QUERY OBJECT");

    const elasticResponse = await esClient.search(queryObject);
    console.log(elasticResponse?.hits);

    return elasticResponse;
}

const addToElasticDB = async function(indexName, dataPayload, id) {
    const esClient = initializeElasticClient();
    if (!indexName || !dataPayload) {
        throw new Error("Invalid populate ES Input!");
    }
    if (!esClient) {
        throw new Error("ES Client not found!");
    }

    return await esClient.index({
        index: indexName,
        id,
        body: dataPayload
    })
}

const isHealthStatusOKElasticDB = async function(esClient) {
    const response = await esClient.cluster.health({
        timeout: ELASTIC_INDEX_NAME_MAP.HEALTH_STATUS_TIMEOUT,
    });
    return (response?.status === "green" || response?.status === "yellow")
}

const queryElasticDB = async function(indexName, queryOptionsObject) {
    const esClient = initializeElasticClient();
    if (!indexName || !queryOptionsObject) {
        throw new Error("Invalid populate ES Input!");
    }
    if (!esClient) {
        throw new Error("ES Client not found!");
    }

    return await esClient.search({
        index: indexName,
        ...queryOptionsObject
    });
};

const multiFunc = async function(indexName, init, reset) {
    // const esClient = initializeElasticClient();
    if (init) {
        await setUpElasticConnection();
        return;
    }
    if (reset) {
        const esClient = initializeElasticClient();
        if (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.SERVICES })) {
            resetElasticConnection(ELASTIC_INDEX_NAME_MAP.SERVICES);
        }
        if (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.BLOGS })) {
            resetElasticConnection(ELASTIC_INDEX_NAME_MAP.BLOGS);
        }
        if (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.PROVIDERS })) {
            resetElasticConnection(ELASTIC_INDEX_NAME_MAP.PROVIDERS);
        }
        return;
    }

//     //  }
//     // else {
//         // const stats = await esClient?.indices?.stats({ index: indexName });
//         // const indexPStat = stats?.indices[indexName]?.primaries;

//         // if (indexPStat?.docs?.count > 3) {
//         //     await esClient.indices.delete({ index: indexName });
//         //     console.log('Overcount on Index Document, Deleted Index');
//         //     return;
//         // }   
//     // }

    // const response1 = await esClient.indices.analyze({
    //     index: indexName,
    //     text: "bà rịa-vũng tàu",
    // });
    // console.log('---->', response1 ,'------');

    // const qAllTest = await queryElasticDB(indexName, {
    //     query: {
    //         // bool: {
    //         //     must: [
    //         //         {
    //         //             match: { f1: "vũng tàu" }
    //         //         }
    //         //     ],
    //         //     filter: {
    //         //         term: { id: "1" }
    //         //     }
    //         // }
    //         match_all: {}
    //     }
    //     // sort: [
    //     //     { f2: { order: 'desc' } }
    //     // ]
    // });
    // // console.log("TEST ALL DOC QUERY", qAllTest?.hits,"TEST ALL DOC QUERY");
    // console.log("TEST ALL DOC QUERY INNER", qAllTest?.hits?.hits,"TEST ALL DOC QUERY INNER");
    // console.log("*****************************************");

    // const q1 = await fullTextSearchAdvanced(ELASTIC_INDEX_NAME_MAP.SERVICES,
    //     "vung tau",
    //     ["name", "category", "providername", "province"],
    //     ["id", "name", "providername", "category"], 10, 0,
    // 	[ {price : {order : "asc"}} ],
    //     { distanceText: "2000km", clientLat: 45, clientLon: 45 },
    //     { unit: "km", order: "desc" }, []);

    // // searchTerm, fieldNameArrayToMatch, fieldNameArrayToGet, limit, offset, elasticSortScheme, geoFilter
    // const hitsRecord = q1?.hits?.hits?.map(record => {
    //     return {
    //         score: record._score,
    //         source: JSON.stringify(record._source),
    //         sort: JSON.stringify(record.sort)
    //     };
    // });
    // console.log('++++++++++++++', q1?.hits , '=======================');
    // console.log("~~~~~~~~", hitsRecord, "**********");


    const q2 = await fullTextSearchAdvanced(ELASTIC_INDEX_NAME_MAP.BLOGS,
        "du lich",
        ["title", "category", "providername", "authorname"],
        ["id", "title", "providername", "authorname", "numberView"], 10, 0,
        [ {numberView : "desc"}, {likes: "desc"} ],
        {},
        {}, []);
    const hitsRecord2 = q2?.hits?.hits?.map(record => {
        return {
            score: record._score,
            source: JSON.stringify(record._source)
        };
    });
    console.log('++++++++++++++', q2?.hits , '=======================');
    console.log("~~~~~~~~", hitsRecord2, "**********");
};

// (async function () {
// //     // // COMMENT THIS WHEN RUN MIGRATE OR ANY OTHE FILE INCLUDED THIS
// //await multiFunc(ELASTIC_INDEX_NAME_MAP.SERVICES, false, true); // TO SWITCH
// //await multiFunc(ELASTIC_INDEX_NAME_MAP.SERVICES, true, false); // TO SWITCH

// //     // await multiFunc(ELASTIC_INDEX_NAME_MAP.BLOGS, false, true); // TO SWITCH
// //     // await multiFunc(ELASTIC_INDEX_NAME_MAP.BLOGS, true, false); // TO SWITCH

// //     // await multiFunc(ELASTIC_INDEX_NAME_MAP.PROVIDERS, false, true); // TO SWITCH
    
// //     // await multiFunc(ELASTIC_INDEX_NAME_MAP.PROVIDERS, true, false); // TO SWITCH
// })();

// initializeElasticClient().indices.get({
//     index: ELASTIC_INDEX_NAME_MAP.SERVICES,
// }).then((res) => {
//     console.log("------", JSON.stringify(res));
// })

// (async function() { const esClient = initializeElasticClient();
// const response7 = await esClient.search({
//     index: "testidx",
//     query: {
//       geo_bounding_box: {
//         location: {
//           top_left: {
//             lat: 42,
//             lon: -72,
//           },
//           bottom_right: {
//             lat: 40,
//             lon: -74,
//           },
//         },
//       },
//     },
//   });
//   console.log(response7); });

// const tz = new Date().getTimezoneOffset();
// console.log(tz);

module.exports = {
    queryElasticDB,
    addToElasticDB,
    fullTextSearchAdvanced,
    isHealthStatusOKElasticDB,
    multiFunc,
    initializeElasticClient
};