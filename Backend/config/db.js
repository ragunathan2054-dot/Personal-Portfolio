import mongoose from "mongoose";
import { AsyncLocalStorage } from "node:async_hooks";

// ---------------------------------------------------------------------------
// Two ways this backend talks to MongoDB:
//
// 1. Node server (Render / local `npm run dev`): one long-lived connection
//    opened at startup with connectDB(). Models use mongoose's default
//    connection, exactly as before.
//
// 2. Cloudflare Workers: a Worker is not allowed to reuse a socket opened by
//    a different request, so a shared connection does not work there. Instead
//    each request gets its own short-lived connection (opened lazily, only if
//    the request actually touches the database) and it is closed when the
//    request is done. runWithRequestDb() sets that up.
//
// Controllers don't need to know which mode they're in: models created with
// defineModel() look up the right connection on every call.
// ---------------------------------------------------------------------------

const requestDb = new AsyncLocalStorage();

// Settings for the per-request connection used in Workers.
const WORKER_CONNECTION_OPTIONS = {
  maxPoolSize: 1,
  minPoolSize: 0,
  // "poll" uses one monitoring socket per server instead of two, which keeps
  // us under the Workers limit of 6 simultaneous connections per request.
  serverMonitoringMode: "poll",
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  // Indexes already exist in the database; don't try to build them on every
  // short-lived connection.
  autoIndex: false,
  autoCreate: false,
};

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    // Stop the server on a failed DB connection on purpose — a server that
    // "runs" but silently fails every write is worse than one that never starts.
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

// Workers only: run fn() with a request-scoped connection available to models.
// The connection is created on first use and closed after fn() finishes.
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

  // A plain function target keeps Proxy invariants simple; every property and
  // call is forwarded to the model for the current connection.
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
