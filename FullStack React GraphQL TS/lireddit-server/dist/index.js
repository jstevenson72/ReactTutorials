"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const User_1 = require("./resolvers/User");
const redis_1 = require("redis");
const express_session_1 = __importDefault(require("express-session"));
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    let RedisStore = require("connect-redis")(express_session_1.default);
    let redisClient = (0, redis_1.createClient)();
    redisClient.on("connect", () => {
        console.log("Connected to Redis");
    });
    redisClient.on("error", (err) => {
        console.log("Redis error: " + err);
    });
    redisClient.connect();
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, User_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res }),
    });
    app.listen(4000, () => {
        console.log("web server started on localhost:4000");
    });
    await apolloServer.start();
    app.use((0, express_session_1.default)({
        name: "qid",
        store: new RedisStore({
            client: redisClient,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        },
        secret: "falksjdfkasodjfsd",
        resave: false,
        saveUninitialized: false,
    }));
    var cors = require("cors");
    app.use(cors());
    apolloServer.applyMiddleware({ app, cors });
};
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map