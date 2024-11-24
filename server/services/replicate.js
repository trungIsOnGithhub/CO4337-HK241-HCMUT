const { Client } = require('@elastic/elasticsearch');
// const { match } = require('assert');
// const { kMaxLength } = require('buffer');
const ServiceProvider = require('../models/ServiceProvider');122
const ELASTIC_INDEX_NAME_MAP = require('./constant');
const MONGO_DB_URL = 'mongodb://127.0.0.1:27017/dacn-tv1';

const esClient = new Client({
    node: ELASTIC_INDEX_NAME_MAP.ELASTIC_URL
});

const updateProvider = (payload) => {

}

const cleanProviderData = async (mongoPayload) => {
    const newObjectToAdd = { ...mongoPayload };
    newObjectToAdd.id = "" + newObjectToAdd._id;

    if (newObjectToAdd?.latitude
        && newObjectToAdd?.longitude
    ) {
        newObjectToAdd.locations = {
            lat: parseFloat(newObjectToAdd.latitude),
            lon: parseFloat(newObjectToAdd.longitude)
        };
    }

    delete newObjectToAdd._id;
    delete newObjectToAdd.__v;
    delete newObjectToAdd.time;
    delete newObjectToAdd.chatGivenQuestions;
    delete newObjectToAdd.slogan;
    delete newObjectToAdd.theme;
    delete newObjectToAdd.socialMedia;
    delete newObjectToAdd.indexFooter;
    delete newObjectToAdd.logoSize;
    delete newObjectToAdd.advancedSetting;

    return newObjectToAdd;
}
const addProvider = async (payload) => {

}


const cleanServiceData = async (mongoPayload) => {
    const serviceProvider = await ServiceProvider.find({_id: mongoPayload.provider_id});
    if (!serviceProvider?.length) {
        return null;
    }

    const newObjectToAdd = { ...mongoPayload };

    newObjectToAdd.provider_id = serviceProvider[0];
    newObjectToAdd.id = "" + newObjectToAdd._id;

    newObjectToAdd.providername = newObjectToAdd.provider_id.bussinessName;
    newObjectToAdd.province = newObjectToAdd.provider_id.province;

    // add geolocation info
    if (newObjectToAdd?.provider_id?.latitude
        && newObjectToAdd?.provider_id?.longitude
    ) {
        newObjectToAdd.locations = {
            lat: parseFloat(newObjectToAdd.provider_id.latitude.toFixed(1)),
            lon: parseFloat(newObjectToAdd.provider_id.longitude.toFixed(1))
        }
    }

    delete newObjectToAdd._id;
    delete newObjectToAdd.__v;
    delete newObjectToAdd.createdAt;
    delete newObjectToAdd.image;
    delete newObjectToAdd.description;
    delete newObjectToAdd.assigned_staff;
    delete newObjectToAdd.bookingQuantity;
    delete newObjectToAdd.rating;
    delete newObjectToAdd.provider_id;

    return newObjectToAdd;
}
const addService = async (payload) => {
    if ( !payload ||
        !(await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.SERVICES }))
    ) {
        return {
            success: false,
            mes: 'Elastic index for service not found'
        };
    }

    const cleanPayload = await cleanServiceData(payload);

    const resp = await esClient.index({
        index: ELASTIC_INDEX_NAME_MAP.SERVICES,
        body: cleanPayload
    })

    return {
        success: resp ? true : false,
        mes: "Ended function, check status.",
        data: resp
    };
}

module.exports = {
    addService
}