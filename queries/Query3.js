const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function main() {
  const mongo = new MongoClient("mongodb://localhost:27017");
  const redis = createClient();

  await mongo.connect();
  await redis.connect();

  const db = mongo.db("ieeevis");
  const tweets = db.collection("tweets");

  await redis.del("screen_names"); // in case the script is run twice

  const them = tweets.find();
  while (await them.hasNext()) {
    const tweet = await them.next(); // adds each screen name to a redis set
    await redis.sAdd("screen_names", tweet.user.screen_name);
  }

  const count = await redis.sCard("screen_names");
  console.log("There are " + count + " distinct users"); // sCard returns set cardinality

  await mongo.close();
  await redis.quit();
}

main();
