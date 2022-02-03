const redis = require("redis");
const client = redis.createClient();
client.connect();

client.on("error", (error) => {
  console.log(error);
});

client.on("connect", () => {
  console.log("Connected!");
});

client.set("framework", "ReactJS", function (err, reply) {
  console.log(reply); // OK
});

client.get("framework", function (err, reply) {
  console.log(reply); // ReactJS
});
