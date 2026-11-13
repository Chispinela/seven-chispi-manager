const fs = require("node:fs/promises");
const path = require("node:path");
const { parseVdf } = require("./core.cjs");
const catalog = require("../assets/sandbox-options.json");

const versionsByBuild = {
  24994542: "3.2.0",
  25661908: "3.3.0",
  26237934: "3.4.0",
};

async function sandboxInfo(server) {
  const manifest = await fs
    .readFile(
      path.join(server.directory, "steamapps", "appmanifest_294420.acf"),
      "utf8",
    )
    .catch(() => "");
  let build;
  try {
    build = parseVdf(manifest).AppState?.buildid;
  } catch {}
  // A locally installed build takes precedence over a pending branch change.
  const version = build
    ? versionsByBuild[build]
    : server.branch.replace(/^v/, "");
  const table = catalog.versions[version];
  const options = typeof table === "string" ? catalog.versions[table] : table;
  return {
    version,
    options,
    presets: version === "3.4.0" ? catalog.presets : [],
  };
}

async function availableWorlds(directory) {
  const worlds = new Map([
    ["navezgane", "Navezgane"],
    ["rwg", "RWG"],
  ]);
  for (const folder of [
    path.join(directory, "Data", "Worlds"),
    path.join(directory, "userdata", "GeneratedWorlds"),
  ]) {
    for (const entry of await fs
      .readdir(folder, { withFileTypes: true })
      .catch(() => [])) {
      if (!entry.isDirectory()) continue;
      const map = await fs
        .stat(path.join(folder, entry.name, "map_info.xml"))
        .catch(() => null);
      if (map?.isFile()) worlds.set(entry.name.toLowerCase(), entry.name);
    }
  }
  return [...worlds.values()];
}

const migratedOptions = new Set(
  (
    "GameDifficulty BlockDamagePlayer BlockDamageAI BlockDamageAIBM XPMultiplier " +
    "DayNightLength DayLightLength BiomeProgression StormFreq DeathPenalty DropOnDeath " +
    "DropOnQuit JarRefund EnemySpawnMode EnemyDifficulty ZombieFeralSense ZombieMove " +
    "ZombieMoveNight ZombieFeralMove ZombieBMMove AISmellMode BloodMoonFrequency " +
    "BloodMoonRange BloodMoonWarning BloodMoonEnemyCount LootAbundance LootRespawnDays " +
    "AirDropFrequency AirDropMarker QuestProgressionDailyLimit"
  ).split(/\s+/),
);

function effectiveConfig(stock, saved) {
  const values = { ...stock, ...saved };
  if (Object.hasOwn(stock, "SandboxCode")) {
    for (const key of migratedOptions) {
      if (!Object.hasOwn(stock, key)) delete values[key];
    }
  } else if (Object.hasOwn(stock, "GameDifficulty")) {
    delete values.SandboxCode;
  }
  return values;
}

module.exports = { sandboxInfo, availableWorlds, effectiveConfig };
