/**
 * Initiate the local single-node replica set (idempotent).
 * Invoked by scripts/start-mongo.ps1 from the apps/api directory so that
 * `mongoose` resolves from that workspace's dependencies.
 */
import { createRequire } from "node:module";

const require = createRequire(`${process.cwd()}/`);
const mongoose = require("mongoose");

const uri = "mongodb://127.0.0.1:27017/admin?directConnection=true";

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  const admin = mongoose.connection.db.admin();

  try {
    await admin.command({
      replSetInitiate: {
        _id: "rs0",
        members: [{ _id: 0, host: "127.0.0.1:27017" }],
      },
    });
    console.log("Replica set rs0 initiated.");
  } catch (error) {
    if (/already initialized/i.test(String(error.message))) {
      console.log("Replica set rs0 already initiated.");
    } else {
      throw error;
    }
  }
} finally {
  await mongoose.disconnect();
}
