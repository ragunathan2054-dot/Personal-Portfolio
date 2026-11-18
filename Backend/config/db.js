import mongoose from "mongoose";
import { AsyncLocalStorage } from "node:async_hooks";

const requestDb = new AsyncLocalStorage();

const WORKER_CONNECTION_OPTIONS = {
  maxPoolSize: 1,
  minPoolSize: 0,
  serverMonitoringMode: "poll",
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  autoIndex: false,
  autoCreate: false,
};

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
export async function runWithRequestDb(uri, fn) {
  const store = { uri, conn: null };
  try {
    return await requestDb.run(store, fn);
  } finally {
    if (store.conn) {
      store.conn.close().catch((err) => console.error("MongoDB close failed:", err.message));
    }
  }
}

function getRequestConnection() {
  const store = requestDb.getStore();
  if (!store) return null;
  if (!store.conn) {
    if (!store.uri) throw new Error("MONGO_URI is not configured.");
    store.conn = mongoose.createConnection(store.uri, WORKER_CONNECTION_OPTIONS);
    // Queries wait for the connection; a failure surfaces through them.
    store.conn.asPromise().catch((err) => console.error("MongoDB connection failed:", err.message));
  }
  return store.conn;
}

// Drop-in replacement for mongoose.model(name, schema).
export function defineModel(name, schema) {
  const defaultModel = mongoose.model(name, schema);

  const resolve = () => {
    const conn = getRequestConnection();
    if (!conn) return defaultModel;
    return conn.models[name] || conn.model(name, schema);
  };
  return new Proxy(function () {}, {
    get(_target, prop) {
      const model = resolve();
      const value = model[prop];
      return typeof value === "function" ? value.bind(model) : value;
    },
    construct(_target, args) {
      return new (resolve())(...args);
    },
  });
}
