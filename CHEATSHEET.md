## Redis Node.js (`redis` v5) Quick Reference

### Setup

```js
const { createClient } = require("redis");
const redis = createClient();       // defaults to localhost:6379
await redis.connect();
// ... do stuff ...
await redis.quit();                  // close connection
```

### Strings (key → value)

```js
await redis.set("key", "value");          // SET
await redis.get("key");                   // GET → "value"
await redis.incr("key");                  // INCR → increment by 1
await redis.incrBy("key", 5);            // INCRBY → increment by N
await redis.del("key");                   // DEL → delete key
```

### Sets (unique members)

```js
await redis.sAdd("myset", "a");          // SADD → add member
await redis.sMembers("myset");           // SMEMBERS → ["a"]
await redis.sCard("myset");              // SCARD → count of members
await redis.sIsMember("myset", "a");     // SISMEMBER → true/false
await redis.sRem("myset", "a");          // SREM → remove member
```

### Sorted Sets (members with scores)

```js
await redis.zAdd("zset", { score: 1, value: "a" });   // ZADD
await redis.zIncrBy("zset", 1, "a");                   // ZINCRBY
// top 10, highest first:
await redis.zRangeWithScores("zset", 0, 9, { REV: true });
// returns [{ value: "a", score: 5 }, ...]
await redis.zScore("zset", "a");                        // ZSCORE → score
await redis.zRank("zset", "a");                         // ZRANK → rank (0-based)
```

### Lists (ordered, allows duplicates)

```js
await redis.rPush("list", "item");        // RPUSH → append
await redis.lPush("list", "item");        // LPUSH → prepend
await redis.lRange("list", 0, -1);        // LRANGE → get all items
await redis.lLen("list");                 // LLEN → length
await redis.lPop("list");                 // LPOP → remove & return first
await redis.rPop("list");                 // RPOP → remove & return last
```

### Hashes (key → field/value map)

```js
await redis.hSet("hash", { name: "bob", age: "25" });  // HSET
await redis.hGet("hash", "name");                       // HGET → "bob"
await redis.hGetAll("hash");                             // HGETALL → { name: "bob", age: "25" }
await redis.hDel("hash", "name");                        // HDEL
await redis.hExists("hash", "name");                     // HEXISTS → true/false
```

---

## Redis CLI (`redis-cli`)

### Browsing keys

```sh
redis-cli                     # open interactive shell
KEYS *                        # list all keys (careful in prod)
KEYS tweets:*                 # list keys matching a pattern
SCAN 0 MATCH tweets:* COUNT 10   # safer paginated key scan
DBSIZE                        # total number of keys in the db
```

### Inspecting a key

```sh
TYPE mykey                    # returns: string, list, set, zset, hash
TTL mykey                     # time to live (-1 = no expiry, -2 = doesn't exist)
EXISTS mykey                  # 1 if exists, 0 if not
```

### Reading values by type

```sh
# string
GET mykey

# list
LLEN mylist                   # length
LRANGE mylist 0 -1            # all items
LRANGE mylist 0 4             # first 5 items

# set
SCARD myset                   # count
SMEMBERS myset                # all members

# sorted set
ZCARD myzset                  # count
ZRANGE myzset 0 9 REV WITHSCORES   # top 10 with scores

# hash
HGETALL myhash                # all fields and values
HKEYS myhash                  # just the field names
HLEN myhash                   # number of fields
```

### Cleanup

```sh
DEL mykey                     # delete a key
FLUSHDB                       # wipe current database
```

---

### Key notes

- All values stored/returned as **strings** — cast numbers with `String()` before storing, `Number()` after reading
- Method names are **camelCase** versions of Redis commands (e.g. `SISMEMBER` → `sIsMember`)
- Everything is **async/await** — all commands return promises
- `redis.del("key")` works on any data type
