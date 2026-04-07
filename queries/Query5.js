const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function main() {
  const mongo = new MongoClient("mongodb://localhost:27017");
  const redis = createClient();

  await mongo.connect();
  await redis.connect();

  const db = mongo.db("ieeevis");
  const tweets = db.collection("tweets");

  // build two redis structures per tweet
  // structure: list for each user, and a hash for each tweet. 
  // append tweet IDs to each user list, so that we can reference their tweets
  const them = tweets.find();
  while (await them.hasNext()) {
    const tweet = await them.next(); 
    const screenName = tweet.user.screen_name;
    const tweetId = tweet.id_str;

    // rPush appends tweet ID to the end of list
    await redis.rPush("tweets:" + screenName, tweetId);

    // hSet stores keyval pairs in a hash
    await redis.hSet("tweet:" + tweetId, {
      user_name: tweet.user.name,
      screen_name: screenName,
      text: tweet.text,
      created_at: tweet.created_at,
      favorite_count: String(tweet.favorite_count), // tostr bc redis only stores in strs
      retweet_count: String(tweet.retweet_count)
    });
  }

  // demo
  const sampleUser = "duto_guerra";

  // lRange gets all els from 0 to -1
  const tweetIds = await redis.lRange("tweets:" + sampleUser, 0, -1);
  console.log("Tweets for " + sampleUser + ": " + tweetIds.length + " tweets");

  // hGetAll gets all fields/vals from hash as an obj
  // hGetAll returns all fields and values from a hash as an object
  if (tweetIds.length > 0) {
    const info = await redis.hGetAll("tweet:" + tweetIds[0]);
    console.log("First tweet info:", info);
  }

  await mongo.close();
  await redis.quit();
}

main();
