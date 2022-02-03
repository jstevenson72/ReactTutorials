import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/User";
import { createClient } from "redis";
import session from "express-session";
import { __prod__ } from "./constants";
import { MyContext } from "./types";

const main = async () => {
  // App Main Function

  // Setup MikroORM Database
  const orm = await MikroORM.init(microConfig);

  // Migrate any Datamodel Changes to the Database
  await orm.getMigrator().up();

  // Setup Node.js Server
  const app = express();

  // Setup Redis Client Connection
  let RedisStore = require("connect-redis")(session);
  let redisClient = createClient();
  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });
  redisClient.on("error", (err) => {
    console.log("Redis error: " + err);
  });
  redisClient.connect();

  // Start Apollo Server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  // Start Node Listening for Requests
  app.listen(4000, () => {
    console.log("web server started on localhost:4000");
  });

  // Start GraphQL within Node.js Server
  await apolloServer.start();

  // Register Redis with Node.js Server
  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
      secret: "falksjdfkasodjfsd", // Make Env Variable For Security
      resave: false,
      saveUninitialized: false,
    })
  );

  // Setup GraphQL Server
  var cors = require("cors");
  //app.options("*", cors());
  app.use(cors());

  apolloServer.applyMiddleware({ app, cors });
};

main().catch((err) => {
  console.error(err);
});
