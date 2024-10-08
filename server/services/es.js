const { Client } = require('@elastic/elasticsearch')

const populateESCronJob = function(indexName, dataPayload) {
    if (!indexName || !dataPayload) {
        throw new Error("Invalid CRON Job Input!");
    }

    const esClient = new Client({ node: 'http://localhost:9200' });

    esClient.index({
        index: indexName,
        body: dataPayload
    })
}

export default esClient;