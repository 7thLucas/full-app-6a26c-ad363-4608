import path from "node:path";
import { pathToFileURL } from "node:url";
import { readdir } from "node:fs/promises";
import { createLogger } from "~/lib/logger";

const logger = createLogger("Seed");

type SeedFunction = () => Promise<void> | void;
type SeedModule = Record<string, unknown> & {
  default?: unknown;
};

interface DiscoveredSeed {
  exportName: string;
  filePath: string;
  run: SeedFunction;
}

const seedFilePattern = /\.seed\.(ts|tsx|js|mjs|cjs)$/;

async function scanDirectory(dirPath: string, results: Set<string>): Promise<void> {
  const files = await readdir(dirPath, { withFileTypes: true }).catch(() => []);
  for (const file of files) {
    if (file.isFile() && seedFilePattern.test(file.name)) {
      results.add(path.join(dirPath, file.name));
    }
  }
}

async function discoverSeedFiles(): Promise<string[]> {
  const seedFilesSet = new Set<string>();

  // Scan app/modules/*/
  const modulesPath = path.join(process.cwd(), "app", "modules");
  const moduleEntries = await readdir(modulesPath, { withFileTypes: true }).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  });

  for (const entry of moduleEntries) {
    if (!entry.isDirectory()) continue;
    const modulePath = path.join(modulesPath, entry.name);
    await scanDirectory(modulePath, seedFilesSet);
    await scanDirectory(path.join(modulePath, "src", "seeds"), seedFilesSet);
  }

  // Also scan app/erp/seeds/
  await scanDirectory(path.join(process.cwd(), "app", "erp", "seeds"), seedFilesSet);

  return [...seedFilesSet].sort();
}

function getSeedFunctions(filePath: string, seedModule: SeedModule): DiscoveredSeed[] {
  const seedFunctions = new Map<string, SeedFunction>();

  if (typeof seedModule.default === "function") {
    seedFunctions.set("default", seedModule.default as SeedFunction);
  }

  for (const [exportName, exportedValue] of Object.entries(seedModule)) {
    if (exportName === "default") continue;
    if (!/^seed[A-Z]/.test(exportName)) continue;
    if (typeof exportedValue !== "function") continue;

    seedFunctions.set(exportName, exportedValue as SeedFunction);
  }

  return [...seedFunctions.entries()].map(([exportName, run]) => ({
    exportName,
    filePath,
    run,
  }));
}

async function discoverSeeds(): Promise<DiscoveredSeed[]> {
  const seedFiles = await discoverSeedFiles();
  const discoveredSeeds: DiscoveredSeed[] = [];

  for (const filePath of seedFiles) {
    const seedModule = await import(pathToFileURL(filePath).href) as SeedModule;
    discoveredSeeds.push(...getSeedFunctions(filePath, seedModule));
  }

  return discoveredSeeds;
}

/**
 * Run all seed functions
 * This is the main entry point for module seed discovery.
 */
export async function runSeeds(): Promise<void> {
  logger.info("Starting seed operations...");

  try {
    const seeds = await discoverSeeds();

    for (const seed of seeds) {
      logger.info(`Running seed ${seed.exportName} from ${path.relative(process.cwd(), seed.filePath)}`);
      await seed.run();
    }

    logger.info("All seed operations completed successfully");
  } catch (error) {
    logger.error("Seed operations failed:", error);
    logger.warn("Server will continue despite seeding failure");
  }
}
