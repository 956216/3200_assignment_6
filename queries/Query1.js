const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function main() {
  const mongo = new MongoClient("mongodb://localhost:27017");
  const redis = createClient();

  await mongo.connect();
  await redis.connect();

  const db = mongo.db("ieeevis");
  const tweets = db.collection("tweets");

  await redis.set("tweetCount", 0); // equ to SET

  const them = tweets.find();
  while (await them.hasNext()) {
    await them.next();
    await redis.incr("tweetCount");
  }

  const count = await redis.get("tweetCount");
  console.log("There were " + count + " tweets");

  await mongo.close();
  await redis.quit();
}

main();
