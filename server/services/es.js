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
                }
              },
            },
        });
        console.log('CREATE SERVICES RESPONSE', response);
    }

    if (! (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.BLOGS })) ) {
        const response = await esClient.indices.create({
            index: ELASTIC_INDEX_NAME_MAP.BLOGS,
            settings: {
              number_of_shards: 1, // default only 1 shard
            },
            mappings: {
              properties: {
                field1: {
                  type: "text",
                },
              },
            },
        });
        console.log('CREATE BLOGS RESPONSE', response);
    }
}

async function resetElasticConnection(indexToDelete) {
    const esClient = initializeElasticClient();

    const deleteResponse1 = await esClient.indices.delete({ index: indexToDelete });
    console.log(`DELETE ${indexToDelete} RESPONSE1`, deleteResponse1);
}

async function fullTextSearchAdvanced(searchTerm, fieldNameArrayToMatch,
                fieldNameArrayToGet, limit, offset, elasticSortScheme,
                geoFilter, geoSort, categoriesIncluded) {
    const esClient = initializeElasticClient();

    const queryObject = {
        index: ELASTIC_INDEX_NAME_MAP.SERVICES,
        track_scores: true,
        query: {
            bool: {},
            match_all: {}
        },
        size: limit,
        from: offset,
        _source: fieldNameArrayToGet,
        sort:[]
    };

    if (searchTerm?.length) {
        if (!queryObject.query.bool.must) queryObject.query.bool.must = [];

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

    // if (!queryObject.query.bool?.must?.length) {
    //     delete queryObject.query.bool;
    // }

    if (geoFilter?.distanceText && geoFilter?.clientLat && geoFilter?.clientLon) {
        if (!queryObject.query.bool.must) queryObject.query.bool.must = [];

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
        queryObject.sort.push(            {
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
        queryObject.query.filter = {
            bool: {
                should: categoriesIncluded.map(categoryLabel => { return { term: { catergory: categoryLabel } }; })
            }
        };
    }

    console.log("QUERY OBJECT: ",JSON.stringify(queryObject), "END QUERY OBJECT");
    console.log("============================================");

    const elasticResponse = await esClient.search(queryObject);
    console.log(elasticResponse?.hits);

    return elasticResponse;
}

const addToElasticDB = async function(indexName, dataPayload) {
    const esClient = initializeElasticClient();
    if (!indexName || !dataPayload) {
        throw new Error("Invalid populate ES Input!");
    }
    if (!esClient) {
        throw new Error("ES Client not found!");
    }

    return await esClient.index({
        index: indexName,
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

const multiFunc = async function(init, reset) {
    // const esClient = initializeElasticClient();
    const indexName = ELASTIC_INDEX_NAME_MAP.SERVICES;
    if (init) {
        // console.log("INDEX NAME: " + indexName);
        // // const oldIndexName = "sampleindex";
        // // if (!esClient?.indices?.exists({ index: indexName })) {
        // //     console.log('Index Not Found, Inserted Data To Make It Available.');
    
        // //     const stats = await esClient?.indices?.stats({ index: indexName });
        // //     const indexPStat = stats?.indices[indexName]?.primaries;
    
        // //     if (indexPStat?.docs?.count > 3) {
        // //         await esClient.indices.delete({ index: indexName });
        // //         console.log('Overcount on Index Document, Deleted Index');
        // //         return;
        // //     }
        // // const responseDel = await esClient.indices.delete({ index: indexName });
        // // console.log("delete index response: ", responseDel);
        // // const response = await esClient.indices.create({
        // //     index: indexName,
        // //     settings: {
        // //       analysis: {
        // //         analyzer: {
        // //           default: {
        // //             type: "custom",
        // //             tokenizer: "standard",
        // //             filter: ["lowercase", "asciifolding"],
        // //           },
        // //         },
        // //       },
        // //     },
        // // });
        // // console.log("create index response: ", response);
        await setUpElasticConnection();
    
        // await addToElasticDB(indexName, {id: "dhu91udoawi9d180i2019iss", name: "Cat Toc 1", province:"Ho Chi Minh", providername:"Abcd' Hair Salon", category:"Baber Shop",
        // locations: {
        //     lat: getRandomInRange(-90, 90, 1),
        //     lon: getRandomInRange(-90, 90, 1)
        // }, price: 6666.888});
        // await addToElasticDB(indexName, {id: "djaoisd919e09wdasihd7119", name: "Massage Thao Moc", province:"tp vung tau", providername:"Abcd' Hair Salon", category:"Healthcare", 
        //     locations: {
        //         lat: getRandomInRange(-90, 90, 1),
        //         lon: getRandomInRange(-90, 90, 1)
        //     }, price: 9999.888});
        // await addToElasticDB(indexName, {id: "37uissiQiic90w1i90ei1839", name: "Kham Tong Quat ", province:"Binh Duong", providername:"Abcd' Hair Salon", category:"Baber Shop",
        //     locations: {
        //         lat: getRandomInRange(-90, 90, 1),
        //         lon: getRandomInRange(-90, 90, 1)
        //     }, price: 8888.888});
        // await addToElasticDB(indexName, {id: "37uissioiic9dai90ei18839", name: "Tu Van Suc Khoe ", province:"Binh Duong", providername:"Abcd' Hair Salon", category:"Healthcare",
        //     locations: {
        //         lat: getRandomInRange(-90, 90, 1),
        //         lon: getRandomInRange(-90, 90, 1)
        //     }, price: 6666.888});
        // await addToElasticDB(indexName, {id: "37uiss655iic90w1i90ei1839", name: "Vat ly tri Lieu", province:"Vung Tau", providername:"Y Hoc Co Truyen 86", category:"Healthcare", 
        //     locations: {
        //         lat: getRandomInRange(-90, 90, 1),
        //         lon: getRandomInRange(-90, 90, 1)
        //     }, price: 6699.888});
        // await addToElasticDB(indexName, {id: "37uikk655iic90w1i90ei1839", name: "Tu van tao kieu toc", province:"Ba Ria - Vung Tau", providername:"HEHE Baber", category:"Baber Shop",
        //     locations: {
        //         lat: getRandomInRange(-90, 90, 1),
        //         lon: getRandomInRange(-90, 90, 1)
        //     }, price: 6688.888});
        // await addToElasticDB(indexName, {id: "37uikk655iic90w1i90e88839", name: "Tu van tao kieu toc", province:"Ba Ria - Vung Tau", providername:"HEHE Baber", category:"Baber Shop",
        // locations: {
        //     lat: 46,
        //     lon: 45
        // }, price: 8899.888});
        // await addToElasticDB(indexName, {id: "37uikk655iic90w1i90ei9939", name: "Tu van tao kieu toc", province:"Ba Ria - Vung Tau", providername:"HEHE Baber", category:"Baber Shop",
        // locations: {
        //     lat: 45,
        //     lon: 46
        // }, price: 889.888});
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

    const qAllTest = await queryElasticDB(indexName, {
        query: {
            // bool: {
            //     must: [
            //         {
            //             match: { f1: "vũng tàu" }
            //         }
            //     ],
            //     filter: {
            //         term: { id: "1" }
            //     }
            // }
            match_all: {}
        }
        // sort: [
        //     { f2: { order: 'desc' } }
        // ]
    });
    // console.log("TEST ALL DOC QUERY", qAllTest?.hits,"TEST ALL DOC QUERY");
    console.log("TEST ALL DOC QUERY INNER", qAllTest?.hits?.hits,"TEST ALL DOC QUERY INNER");
    console.log("*****************************************");

    const q1 = await fullTextSearchAdvanced("vung tau",
        ["name", "category", "providername", "province"],
        ["id", "name", "providername", "category"], 10, 0,
		[ {price : {order : "asc"}} ],
        { distanceText: "2000km", clientLat: 45, clientLon: 45 },
        { unit: "km", order: "desc" }, []);

    // searchTerm, fieldNameArrayToMatch, fieldNameArrayToGet, limit, offset, elasticSortScheme, geoFilter
    const hitsRecord = q1?.hits?.hits?.map(record => {
        return {
            score: record._score,
            source: JSON.stringify(record._source),
            sort: JSON.stringify(record.sort)
        };
    });
    console.log('++++++++++++++', q1?.hits , '=======================');
    console.log("~~~~~~~~", hitsRecord, "**********");

//     // if (q1?.id) {
//     //     const q2 = await deleteEs(indexName, q1?.id);
//     // }
};


// COMMENT THIS WHEN RUN MIGRATE OR ANY OTHE FILE INCLUDED THIS
// (async function () {
//     await multiFunc(false, true);
//     await multiFunc(true, false);
//     await multiFunc(false, false);
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

module.exports = {
    queryElasticDB,
    addToElasticDB,
    fullTextSearchAdvanced,
    isHealthStatusOKElasticDB,
    multiFunc,
    initializeElasticClient
};