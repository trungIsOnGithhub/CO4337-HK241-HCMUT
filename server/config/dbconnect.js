const {default: mongoose} = require('mongoose')

const dbConnect = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        if(conn.connection.readyState === 1){
            console.log("=============DBCONN");
        }
        else{
            console.log("*************DBCONN");
        }
        console.log("@@@@@@@@@@@@@@@DBCONN");
    } catch(error){
        console.error(JSON.stringify(error));
        throw new Error(error)
    }
}

module.exports = dbConnect