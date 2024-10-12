const Service = require('../models/service');
const DbConnect = require('../config/dbconnect');
const esDBModule = require('./es');
const esDBConstant = require('./constant');
const {default: mongoose} = require('mongoose');

async function migrateServiceDataFromMongoDBToElasticDB() {
    const conn = await mongoose.connect('mongodb://localhost:27017/dacn-tv1');

    const esClient = esDBModule.initializeElasticClient();
    // const allServices = await Service.find({});

    // console.log(allServices?.length + " fetched from MongoDB");

    if (esClient.indices.exists({ index: esDBConstant.SERVICES })) {
        // for (const idx in allServices) {
        //     // elastic db does not allowed exiternal _id
        //     const newObjectToAdd = { ...allServices[idx]._doc };
        //     newObjectToAdd.mongo_id = "" + newObjectToAdd._id;
        //     delete newObjectToAdd._id;
        //     delete newObjectToAdd._v;
        //     delete newObjectToAdd.createdAt;
        //     delete newObjectToAdd.image;
        //     delete newObjectToAdd.description;
        //     delete newObjectToAdd.assigned_staff;
        //     // newObjectToAdd.
        //     // elastic db does not allowed exiternal _id
        //     await esDBModule.addToElasticDB(esClient, esDBConstant.SERVICES, newObjectToAdd);
        //     // console.log(newObjectToAdd);
        // }

        const allServiceAdded = await esDBModule.queryElasticDB(esClient, esDBConstant.SERVICES, {query:{match_all:{}}});
        console.log(allServiceAdded);
    }
    else {
        throw new Error("Cannot find ES Index!!");
    }
}

migrateServiceDataFromMongoDBToElasticDB();