import { MongoClient, ServerApiVersion, type Db } from "mongodb";

const uri = process.env.MONGODB_URI || import.meta.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || import.meta.env.MONGODB_DB_NAME || "profuso";

if (!uri) {
  throw new Error("MONGODB_URI is not set in .env");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDatabase(): Promise<Db> {
  try {
    // Checar si ya hay una conexión en caché
    if (cachedClient && cachedDb) {
      return cachedDb;
    }

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      },
      appName: "profuso-web", 
    });

    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return db;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw new Error("Failed to connect to MongoDB");
  }
}
