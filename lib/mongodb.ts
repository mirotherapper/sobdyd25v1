import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across hot reloads
  if (!(global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> })._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> })._mongoClientPromise = client.connect();
  }
  clientPromise = (global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> })._mongoClientPromise!;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;