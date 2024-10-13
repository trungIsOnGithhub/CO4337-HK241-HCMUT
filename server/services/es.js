// const { Client } = require('@elastic/elasticsearch');
// const { match } = require('assert');
// const { kMaxLength } = require('buffer');
// const fs = require('fs');
// // const { constrainedMemory } = require('process');

// function initializeElasticClient() {
//     const certFileContent = fs.readFileSync('/home/pc/Downloads/elasticsearch-8.14.3-linux-x86_64/elasticsearch-8.14.3/config/certs/http_ca.crt');

//     const esClient = new Client({
//         node: 'https://localhost:9200',
//         auth: {
//             username: 'elastic',
//             password: 'G*LrJcq-FWS_wlzdf0Zk'
//         },
//         tls: {
//             ca: certFileContent,
//             rejectUnauthorized: false
//         }
//     });

//     return esClient;
// }

// const addToElasticDB = async function(esClient, indexName, dataPayload) {
//     if (!indexName || !dataPayload) {
//         throw new Error("Invalid populate ES Input!");
//     }
//     if (!esClient) {
//         throw new Error("ES Client not found!");
//     }

//     return await esClient.index({
//         index: indexName,
//         body: dataPayload
//     })
// }

// const isHealthStatusOKElasticDB = async function(esClient) {
//     const response = await esClient.cluster.health({
//         timeout: "5s",
//     });
//     return (response?.status === "green" || response?.status === "yellow")
// }

// const queryElasticDB = async function(esClient, indexName, queryOptionsObject) {
//     if (!indexName || !queryOptionsObject) {
//         throw new Error("Invalid populate ES Input!");
//     }
//     if (!esClient) {
//         throw new Error("ES Client not found!");
//     }

//     return await esClient.search({
//         index: indexName,
//         ...queryOptionsObject
//     });
// };

// const test = async function() {
//     // const esClient = initializeElasticClient();
//     const indexName = "sampleindex3";
//     // const oldIndexName = "sampleindex";
//     // if (!esClient?.indices?.exists({ index: indexName })) {
//     //     console.log('Index Not Found, Inserted Data To Make It Available.');

//     //     const stats = await esClient?.indices?.stats({ index: indexName });
//     //     const indexPStat = stats?.indices[indexName]?.primaries;

//     //     if (indexPStat?.docs?.count > 3) {
//     //         await esClient.indices.delete({ index: indexName });
//     //         console.log('Overcount on Index Document, Deleted Index');
//     //         return;
//     //     }
//     // const responseDel = await esClient.indices.delete({ index: indexName });
//     // console.log("delete index response: ", responseDel);
//     // const response = await esClient.indices.create({
//     //     index: indexName,
//     //     settings: {
//     //       analysis: {
//     //         analyzer: {
//     //           default: {
//     //             type: "custom",
//     //             tokenizer: "standard",
//     //             filter: ["lowercase", "asciifolding"],
//     //           },
//     //         },
//     //       },
//     //     },
//     // });
//     // console.log("create index response: ", response);

//     // await addToElasticDB(indexName, {id: "1", f1:"bà rịa-vũng tàu", f2:68, f3:false});
//     // await addToElasticDB(indexName, {id: "2", f1:"thành phố vũng tàu", f2:69, f3:true});
//     // await addToElasticDB(indexName, {id: "1", f1:"thành phố vũng tàu", f2:86, f3:false});
   
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

//     // const response1 = await esClient.indices.analyze({
//     //     index: indexName,
//     //     text: "bà rịa-vũng tàu",
//     // });
//     // console.log('---->', response1 ,'------');
//     const q1 = await queryElasticDB(indexName, {
//         track_scores: true,
//         query: {
//             bool: {
//                 must: [
//                     {
//                         match: { f1: "vũng tàu" }
//                     }
//                 ],
//                 filter: {
//                     term: { id: "1" }
//                 }
//             }
//         },
//         sort: [
//             { f2: { order: 'desc' } }
//         ]
//     });
//     const hitsRecord = q1?.hits?.hits?.map(record => {
//         return {
//             score: record._score,
//             source: record._source
//         };
//     });
//     console.log('++++++++++++++', q1?.hits , '=======================');
//     console.log("~~~~~~~~", hitsRecord, "**********");

//     // if (q1?.id) {
//     //     const q2 = await deleteEs(indexName, q1?.id);
//     // }
// };

// module.exports = {
//     initializeElasticClient,
//     addToElasticDB,
//     queryElasticDB,
//     isHealthStatusOKElasticDB
// }