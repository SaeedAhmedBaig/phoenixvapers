import dns from "dns";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

// Some networks fail Node's DNS SRV lookups (used by mongodb+srv:// URIs)
// against their default resolver even though the same records resolve fine
// via the OS resolver. Trying public resolvers first, with the original
// servers kept as a fallback, avoids that class of "querySrv ECONNREFUSED"
// failure without weakening DNS resolution elsewhere. Applied here (rather
// than only in main.ts) so it also covers the standalone seed script.
dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);

/**
 * Resolves the MongoDB connection string. In non-production environments
 * with no MONGODB_URI configured, an in-memory MongoDB instance is booted
 * so the API runs with zero external setup. This is a real MongoDB engine
 * (not a mock/stub) — set MONGODB_URI to persist data across restarts.
 */
/** Extracts the database name from a mongodb(+srv):// URI's path segment, if any. */
function hasExplicitDatabaseName(uri: string): boolean {
  const afterScheme = uri.replace(/^mongodb(\+srv)?:\/\//, "");
  const afterHost = afterScheme.slice(afterScheme.indexOf("/") + 1);
  const pathSegment = afterHost.split("?")[0];
  return pathSegment.trim().length > 0;
}

async function resolveMongoUri(config: ConfigService): Promise<string> {
  const configured = config.get<string>("mongodbUri");
  if (configured) {
    // A URI with no database name connects to the driver's default database,
    // which is dangerous on a cluster shared with other projects — it can
    // silently read/write another application's collections. Fail loudly
    // instead of guessing.
    if (!hasExplicitDatabaseName(configured)) {
      throw new Error(
        "MONGODB_URI has no database name in its path (e.g. \".../phoenix-vapers?...\"). " +
          "Add one before starting the app — connecting without an explicit database name " +
          "risks colliding with unrelated data on a shared cluster.",
      );
    }
    return configured;
  }

  if (config.get<string>("nodeEnv") === "production") {
    throw new Error("MONGODB_URI must be set in production");
  }

  // mongodb-memory-server is a devDependency and absent from production
  // installs; this branch is unreachable there (guarded by the throw above).
  // @ts-ignore -- module types unavailable when devDependencies are pruned
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const instance = await MongoMemoryServer.create({
    instance: { dbName: "phoenix-vapers" },
  });
  // eslint-disable-next-line no-console
  console.log(
    "MONGODB_URI not set — using an in-memory MongoDB instance for this dev session. Data will not persist between restarts.",
  );
  return instance.getUri();
}

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: await resolveMongoUri(config),
      }),
    }),
  ],
})
export class DatabaseModule {}
