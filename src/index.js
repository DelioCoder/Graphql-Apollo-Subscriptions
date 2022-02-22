const express = require('express');
const { createServer } = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const { makeExecutableSchema } = require('@graphql-tools/schema');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./graphql/typeDef');
const resolvers = require('./graphql/resolvers');

(async function() {

    const app = express();

    const httpServer = createServer(app);

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });

    const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe },
        { server: httpServer, path: '/graphql' }
    );
    
    const server = new ApolloServer({
        schema,
        plugins: [
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        }
                    };
                }
            }
        ]
    });

    await server.start();
    server.applyMiddleware({ app });

    mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

    httpServer.listen(4000, () => {
        console.log(`Http server is now running on port 4000`);
    });

})();