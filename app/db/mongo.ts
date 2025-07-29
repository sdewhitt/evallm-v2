import { MongoClient, ServerApiVersion } from 'mongodb';


// IMPORTANT: Only create one client and do not close every time it is used. Many production errors will happen otherwise
const client = new MongoClient(process.env.MONGODB_URI as string, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

export default client;