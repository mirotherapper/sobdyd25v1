require('dotenv').config({ path: '.env.local' });
const { MongoClient, ServerApiVersion } = require('mongodb');

// Use the MongoDB URI from your .env.local file
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

console.log('MongoDB URI:', uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'Not found');
console.log('Database Name:', dbName);

if (!uri) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
    
    // Test connection to your specific database
    if (dbName) {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      console.log(`📊 Database "${dbName}" contains ${collections.length} collections:`, 
        collections.map(c => c.name));
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    
    if (error.code === 8000) {
      console.log("\n🔧 Troubleshooting tips:");
      console.log("1. Check if your MongoDB Atlas cluster is running");
      console.log("2. Verify your database username and password");
      console.log("3. Make sure your IP address is whitelisted in MongoDB Atlas");
      console.log("4. Check if the database user has the correct permissions");
    }
  } finally {
    // Close the connection
    await client.close();
    console.log("🔌 Connection closed");
  }
}

run().catch(console.error);
