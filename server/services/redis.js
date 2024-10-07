const redis = require("redis");

class CacheWrapper {
    constructor(connectionString) {
        (async () => {
            this.redisClient = redis.createClient({
                url: connectionString
            });
          
            this.redisClient.on("error", (error) => console.error(`Error : ${error}`));
          
            await this.redisClient.connect();
        })();
    }
}
