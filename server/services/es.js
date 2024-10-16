const { Client } = require('@elastic/elasticsearch');
const { match } = require('assert');
const { kMaxLength } = require('buffer');
const fs = require('fs');
const ELASTIC_INDEX_NAME_MAP = require('./constant');
const { queryObjects } = require('v8');
// const { constrainedMemory } = require('process');

{
    "query": {
        "match" : {
            "title" : "in action"
        }
    },


}

function initializeElasticClient() {
    // SECURITY OFF
    // const certFileContent = fs.readFileSync('/home/pc/Downloads/elasticsearch-8.14.3-linux-x86_64/elasticsearch-8.14.3/config/certs/http_ca.crt');

    const esClient = new Client({
        node: 'http://localhost:9200',
        auth: {
            username: 'elastic',
            password: 'G*LrJcq-FWS_wlzdf0Zk'
        }
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
            settings: {
              number_of_shards: 1, // default only 1 shard
            },
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
                }
              },
            },
        });
        console.log('CREATE SERVICES RESPONSE', response);
    }

    // if (! (await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.BLOGS })) ) {
    //     const response = await esClient.indices.create({
    //         index: ELASTIC_INDEX_NAME_MAP.BLOGS,
    //         settings: {
    //           number_of_shards: 1, // default only 1 shard
    //         },
    //         mappings: {
    //           properties: {
    //             field1: {
    //               type: "text",
    //             },
    //           },
    //         },
    //     });
    //     console.log('CREATE BLOGS RESPONSE', response);
    // }
}

async function resetElasticConnection() {
    const esClient = initializeElasticClient();

    const deleteResponse1 = await esClient.indices.delete({ index: ELASTIC_INDEX_NAME_MAP.SERVICES });
    console.log('DELETE SERVICES RESPONSE', deleteResponse1);

    // const deleteResponse2 = await esClient.indices.delete({ index: ELASTIC_INDEX_NAME_MAP.BLOGS });
    // console.log('DELETE BLOGS RESPONS', deleteResponse2);
}

async function fullTextSearch(searchTerm, fieldNameArrayToMatch,
        fieldNameArrayToGet, limit, offset, elasticSortScheme) {
    const esClient = initializeElasticClient();

    const queryObject = {
        query: {
            multi_match: searchTerm,
            fields: fieldNameArrayToMatch
        },
        size: limit,
        from: offset,
        _source: fieldNameArrayToGet,
        sort: []
    };

    if (elasticSortScheme?.length) {
        queryObject.sort = elasticSortScheme;
        queryObject.track_score = true;
    }

    const elasticResponse = await esClient.search(queryObject);

    console.log(elasticResponse?.hits);

    return elasticResponse;
}

const addToElasticDB = async function(esClient, indexName, dataPayload) {
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
        timeout: "5s",
    });
    return (response?.status === "green" || response?.status === "yellow")
}

const queryElasticDB = async function(esClient, indexName, queryOptionsObject) {
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

const test = async function() {
    // const esClient = initializeElasticClient();
    const indexName = ELASTIC_INDEX_NAME_MAP.SERVICES;
    // const oldIndexName = "sampleindex";
    // if (!esClient?.indices?.exists({ index: indexName })) {
    //     console.log('Index Not Found, Inserted Data To Make It Available.');

    //     const stats = await esClient?.indices?.stats({ index: indexName });
    //     const indexPStat = stats?.indices[indexName]?.primaries;

    //     if (indexPStat?.docs?.count > 3) {
    //         await esClient.indices.delete({ index: indexName });
    //         console.log('Overcount on Index Document, Deleted Index');
    //         return;
    //     }
    // const responseDel = await esClient.indices.delete({ index: indexName });
    // console.log("delete index response: ", responseDel);
    // const response = await esClient.indices.create({
    //     index: indexName,
    //     settings: {
    //       analysis: {
    //         analyzer: {
    //           default: {
    //             type: "custom",
    //             tokenizer: "standard",
    //             filter: ["lowercase", "asciifolding"],
    //           },
    //         },
    //       },
    //     },
    // });
    // console.log("create index response: ", response);

    await addToElasticDB(indexName, {id: "dhu91udoawi9d180i2019iss", name: "Cat Toc 1", province:"Ho Chi Minh", providername:"Abcd' Hair Salon", category:"Baber Shop"});
    await addToElasticDB(indexName, {id: "djaoisd919e09wdasihd7119", name: "Massage Thao Moc", province:"tp vung tau", providername:"Abcd' Hair Salon", category:"Healthcare"});
    await addToElasticDB(indexName, {id: "37uissioiic90w1i90ei1839", name: "Tu Van Suc Khoe ", province:"Binh Duong", providername:"Abcd' Hair Salon", category:"Baber Shop"});
    await addToElasticDB(indexName, {id: "37uissioiic9dai90ei18839", name: "Tu Van Suc Khoe ", province:"Binh Duong", providername:"Abcd' Hair Salon", category:"Healthcare"});
    await addToElasticDB(indexName, {id: "37uiss655iic90w1i90ei1839", name: "Vat ly tri Lieu", province:"Vung Tau", providername:"Y Hoc Co Truyen 86", category:"Healthcare"});
    await addToElasticDB(indexName, {id: "37uikk655iic90w1i90ei1839", name: "Tu van tao kieu toc", province:"Ba Ria - Vung Tau", providername:"HEHE Baber", category:"Baber Shop"});
   
    //  }
    // else {
        // const stats = await esClient?.indices?.stats({ index: indexName });
        // const indexPStat = stats?.indices[indexName]?.primaries;

        // if (indexPStat?.docs?.count > 3) {
        //     await esClient.indices.delete({ index: indexName });
        //     console.log('Overcount on Index Document, Deleted Index');
        //     return;
        // }   
    // }

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
        },
        // sort: [
        //     { f2: { order: 'desc' } }
        // ]
    });
    console.log("TEST ALL DOC QUERY", qAllTest?.hits,"TEST ALL DOC QUERY");
    console.log("*****************************************");

    const q1 = fullTextSearch("binh duong", [], [], 1, 1);
    const hitsRecord = q1?.hits?.hits?.map(record => {
        return {
            score: record._score,
            source: record._source
        };
    });
    console.log('++++++++++++++', q1?.hits , '=======================');
    console.log("~~~~~~~~", hitsRecord, "**********");

    // if (q1?.id) {
    //     const q2 = await deleteEs(indexName, q1?.id);
    // }
};

module.exports = {
    initializeElasticClient,
    addToElasticDB,
    queryElasticDB,
    isHealthStatusOKElasticDB
}