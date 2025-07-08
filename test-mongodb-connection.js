const { MongoClient, ServerApiVersion } = require('mongodb');

// Replace with your actual credentials
const uri = "mongodb+srv://<db_username>:<db_password>@stayonbeat.sktdmwn.mongodb.net/?retryWrites=true&w=majority&appName=stayonbeat";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
