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

  const cors = require("cors");

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

  // CORS configuration
  // const corsOptions = {
  //   origin: "http://localhost:4000",
  //   credentials: true,
  // };

  // var corsOptions = {
  //   origin: "*",
  //   credentials: true,
  // };

  // Start Apollo Server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    //cors: cors(corsOptions),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  // Start GraphQL within Node.js Server
  await apolloServer.start();

  // var mw = apolloServer.getMiddleware({
  //   cors: {
  //     credentials: true,
  //     origin: "*",
  //     preflightContinue: true,
  //   },
  // });

  // Access-Control-Allow-Origin: https://studio.apollographql.com
  // Access-Control-Allow-Credentials: true
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    // Set custom headers for CORS
    res.header(
      "Access-Control-Allow-Headers",
      "Content-type,Accept,X-Custom-Header"
    );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return next();
  });

  //app.use(cors());

  // var cors = require("cors");
  // app.use(cors({ credentials: true, origin: "http://localhost:4000" }));

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

  var whitelist = [
    "http://127.0.0.1:4000",
    "https://studio.apollographql.com",
    "http://localhost:4000",
  ];
  var corsOptions = {
    origin: function (
      origin: string,
      callback: (arg0: null, arg1: boolean) => void
    ) {
      var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
    },
    credentials: true,
  };
  app.use(cors(corsOptions));

  // module.exports = (req, res, next) => {
  //   // CORS headers
  //   res.header("Access-Control-Allow-Origin", "YOUR_URL"); // restrict it to the required domain
  //   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  //   // Set custom headers for CORS
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Content-type,Accept,X-Custom-Header"
  //   );

  //   if (req.method === "OPTIONS") {
  //     return res.status(200).end();
  //   }

  //   return next();
  // };

  // Setup GraphQL Server
  apolloServer.applyMiddleware({ app });

  // Start Node Listening for Requests
  app.listen(4000, () => {
    console.log("web server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
