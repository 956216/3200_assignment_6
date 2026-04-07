const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function main() {
  const mongo = new MongoClient("mongodb://localhost:27017");
  const redis = createClient();

  await mongo.connect();
  await redis.connect();

  const db = mongo.db("ieeevis");
  const tweets = db.collection("tweets");

  await redis.set("favoritesSum", 0);

  const them = tweets.find();
  while (await them.hasNext()) {
    const tweet = await them.next();
    await redis.incrBy("favoritesSum", tweet.favorite_count);
  }

  const total = await redis.get("favoritesSum");
  console.log("There are " + total + " favorites");

  await mongo.close();
  await redis.quit();
}

main();
