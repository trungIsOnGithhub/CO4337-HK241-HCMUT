const { Client } = require('@elastic/elasticsearch');
// const { match } = require('assert');
// const { kMaxLength } = require('buffer');
const ServiceProvider = require('../models/ServiceProvider');122
const ELASTIC_INDEX_NAME_MAP = require('./constant');
// const MONGO_DB_URL = 'mongodb://127.0.0.1:27017/dacn-tv1';

const esClient = new Client({
    node: ELASTIC_INDEX_NAME_MAP.ELASTIC_URL
});


/* BLOGS */
const cleanBlogData = async (mongoPayload) => {
    const serviceProvider = await ServiceProvider.findById(mongoPayload.provider_id);
    if (!serviceProvider?.length) {
        return null;
    }
    const author = await User.findById(mongoPayload.author);
    if (!author) {
        return null;
    }

    const newObjectToAdd = { ...mongoPayload };

    newObjectToAdd.provider_id = serviceProvider;

    console.log('========|||||=============>', author);
    console.log('=======||||==============>', serviceProvider);

    newObjectToAdd.authorname = author.firstName + ' ' + author.lastName;
    
    const numLikes = newObjectToAdd.likes?.length;
    const numDislikes = newObjectToAdd.dislikes?.length;
    // newObjectToAdd.id = "" + newObjectToAdd._id;

    if (newObjectToAdd?.provider_id?.bussinessName) {
        newObjectToAdd.providername = newObjectToAdd.provider_id.bussinessName;
    }
    if (newObjectToAdd?.provider_id?.province) {
        newObjectToAdd.province = newObjectToAdd.provider_id.province;
    }

    newObjectToAdd.likes = numLikes;
    newObjectToAdd.dislikes = numDislikes;

    delete newObjectToAdd._id;
    delete newObjectToAdd.__v;
    // delete newObjectToAdd.createdAt;
    delete newObjectToAdd.comments;
    delete newObjectToAdd.content;
    delete newObjectToAdd.provider_id;
    delete newObjectToAdd.author;

    return newObjectToAdd;
}
const addBlog = async (payload) => {
    if ( !payload ||
        !(await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.BLOGS }))
    ) {
        return {
            success: false,
            mes: 'Elastic index provider not found'
        };
    }

    console.log('_____________________');
    console.log(payload);
    console.log('_____________________');

    const newId = "" + payload._id;
    const cleanPayload = await cleanBlogData(payload);

    console.log('||||||||||||||||||||||||||||||||||||||||');
    console.log(cleanPayload);
    console.log('|||||||||||||||||||||||||||||||||||||||||');

    const resp = await esClient.index({
        index: ELASTIC_INDEX_NAME_MAP.BLOGS,
        id: newId,
        refresh: "wait_for",
        body: cleanPayload
    });

    return {
        success: resp ? true : false,
        mes: "Ended function, check status.",
        data: resp
    };
}
const updateBlog = async (id, payload) => {
    if ( !payload ||
        !(await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.BLOGS }))
    ) {
        return {
            success: false,
            mes: 'Elastic index provider not found'
        };
    }

    delete payload.content;
    // console.log('||||||||||||||||||||||||||||||||||||||||');
    // console.log(payload);
    // console.log('|||||||||||||||||||||||||||||||||||||||||');
    // console.log(id);

    const resp = await esClient.update({
        index: ELASTIC_INDEX_NAME_MAP.BLOGS,
        id,
        refresh: "wait_for",
        body: {
            doc: payload
        }
    });

    return {
        success: resp ? true : false,
        mes: "Ended function, check status.",
        data: resp
    };
}


/* PROVIDER */
const cleanProviderData = async (mongoPayload) => {
    const newObjectToAdd = { ...mongoPayload };
    // newObjectToAdd.id = "" + newObjectToAdd._id;

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

    newObjectToAdd.isHidden = false; // only for provider to avoid bug

    return newObjectToAdd;
}
const addProvider = async (payload) => {
    if ( !payload ||
        !(await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.PROVIDERS }))
    ) {
        return {
            success: false,
            mes: 'Elastic index provider not found'
        };
    }

    console.log('_____________________');
    console.log(payload);
    console.log('_____________________');

    const newId = "" + payload._id;
    const cleanPayload = await cleanProviderData(payload);

    console.log('||||||||||||||||||||||||||||||||||||||||');
    console.log(cleanPayload);
    console.log('|||||||||||||||||||||||||||||||||||||||||');

    const resp = await esClient.index({
        index: ELASTIC_INDEX_NAME_MAP.PROVIDERS,
        id: newId,
        refresh: "wait_for",
        body: cleanPayload
    });

    return {
        success: resp ? true : false,
        mes: "Ended function, check status.",
        data: resp
    };
}
const updateProvider = async (id, payload) => {
    if ( !payload ||
        !(await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.PROVIDERS }))
    ) {
        return {
            success: false,
            mes: 'Elastic index provider not found'
        };
    }

    // console.log('||||||||||||||||||||||||||||||||||||||||');
    // console.log(cleanPayload);
    // console.log('|||||||||||||||||||||||||||||||||||||||||');

    const cleanPayload = cleanProviderData(payload);

    const resp = await esClient.update({
        index: ELASTIC_INDEX_NAME_MAP.PROVIDERS,
        id,
        refresh: "wait_for",
        body: {
            doc: cleanPayload
        }
    });

    return {
        success: resp ? true : false,
        mes: "Ended function, check status.",
        data: resp
    };
}


/* SERVICE */
const cleanServiceData = async (mongoPayload) => {
    const serviceProvider = await ServiceProvider.find({_id: mongoPayload.provider_id});
    if (!serviceProvider?.length) {
        return null;
    }

    const newObjectToAdd = { ...mongoPayload };

    console.log(">>>>>>>>>>>>>>", mongoPayload);

    newObjectToAdd.provider_id = serviceProvider[0];

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

    console.log('_____________________');
    console.log(payload);
    console.log('_____________________');

    const cleanPayload = await cleanServiceData(payload);

    console.log('||||||||||||||||||||||||||||||||||||||||');
    console.log(cleanPayload);
    console.log('|||||||||||||||||||||||||||||||||||||||||');

    const resp = await esClient.index({
        index: ELASTIC_INDEX_NAME_MAP.SERVICES,
        id: newId,
        refresh: "wait_for",
        body: payload
    });

    return {
        success: resp ? true : false,
        mes: "Ended function, check status.",
        data: resp
    };
}
const updateService = async (id, payload) => {
    if ( !payload ||
        !(await esClient.indices.exists({ index: ELASTIC_INDEX_NAME_MAP.SERVICES }))
    ) {
        return {
            success: false,
            mes: 'Elastic index for service not found'
        };
    }
    console.log('_____________________');
    console.log(payload);
    console.log('_____________________');

    // const cleanPayload = await cleanServiceData(payload);

    // console.log('||||||||||||||||||||||||||||||||||||||||');
    // console.log(cleanPayload);
    // console.log('|||||||||||||||||||||||||||||||||||||||||');

    const resp = await esClient.update({
        index: ELASTIC_INDEX_NAME_MAP.SERVICES,
        id,
        refresh: "wait_for",
        body: {
            doc: payload
        }
    });

    return {
        success: resp ? true : false,
        mes: "Ended function, check status.",
        data: resp
    };
}


module.exports = {
    addService,
    updateService,
    addProvider,
    updateProvider,
    addBlog,
    updateBlog
}