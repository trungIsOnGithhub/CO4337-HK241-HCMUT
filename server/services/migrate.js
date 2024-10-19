const Service = require('../models/service');
const ServiceProvider = require('../models/ServiceProvider');
const DbConnect = require('../config/dbconnect');
const esDBModule = require('./es');
const esDBConstant = require('./constant');
const {default: mongoose} = require('mongoose');
const MONGO_DB_URL = 'mongodb://localhost:27017/dacn-tv1';

async function migrateServiceDataFromMongoDBToElasticDB() {
    const conn = await mongoose.connect(MONGO_DB_URL);

    const esClient = esDBModule.initializeElasticClient();

    if (esClient.indices.exists({ index: esDBConstant.SERVICES })) {
        const allServices = await Service.find({});
        console.log(">>>>>>>>>>", allServices?.length + " fetched from MongoDB");

        for (const idx in allServices) {
            if (idx === 0) continue;
            // elastic db does not allowed exiternal _id
            const newObjectToAdd = allServices[idx].toObject();
            const serviceProvider = await Service.find({_id: allServices[idx].provider_id});

            newObjectToAdd.id = "" + newObjectToAdd._id;
            newObjectToAdd.provider_id = serviceProvider;

            if (newObjectToAdd?.provider_id?.bussinessName) {
                newObjectToAdd.providername = newObjectToAdd.provider_id.bussinessName;
            }

            if (newObjectToAdd?.provider_id?.latitude
                && newObjectToAdd?.provider_id?.longitude
            ) {
                newObjectToAdd.locations = {
                    lat: newObjectToAdd.provider_id.latitude,
                    lon:newObjectToAdd.provider_id.longitude
                }
            }

            delete newObjectToAdd._id;
            delete newObjectToAdd._v;
            delete newObjectToAdd.createdAt;
            delete newObjectToAdd.image;
            delete newObjectToAdd.description;
            delete newObjectToAdd.assigned_staff;
            delete newObjectToAdd.assigned_staff;
            delete newObjectToAdd.bookingQuantity;
            delete newObjectToAdd.totalRatings;
            delete newObjectToAdd.ratings;
            // newObjectToAdd.
            // elastic db does not allowed exiternal _id
            await esDBModule.addToElasticDB(esDBConstant.SERVICES, newObjectToAdd);
            console.log("============", newObjectToAdd);
        }

        const allServiceAdded = await esDBModule.queryElasticDB(esDBConstant.SERVICES, {query:{match_all:{}}});
        console.log("CHECKKK AFTER ADD:  ", allServiceAdded?.hits?.hits);
    }
    else {
        throw new Error("Cannot find ES Index!!");
    }
}

migrateServiceDataFromMongoDBToElasticDB();