const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function main() {
  const mongo = new MongoClient("mongodb://localhost:27017");
  const redis = createClient();

  await mongo.connect();
  await redis.connect();

  const db = mongo.db("ieeevis");
  const tweets = db.collection("tweets");

  await redis.del("leaderboard"); 

  const them = tweets.find();
  while (await them.hasNext()) {
    const tweet = await them.next();
    // for each queet, gets the user and increments their lb 
    await redis.zIncrBy("leaderboard", 1, tweet.user.screen_name);
  }

  // get top 10 users by tweet count (REV: true gives descending order)
  const top10 = await redis.zRangeWithScores("leaderboard", 0, 9, { REV: true });
  console.log("T10 users with most tweets:");
  for (let i = 0; i < top10.length; i++) {
    console.log((i + 1) + ". " + top10[i].value + " - " + top10[i].score + " tweets");
  }

  await mongo.close();
  await redis.quit();
}

main();
