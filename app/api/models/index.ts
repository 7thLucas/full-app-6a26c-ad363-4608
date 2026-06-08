import path from "node:path";
import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createLogger } from "~/lib/logger";

const logger = createLogger("Models");
const modelFilePattern = /\.model\.(ts|tsx|js|mjs|cjs)$/;

async function scanDirectory(dirPath: string, results: Set<string>): Promise<void> {
  const files = await readdir(dirPath, { withFileTypes: true }).catch(() => []);
  for (const file of files) {
    if (file.isFile() && modelFilePattern.test(file.name)) {
      results.add(path.join(dirPath, file.name));
    }
  }
}

async function discoverModelFiles(): Promise<string[]> {
  const modelFilesSet = new Set<string>();

  // Scan app/modules/*/
  const modulesPath = path.join(process.cwd(), "app", "modules");
  const moduleEntries = await readdir(modulesPath, { withFileTypes: true }).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  });

  for (const entry of moduleEntries) {
    if (!entry.isDirectory()) continue;
    const modulePath = path.join(modulesPath, entry.name);
    await scanDirectory(modulePath, modelFilesSet);
    await scanDirectory(path.join(modulePath, "src", "models"), modelFilesSet);
  }

  // Also scan app/erp/models/
  await scanDirectory(path.join(process.cwd(), "app", "erp", "models"), modelFilesSet);

  return [...modelFilesSet].sort();
}

/**
 * Initialize all discovered models by importing them.
 * This ensures that Typegoose/Mongoose models are registered.
 */
export async function initializeModels(): Promise<void> {
  const modelFiles = await discoverModelFiles();

  for (const modelFile of modelFiles) {
    logger.info(`Initializing model from ${path.relative(process.cwd(), modelFile)}`);
    await import(pathToFileURL(modelFile).href);
  }
}
