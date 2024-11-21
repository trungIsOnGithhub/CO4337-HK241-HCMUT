const Service = require('../models/service');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/user');
const DbConnect = require('../config/dbconnect');
const esDBModule = require('./es');
const esDBConstant = require('./constant');
const {default: mongoose} = require('mongoose');
const Blog = require('../models/blog');

const MONGO_DB_URL = 'mongodb://127.0.0.1:27017/ecommerce';

async function migrateServiceDataFromMongoDBToElasticDB() {
    const conn = await mongoose.connect(MONGO_DB_URL);

    const esClient = esDBModule.initializeElasticClient();

    if (esClient.indices.exists({ index: esDBConstant.SERVICES })) {

        const allServices = await Service.find({}).populate('provider_id');
        console.log(">>>>>>>>>>", allServices?.length + " fetched from MongoDB");

        const c1 = allServices.map(service => service.name);
        const c2 = [];

        for (const idx in allServices) {
            // if (idx === 0) continue;
            // elastic db does not allowed exiternal _id

            const newObjectToAdd = allServices[idx].toObject();
            const serviceProvider = await ServiceProvider.find({_id: allServices[idx].provider_id});
            if (!serviceProvider?.length) {
                console.log("FOUND: YYYYYYYYYYYYYYYYYYYYYYYYYYYY");
            }
            // console.log("START NAME", serviceProvider?.bussinessName, "END NAME");
            newObjectToAdd.provider_id = serviceProvider[0];

            // c2.push({
            //     ser: allServices[idx],
            //     prov: serviceProvider[0]
            // });

            newObjectToAdd.id = "" + newObjectToAdd._id;

            if (newObjectToAdd?.provider_id?.bussinessName) {
                newObjectToAdd.providername = newObjectToAdd.provider_id.bussinessName;
            }
            if (newObjectToAdd?.provider_id?.province) {
                newObjectToAdd.province = newObjectToAdd.provider_id.province;
            }

            // add geolocation info
            if (newObjectToAdd?.provider_id?.latitude
                && newObjectToAdd?.provider_id?.longitude
            ) {
                newObjectToAdd.locations = {
                    lat: parseFloat(newObjectToAdd.provider_id.latitude.toFixed(1)),
                    lon: parseFloat(newObjectToAdd.provider_id.longitude.toFixed(1))
                }
            }
            else if(newObjectToAdd?.provider_id?.geolocation?.coordinates?.length === 2)  {
                newObjectToAdd.locations = {
                    lat: parseFloat(newObjectToAdd.provider_id.geolocation.coordinates[1].toFixed(1)),
                    lon: parseFloat(newObjectToAdd.provider_id.geolocation.coordinates[0].toFixed(1))
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

            delete newObjectToAdd.provider_id
            // delete newObjectToAdd.provider_id.time;
            // delete newObjectToAdd.provider_id.images;
            // // delete newObjectToAdd.provider_id.__v;
            // delete newObjectToAdd.provider_id.chatGivenQuestions;
            // delete newObjectToAdd.provider_id.chatgivenquestions;

            // delete newObjectToAdd.provider_id.ward;
            // delete newObjectToAdd.provider_id.district;
            // delete newObjectToAdd.provider_id.geolocation;

            // newObjectToAdd.
            // elastic db does not allowed exiternal _id

            console.log(newObjectToAdd.id);
            // await esDBModule.addToElasticDB(esDBConstant.SERVICES, newObjectToAdd);// TO SWITCH
            console.log("============", newObjectToAdd);
        }

        console.log("C1: ", c1);console.log("C2: ", c2);

        // {query:{match:{ name: {query: 'Traditional Herbal Hair Wash'} }}}
        // const allServiceAdded = await esDBModule.queryElasticDB(esDBConstant.SERVICES, {"query":{match_all:{}}});
        // console.log("CHECKKK AFTER ADD:  ", allServiceAdded?.hits?.hits?.map(ele => { return ele?._source?.locations; }), "DONE CHECK");
    }
    else {
        throw new Error("Cannot find ES Index!!");
    }
}

async function migrateBlogDataFromMongoDBToElasticDB() {
    const conn = await mongoose.connect(MONGO_DB_URL);

    const esClient = esDBModule.initializeElasticClient();

    if (esClient.indices.exists({ index: esDBConstant.BLOGS })) {
        const allBlogs = await Blog.find({});
        console.log("<<<<<<<<<<<<<<" + allBlogs?.length + " fetched from MongoDB");

        for (const idx in allBlogs) {
            // if (idx === 0) continue;
            // elastic db does not allowed exiternal _id

            const newObjectToAdd = allBlogs[idx].toObject();

            newObjectToAdd.provider_id = (await ServiceProvider.find({_id: allBlogs[idx].provider_id}))[0];
            // console.log("===++++====>", newObjectToAdd.provider_id);

            const author = await User.findById(allBlogs[idx].author);
            console.log(author);
            if (!author) continue;

            // console.log('========>', author);
            newObjectToAdd.authorname = author.firstName + ' ' + author.lastName;
            
            const numLikes = newObjectToAdd.likes?.length;
            const numDislikes = newObjectToAdd.dislikes?.length;


            newObjectToAdd.id = "" + newObjectToAdd._id;

            if (newObjectToAdd?.provider_id?.bussinessName) {
                newObjectToAdd.providername = newObjectToAdd.provider_id.bussinessName;
            }
            if (newObjectToAdd?.provider_id?.province) {
                newObjectToAdd.province = newObjectToAdd.provider_id.province;
            }

            newObjectToAdd.likes = numLikes;
            newObjectToAdd.dislikes = numDislikes;
            // newObjectToAdd.dislikes = numDislikes;
            // // add geolocation info
            // if (newObjectToAdd?.provider_id?.latitude
            //     && newObjectToAdd?.provider_id?.longitude
            // ) {
            //     newObjectToAdd.locations = {
            //         lat: parseFloat(newObjectToAdd.provider_id.latitude.toFixed(1)),
            //         lon: parseFloat(newObjectToAdd.provider_id.longitude.toFixed(1))
            //     }
            // }
            // else if(newObjectToAdd?.provider_id?.geolocation?.coordinates?.length === 2)  {
            //     newObjectToAdd.locations = {
            //         lat: parseFloat(newObjectToAdd.provider_id.geolocation.coordinates[1].toFixed(1)),
            //         lon: parseFloat(newObjectToAdd.provider_id.geolocation.coordinates[0].toFixed(1))
            //     }
            // }

            delete newObjectToAdd._id;
            delete newObjectToAdd.__v;
            // delete newObjectToAdd.createdAt;
            delete newObjectToAdd.comments;
            delete newObjectToAdd.content;
            delete newObjectToAdd.provider_id;
            delete newObjectToAdd.author;

            await esDBModule.addToElasticDB(esDBConstant.BLOGS, newObjectToAdd);// TO SWITCH

            console.log("============", newObjectToAdd);
        }
    }
    else {
        throw new Error("Cannot find ES Index!!");
    }
}


async function migrateProvidersDataFromMongoDBToElasticDB() {
    const conn = await mongoose.connect(MONGO_DB_URL);

    const esClient = esDBModule.initializeElasticClient();

    if (esClient.indices.exists({ index: esDBConstant.PROVIDERS })) {

        const allPS = await ServiceProvider.find({});
        console.log(">>>>>>>>>>", allPS?.length + " fetched from MongoDB");

        const c1 = allPS.map(service => service.name);
        const c2 = [];

        for (const idx in allPS) {
            // if (idx === 0) continue;
            // elastic db does not allowed exiternal _id

            const newObjectToAdd = allPS[idx].toObject();
            // const serviceProvider = await ServiceProvider.find({_id: allServices[idx].provider_id});

            // console.log("START NAME", serviceProvider?.bussinessName, "END NAME");
            // newObjectToAdd.provider_id = serviceProvider[0];

            // c2.push({
            //     ser: allServices[idx],
            //     prov: serviceProvider[0]
            // });

            newObjectToAdd.id = "" + newObjectToAdd._id;

            // if (newObjectToAdd?.provider_id?.bussinessName) {
            //     newObjectToAdd.providername = newObjectToAdd.provider_id.bussinessName;
            // }
            // if (newObjectToAdd?.provider_id?.province) {
            //     newObjectToAdd.province = newObjectToAdd.provider_id.province;
            // }

            // add geolocation info
            if (newObjectToAdd?.latitude
                && newObjectToAdd?.longitude
            ) {
                newObjectToAdd.locations = {
                    lat: parseFloat(newObjectToAdd.latitude),
                    lon: parseFloat(newObjectToAdd.longitude)
                };
            }
            // else if(newObjectToAdd?.provider_id?.geolocation?.coordinates?.length === 2)  {
            //     newObjectToAdd.locations = {
            //         lat: parseFloat(newObjectToAdd.provider_id.geolocation.coordinates[1]),
            //         lon: parseFloat(newObjectToAdd.provider_id.geolocation.coordinates[0])
            //     }
            // }

            delete newObjectToAdd._id;
            delete newObjectToAdd.__v;
            // delete newObjectToAdd.images;
            // delete newObjectToAdd.time;
            delete newObjectToAdd.chatGivenQuestions;
            delete newObjectToAdd.slogan;
            delete newObjectToAdd.theme;
            delete newObjectToAdd.socialMedia;

            delete newObjectToAdd.indexFooter;
            delete newObjectToAdd.logoSize  ;
            // delete newObjectToAdd.provider_id.time;
            // delete newObjectToAdd.provider_id.images;
            // // delete newObjectToAdd.provider_id.__v;
            // delete newObjectToAdd.provider_id.chatGivenQuestions;
            // delete newObjectToAdd.provider_id.chatgivenquestions;

            // delete newObjectToAdd.provider_id.ward;
            // delete newObjectToAdd.provider_id.district;
            // delete newObjectToAdd.provider_id.geolocation;

            // newObjectToAdd.
            // elastic db does not allowed exiternal _id

            console.log(newObjectToAdd.id);
            await esDBModule.addToElasticDB(esDBConstant.PROVIDERS, newObjectToAdd);// TO SWITCH
            console.log("============", newObjectToAdd);
        }

        // console.log("C1: ", c1);console.log("C2: ", c2);

        // {query:{match:{ name: {query: 'Traditional Herbal Hair Wash'} }}}
        // const allServiceAdded = await esDBModule.queryElasticDB(esDBConstant.SERVICES, {"query":{match_all:{}}});
        // console.log("CHECKKK AFTER ADD:  ", allServiceAdded?.hits?.hits?.map(ele => { return ele?._source?.locations; }), "DONE CHECK");
    }
    else {
        throw new Error("Cannot find ES Index!!");
    }
}


async function checkAfter() {
    // // {query:{match:{ name: {query: 'Traditional Herbal Hair Wash'} }}}
    // const allServiceAdded = await esDBModule.queryElasticDB(esDBConstant.SERVICES, {"query":{"bool":{ "must":[{"match":{"province":"Cà Mau"}}] ,"should":[{"term":{"catergory":"Gym"}},{"term":{"catergory":"Nail"}}]}}} );
    const allServiceAdded = await esDBModule.queryElasticDB(esDBConstant.SERVICES, {"query":{match_all:{}}});
    console.log("SERVICE CHECK:  ", allServiceAdded?.hits?.hits.length, "DONE SERVICE");
    // console.log("***********");
    console.log("**********");
    console.log("**********");
    // const allBlogAdded = await esDBModule.queryElasticDB(esDBConstant.BLOGS, {"query":{ "bool":{"must":[{"term":{"tags":"dia-diem-vui-choi"}},{"term":{"tags":"1vuichoi"}}]} }});
    const allBlogAdded = await esDBModule.queryElasticDB(esDBConstant.BLOGS, {"query":{match_all:{}}});
    console.log("BLOG CHECK:  ", allBlogAdded?.hits?.hits?.length, "DONE BLGG");
    console.log("**********");
    console.log("**********");
    // const allBlogAdded = await esDBModule.queryElasticDB(esDBConstant.BLOGS, {"query":{ "bool":{"must":[{"term":{"tags":"dia-diem-vui-choi"}},{"term":{"tags":"1vuichoi"}}]} }});
    const pAdded = await esDBModule.queryElasticDB(esDBConstant.PROVIDERS, {"query":{match_all:{}}});
    console.log("PROVIDERR CHECK:  ", pAdded?.hits?.hits?.length, "DONE PRRVD");
}

let prom1, prom2, prom3;
// prom1 = migrateServiceDataFromMongoDBToElasticDB();
// prom2 = migrateBlogDataFromMongoDBToElasticDB();
prom3 = migrateProvidersDataFromMongoDBToElasticDB();

const proms = [];
if(prom1) {proms.push(prom1);}
if(prom2) {proms.push(prom2);}
if(prom3) {proms.push(prom3);}

Promise.all(proms).then(() => {
    checkAfter();    
})