/**
 * Transfers names and descriptions from D&D'24 source documents
 * (`compendium-data`) into existing AG SRD'24 Babele packs.
 *
 * Usage:
 *   bun scripts/merge-ag-srd24.js [--dry-run]
 */
import { access, glob, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const UNMATCHED_REPORT = path.join(SCRIPT_DIR, "merge-ag-srd24.unmatched.txt");

const SOURCE_ROOT = "compendium-data";
const PACKS = [
  { target: "public/compendium/dnd5e/ag/dnd5e.actors24.json", sourceDir: "actors" },
  { target: "public/compendium/dnd5e/ag/dnd5e.spells24.json", sourceDir: "spells" },
  { target: "public/compendium/dnd5e/ag/dnd5e.equipment24.json", sourceDir: "equipment" },
  { target: "public/compendium/dnd5e/ag/dnd5e.feats24.json", sourceDir: "feats" },
  { target: "public/compendium/dnd5e/ag/dnd5e.origins24.json", sourceDir: "origins" },
  { target: "public/compendium/dnd5e/ag/dnd5e.classes24.json", sourceDir: "classes" },
  { target: "public/compendium/dnd5e/ag/dnd5e.monsterfeatures24.json", sourceDir: "features" },
];

const UUID_PACK_MAP = {
  spells: "spells24",
  equipment: "equipment24",
  actors: "actors24",
  feats: "feats24",
  classes: "classes24",
  origins: "origins24",
  features: "monsterfeatures24",
  tables: "tables24",
  phb: "content24",
  mm: "content24",
  dmg: "content24",
};

const POSSESSIVE_PREFIXES = [
  "Abi-Dalzim's ",
  "Bigby's ",
  "Daern's ",
  "Drawmij's ",
  "Evard's ",
  "Heward's ",
  "Leomund's ",
  "Melf's ",
  "Mordenkainen's ",
  "Nolzur's ",
  "Nystul's ",
  "Otiluke's ",
  "Otto's ",
  "Quaal's ",
  "Rary's ",
  "Tasha's ",
  "Tenser's ",
];

/**
 * AG SRD English names that differ from 2024 source English.
 * Keys and values are matched after {@link normalizeKey}.
 *
 * @type {Record<string, string>}
 */
const NAME_ALIASES = {
  // Spells: SRD dropped caster names or used older titles
  "Arcane Hand": "Bigby's Hand",
  "Arcane Sword": "Mordenkainen's Sword",
  "Arcanist's Magic Aura": "Nystul's Magic Aura",
  "Magical Berries": "Goodberry",

  // Equipment: 2014/SRD titles, typos, and punctuation
  "Ammunition (Varies)": "Ammunition",
  "Amulet of Proof against Detection and Location":
    "Amulet of Protection against Detection and Location",
  "Apparatus of the Crab": "Apparatus of Kwalish",
  "Armor, +1, +2, or +3": "Armor +1,+2, or +3",
  "Assasin's Blood": "Assassin's Blood",
  "Crawler Mucus": "Carrion Crawler Mucus",
  "Dragon Orb": "Orb of Dragonkind",
  "Efficient Quiver": "Quiver of Ehlonna",
  "Gloves of Swimming and Climbing": "Gloves of Swimming and Climbimg",
  "Helm of Comprehending Languages": "Helm of Comprehend Languages",
  "Ioun Stone of Strength": "Ioun Stone of Strenght",
  "Iron Bands": "Iron Bands of Bilarro",
  "Mysterious Deck": "Deck of Many Things",
  "Rod of Resurrection": "Rod of Resurection",
  "Shield, +1, +2, or +3": "Shield +1, +2, or +3",
  "Spider's Sting": "Lolth's Sting",
  "Weapon, +1, +2, or +3": "Weapon +1, +2, or +3",

  // Origins: SRD combined titles vs source split documents
  "Fiendish Legacy, Abyssal": "Abyss Fiendish Legacy",
  "Gnomish Lineage, Forest": "Forest Gnome",
  "Gnomish Lineage, Rock": "Rock Gnome",
  "Tiefling, Abyssal": "Tiefling",
  "Tiefling, Chthonic": "Tiefling",
  "Tiefling, Infernal": "Tiefling",

  // Classes
  "Book of Shadows": "Pact of the Tome",
};

/**
 * AG entries with no standalone source document. Russian labels are taken
 * from parent item text (Deck of Many Things cards, species traits, etc.).
 *
 * @type {Record<string, string>}
 */
const NAME_ONLY_EXCEPTIONS = {
  // Origins traits embedded in species descriptions / advancement titles
  "Breath Weapon": "Губительное дыхание",
  "Giant Ancestry": "Наследие великанов",
  "Otherworldly Presence": "Потустороннее присутствие",
  "Skillful": "Умелость",

  // Classes: folder title without a feature document
  "Epic Boon": "Эпический дар",
  "Unarmed Strike": "Безоружный удар",

  // Equipment: Demon Armor enchantment label
  "Clawed Gauntlet": "Когтистые рукавицы",

  // Equipment: Quiver of Ehlonna compartments
  "Long Compartment": "Большое отделение",
  "Midsize Compartment": "Среднее отделение",
  "Short Compartment": "Маленькое отделение",

  // Equipment: Heward's Handy Haversack pouches
  "Central Pouch": "Центральное отделение",
  "Left Pouch": "Левое отделение",
  "Right Pouch": "Правое отделение",

  // Equipment: unmatched SRD'24 parents, activities, traps, and folders
  "Water (Pint)": "Вода (пинта)",
  "Water, fresh (Pint)": "Вода, пресная (пинта)",
  "Water, salt (Pint)": "Вода, солёная (пинта)",
  "Activate Folding Boat": "Активация складной лодки",
  "Collapsing Roof": "Обрушивающийся потолок",
  "Falling Net": "Падающая сеть",
  "Fire-Casting Statue": "Огнедышащая статуя",
  "Hidden Pit": "Скрытая яма",
  "Poisoned Darts": "Отравленные дротики",
  "Poisoned Needle": "Отравленная игла",
  "Potion of Giant Strength": "Зелье силы великана",
  "Ring of Elemental Command": "Кольцо владыки стихий",
  "Rolling Stone": "Катящийся камень",
  "Spell Scroll": "Свиток заклинания",
  "Spiked Pit": "Яма с шипами",
  "Scroll": "Свиток",

  // Feats: 2024 Ability Score Improvement (no matching source document)
  "Ability Score Improvement": "Увеличение характеристик",

  // Actors: premade sample heroes (bios translated in the Babele pack)
  "Akra": "Акра",
  "Aoth": "Аот",
  "Beiro": "Бейро",
  "Krusk": "Круск",
  "Merric": "Меррик",
  "Morthos": "Мортос",
  "Perrin": "Перрин",
  "Quillathe": "Квиллатэ",
  "Randal": "Рэндал",
  "Riswynn": "Рисвинн",
  "Sefris": "Сефрис",
  "Zanna": "Занна",

  // Equipment: Deck of Many Things cards (headings in the deck item)
  "Balance": "Весы",
  "Comet": "Комета",
  "Donjon": "Донжон",
  "Euryale": "Эвриала",
  "Fates": "Судьбы",
  "Flames": "Пламя",
  "Fool": "Дурак",
  "Gem": "Самоцвет",
  "Jester": "Шут",
  "Key": "Ключ",
  "Knight": "Рыцарь",
  "Moon": "Луна",
  "Puzzle": "Загадка",
  "Rogue": "Плут",
  "Ruin": "Разорение",
  "Sage": "Визирь",
  "Skull": "Череп",
  "Star": "Звезда",
  "Sun": "Солнце",
  "Talons": "Когти",
  "Throne": "Трон",
  "Void": "Пустота",
};

const LEVEL_ORDINALS = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
  6: "6th",
  7: "7th",
  8: "8th",
  9: "9th",
};

const NAME_WITH_ENGLISH = /^(.+?)\s+\[([^\]]+)\]$/;
const SECRET_SECTION =
  /<section\b[^>]*\bclass=(["'])[^"']*\bsecret\b[^"']*\1[^>]*>[\s\S]*?<\/section>/gi;
const UUID_PACK = /Compendium\.ag-fifthpendium\.([A-Za-z0-9_-]+)/g;

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeKey(value) {
  return value
    .replaceAll(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replaceAll(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replaceAll("\u00A0", " ")
    .replaceAll("'", "")
    .replaceAll(/[\u2010-\u2015]/g, "-")
    .replaceAll(/[-/]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * @param {string} name
 * @returns {{ russian: string; english: string } | null}
 */
function parseBracketName(name) {
  const match = NAME_WITH_ENGLISH.exec(name);
  if (!match) {
    return null;
  }

  const russian = match[1].trim();
  const english = normalizeKey(match[2]);
  if (!russian || !english) {
    return null;
  }

  return { russian, english };
}

/**
 * @param {string} filePath
 * @returns {{ russian: string; english: string } | null}
 */
function parseFilenameName(filePath) {
  const base = path.basename(filePath, ".json");
  const parts = base.split("__");
  if (parts.length < 3) {
    return null;
  }

  const englishRaw = parts.at(-2) ?? "";
  const russianRaw = parts.slice(0, -2).join("__");
  const english = normalizeKey(englishRaw.replaceAll("_", " "));
  const russian = russianRaw.replaceAll("_", " ").trim();
  if (!russian || !english) {
    return null;
  }

  return { russian, english };
}

/**
 * @param {string} identifier
 * @returns {string}
 */
function identifierToEnglish(identifier) {
  return identifier
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * True when the system identifier is a slug of the English name, not a rename.
 *
 * @param {string} identifier
 * @param {string} english
 * @returns {boolean}
 */
function identifierAgreesWithEnglish(identifier, english) {
  const identTokens = new Set(identifier.split("-").filter(Boolean));
  const englishTokens = normalizeKey(english).split(" ").filter(Boolean);
  const stop = new Set(["of", "the", "and", "or", "a", "an"]);
  const content = englishTokens.filter((token) => !stop.has(token));
  if (content.length === 0) {
    return true;
  }

  const hits = content.filter(
    (token) =>
      identTokens.has(token) ||
      [...identTokens].some((part) => part.includes(token) || token.includes(part)),
  );

  return hits.length >= Math.ceil(content.length / 2);
}

/**
 * @param {Record<string, unknown>} doc
 * @returns {string}
 */
function sourceIdentifier(doc) {
  const system = doc.system;
  if (typeof system !== "object" || system === null || typeof system.identifier !== "string") {
    return "";
  }

  return system.identifier.trim();
}

/**
 * @param {string} english
 * @returns {string[]}
 */
function englishLookupKeys(english) {
  const normalized = normalizeKey(english);
  /** @type {Set<string>} */
  const keys = new Set();

  /**
   * @param {string} value
   */
  const add = (value) => {
    const key = normalizeKey(value);
    if (key) {
      keys.add(key);
    }
  };

  add(normalized);

  for (const prefix of POSSESSIVE_PREFIXES) {
    const normalizedPrefix = normalizeKey(prefix);
    if (normalized.startsWith(normalizedPrefix)) {
      add(normalized.slice(normalizedPrefix.length));
    }
  }

  const ofThe = normalized.replaceAll(" of the ", " of ");
  if (ofThe !== normalized) {
    add(ofThe);
  }

  const comma = /^([^,]+), (.+)$/.exec(normalized);
  if (comma) {
    add(`${comma[2]} ${comma[1]}`);
  }

  const paren = /^(.+) \((.+)\)$/.exec(normalized);
  if (paren) {
    const base = paren[1];
    const inner = paren[2];
    add(`${inner} ${base}`);
    add(`${base}, ${inner}`);
    if (inner.includes(" ")) {
      add(inner);
    }
    if (/\bgiant\b/.test(inner)) {
      add(base);
    }

    const level = /^level (\d+)$/.exec(inner);
    if (level) {
      const ordinal = LEVEL_ORDINALS[Number(level[1])];
      if (ordinal) {
        add(`${base}, ${ordinal} level`);
      }
    }

    if (inner === "cantrip") {
      add(`${base}, cantrip`);
    }
  }

  return [...keys];
}

/**
 * Lookup keys for an AG Babele entry name, including aliases and SRD formats.
 *
 * @param {string} agName
 * @returns {string[]}
 */
function agLookupKeys(agName) {
  /** @type {Set<string>} */
  const keys = new Set();

  /**
   * @param {string} value
   */
  const add = (value) => {
    for (const key of englishLookupKeys(value)) {
      keys.add(key);
    }
  };

  add(agName);

  const agNormalized = normalizeKey(agName);
  for (const [from, to] of Object.entries(NAME_ALIASES)) {
    if (normalizeKey(from) === agNormalized) {
      add(to);
      break;
    }
  }

  const colon = agName.indexOf(": ");
  if (colon !== -1) {
    add(agName.slice(colon + 2));
  }

  const numbered = /^(.*) \((\d+)\)$/.exec(agName);
  if (numbered) {
    add(numbered[1]);
  }

  const formOnly = /^(.*) \([^)]*form only\)$/i.exec(agName);
  if (formOnly) {
    add(formOnly[1]);
  }

  const comma = /^([^,]+), (.+)$/.exec(agName);
  if (comma) {
    add(comma[2]);
    add(`${comma[2]} ${comma[1]}`);
  }

  return [...keys];
}

/**
 * @param {string} agName
 * @returns {string | undefined}
 */
function lookupNameOnlyException(agName) {
  const agNormalized = normalizeKey(agName);
  for (const [from, russian] of Object.entries(NAME_ONLY_EXCEPTIONS)) {
    if (normalizeKey(from) === agNormalized) {
      return russian;
    }
  }

  return undefined;
}

/**
 * @param {Map<string, SourceEntry[]>} index
 * @param {string} agName
 * @returns {SourceEntry[] | undefined}
 */
function findSourceGroup(index, agName) {
  for (const key of agLookupKeys(agName)) {
    const group = index.get(key);
    if (group && group.length > 0) {
      return group;
    }
  }

  return undefined;
}

/**
 * @param {Record<string, unknown>} doc
 * @returns {boolean}
 */
function isFolderDocument(doc) {
  if (typeof doc._key === "string" && doc._key.startsWith("!folders!")) {
    return true;
  }

  return typeof doc.sorting === "string" && !("system" in doc);
}

/**
 * @param {Record<string, unknown>} doc
 * @returns {string}
 */
function sourceDescription(doc) {
  const system = doc.system;
  if (typeof system !== "object" || system === null) {
    return "";
  }

  const details = "details" in system ? system.details : null;
  if (typeof details === "object" && details !== null && "biography" in details) {
    const biography = details.biography;
    if (
      typeof biography === "object" &&
      biography !== null &&
      typeof biography.value === "string"
    ) {
      return biography.value;
    }
  }

  const description = "description" in system ? system.description : null;
  if (
    typeof description === "object" &&
    description !== null &&
    typeof description.value === "string"
  ) {
    return description.value;
  }

  return "";
}

/**
 * @param {unknown} effects
 * @returns {{ english: string; russian: string; description: string }[]}
 */
function sourceEffects(effects) {
  if (!Array.isArray(effects)) {
    return [];
  }

  /** @type {{ english: string; russian: string; description: string }[]} */
  const result = [];

  for (const effect of effects) {
    if (typeof effect !== "object" || effect === null || typeof effect.name !== "string") {
      continue;
    }

    const parsed = parseBracketName(effect.name);
    if (!parsed) {
      continue;
    }

    const description = typeof effect.description === "string" ? effect.description : "";
    result.push({
      english: parsed.english,
      russian: parsed.russian,
      description,
    });
  }

  return result;
}

/**
 * @typedef {{
 *   file: string;
 *   id: string;
 *   identifier: string;
 *   russian: string;
 *   english: string;
 *   description: string;
 *   effects: { english: string; russian: string; description: string }[];
 * }} SourceEntry
 */

/**
 * @param {string} filePath
 * @param {Record<string, unknown>} doc
 * @returns {SourceEntry | null}
 */
function toSourceEntry(filePath, doc) {
  if (isFolderDocument(doc) || typeof doc.name !== "string") {
    return null;
  }

  const fromName = parseBracketName(doc.name);
  const fromFile = parseFilenameName(filePath);
  const identifier = sourceIdentifier(doc);
  const fromIdentifier = identifier
    ? { russian: doc.name.trim(), english: normalizeKey(identifierToEnglish(identifier)) }
    : null;
  const nameIsEnglish = !/[\u0400-\u04FF]/.test(doc.name);
  const fromPlainName = { russian: doc.name.trim(), english: normalizeKey(doc.name) };
  let parsed =
    fromName ??
    (nameIsEnglish ? fromPlainName : null) ??
    fromFile ??
    fromIdentifier ??
    fromPlainName;
  if (!parsed.russian || !parsed.english) {
    return null;
  }

  // Prefer the identifier when the bracket English names a different item
  // (e.g. Bubble Dash labeled as [Water Breathing]).
  if (
    fromIdentifier &&
    identifier.includes("-") &&
    !identifierAgreesWithEnglish(identifier, parsed.english)
  ) {
    parsed = {
      russian: fromName?.russian ?? parsed.russian,
      english: fromIdentifier.english,
    };
  }

  const id = typeof doc._id === "string" ? doc._id : "";

  return {
    file: filePath,
    id,
    identifier,
    russian: parsed.russian,
    english: parsed.english,
    description: sourceDescription(doc),
    effects: sourceEffects(doc.effects),
  };
}

/**
 * @param {string} root
 * @returns {Promise<SourceEntry[]>}
 */
async function loadSourceEntries(root) {
  const resolved = path.resolve(root);

  try {
    await access(resolved);
  } catch {
    throw new Error(`Source path not found: ${resolved}`);
  }

  /** @type {SourceEntry[]} */
  const entries = [];

  for await (const file of glob("**/*.json", { cwd: resolved })) {
    const filePath = path.join(resolved, file);
    const raw = await readFile(filePath, "utf8");
    /** @type {unknown} */
    let doc;

    try {
      doc = JSON.parse(raw);
    } catch {
      console.warn(`Skipping invalid JSON: ${path.relative(process.cwd(), filePath)}`);
      continue;
    }

    if (typeof doc !== "object" || doc === null) {
      continue;
    }

    const entry = toSourceEntry(filePath, /** @type {Record<string, unknown>} */ (doc));
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * @param {SourceEntry[]} entries
 * @returns {Map<string, SourceEntry[]>}
 */
function indexByEnglish(entries) {
  /** @type {Map<string, SourceEntry[]>} */
  const index = new Map();

  /**
   * @param {string} key
   * @param {SourceEntry} entry
   */
  const add = (key, entry) => {
    const group = index.get(key);
    if (group) {
      if (!group.includes(entry)) {
        group.push(entry);
      }
    } else {
      index.set(key, [entry]);
    }
  };

  for (const entry of entries) {
    for (const key of englishLookupKeys(entry.english)) {
      add(key, entry);
    }
  }

  return index;
}

/**
 * @param {Set<string>} unknownPacks
 * @returns {(html: string) => string}
 */
function createUuidRewriter(unknownPacks) {
  return (html) =>
    html.replaceAll(UUID_PACK, (full, pack) => {
      const mapped = UUID_PACK_MAP[pack];
      if (!mapped) {
        unknownPacks.add(pack);
        return full;
      }

      return `Compendium.dnd5e.${mapped}`;
    });
}

/**
 * @param {string} html
 * @returns {string[]}
 */
function extractSecretSections(html) {
  if (!html) {
    return [];
  }

  return html.match(SECRET_SECTION) ?? [];
}

/**
 * @param {string} sourceHtml
 * @param {string | undefined} agHtml
 * @param {(html: string) => string} rewriteUuids
 * @returns {string | undefined}
 */
function mergeDescription(sourceHtml, agHtml, rewriteUuids) {
  if (!sourceHtml) {
    return agHtml;
  }

  let next = rewriteUuids(sourceHtml);
  const sourceHasSecret = SECRET_SECTION.test(next);
  SECRET_SECTION.lastIndex = 0;

  if (!sourceHasSecret && agHtml) {
    const secrets = extractSecretSections(agHtml);
    if (secrets.length > 0) {
      next += secrets.join("");
    }
  }

  return next;
}

/**
 * @param {SourceEntry[]} group
 * @param {(html: string) => string} rewriteUuids
 * @returns {{ russian: string | null; description: string | null; collision: boolean }}
 */
function resolveGroup(group, rewriteUuids) {
  const names = [...new Set(group.map((entry) => entry.russian))];
  const russian = names.length === 1 ? names[0] : null;

  const descriptions = [...new Set(group.map((entry) => rewriteUuids(entry.description)))];
  const description = descriptions.length === 1 ? descriptions[0] : null;

  return {
    russian,
    description,
    collision: group.length > 1,
  };
}

/**
 * @param {Record<string, unknown>} entry
 * @param {SourceEntry[]} group
 * @param {(html: string) => string} rewriteUuids
 * @returns {number}
 */
function mergeEffects(entry, group, rewriteUuids) {
  const agEffects = entry.effects;
  if (typeof agEffects !== "object" || agEffects === null || Array.isArray(agEffects)) {
    return 0;
  }

  /** @type {Map<string, { russian: string; description: string }>} */
  const byEnglish = new Map();
  for (const source of group) {
    for (const effect of source.effects) {
      byEnglish.set(normalizeKey(effect.english), effect);
    }
  }

  let updated = 0;

  for (const [key, agEffect] of Object.entries(agEffects)) {
    if (typeof agEffect !== "object" || agEffect === null) {
      continue;
    }

    const sourceEffect = byEnglish.get(normalizeKey(key));
    if (!sourceEffect) {
      continue;
    }

    agEffect.name = sourceEffect.russian;
    if (sourceEffect.description) {
      agEffect.description = rewriteUuids(sourceEffect.description);
    }

    updated += 1;
  }

  return updated;
}

/**
 * @typedef {{
 *   matched: number;
 *   nameOnly: number;
 *   unmatched: string[];
 *   effects: number;
 *   collisions: string[];
 * }} PackStats
 */

/**
 * @param {string} targetPath
 * @param {Map<string, SourceEntry[]>} index
 * @param {(html: string) => string} rewriteUuids
 * @param {boolean} dryRun
 * @returns {Promise<PackStats>}
 */
async function mergePack(targetPath, index, rewriteUuids, dryRun) {
  const resolved = path.resolve(targetPath);
  const data = JSON.parse(await readFile(resolved, "utf8"));
  const entries = data.entries;
  if (typeof entries !== "object" || entries === null) {
    throw new Error(`Missing entries object: ${targetPath}`);
  }

  /** @type {PackStats} */
  const stats = {
    matched: 0,
    nameOnly: 0,
    unmatched: [],
    effects: 0,
    collisions: [],
  };

  for (const [key, entry] of Object.entries(entries)) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const group = findSourceGroup(index, key);
    if (!group || group.length === 0) {
      const nameOnly = lookupNameOnlyException(key);
      if (nameOnly) {
        entry.name = nameOnly;
        stats.nameOnly += 1;
        continue;
      }

      stats.unmatched.push(key);
      continue;
    }

    const resolvedGroup = resolveGroup(group, rewriteUuids);
    if (resolvedGroup.collision) {
      stats.collisions.push(key);
    }

    if (resolvedGroup.russian) {
      entry.name = resolvedGroup.russian;
    }

    const agDescription = typeof entry.description === "string" ? entry.description : undefined;
    const merged = mergeDescription(resolvedGroup.description ?? "", agDescription, rewriteUuids);

    if (resolvedGroup.description && merged) {
      entry.description = merged;
      stats.matched += 1;
      if (!resolvedGroup.collision) {
        stats.effects += mergeEffects(entry, group, rewriteUuids);
      }
    } else {
      stats.nameOnly += 1;
    }
  }

  if (!dryRun) {
    await writeFile(resolved, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  return stats;
}

/**
 * Writes unmatched AG entry names to a text file beside this script.
 *
 * @param {{ target: string; unmatched: string[] }[]} packs
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
async function writeUnmatchedReport(packs, outputPath) {
  const lines = [];
  const total = packs.reduce((sum, pack) => sum + pack.unmatched.length, 0);

  lines.push(`Unmatched AG SRD'24 entries: ${total}`);
  lines.push("");

  for (const pack of packs) {
    const relative = path.relative(process.cwd(), pack.target);
    lines.push(`# ${relative} (${pack.unmatched.length})`);

    if (pack.unmatched.length === 0) {
      lines.push("(none)");
    } else {
      for (const name of pack.unmatched) {
        lines.push(name);
      }
    }

    lines.push("");
  }

  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const dryRun = process.argv.slice(2).includes("--dry-run");
  const unknownPacks = new Set();
  const rewriteUuids = createUuidRewriter(unknownPacks);

  /** @type {PackStats[]} */
  const allStats = [];
  /** @type {{ target: string; unmatched: string[] }[]} */
  const unmatchedByPack = [];

  for (const pack of PACKS) {
    const sourceDir = path.join(SOURCE_ROOT, pack.sourceDir);
    const sources = await loadSourceEntries(sourceDir);
    const index = indexByEnglish(sources);
    const stats = await mergePack(pack.target, index, rewriteUuids, dryRun);
    allStats.push(stats);
    unmatchedByPack.push({ target: pack.target, unmatched: stats.unmatched });

    const relative = path.relative(process.cwd(), pack.target);
    const action = dryRun ? "Would update" : "Updated";
    console.log(`\n${relative}`);
    console.log(`  source documents: ${sources.length}`);
    console.log(`  ${action} name+description: ${stats.matched}`);
    console.log(`  name only (description collision or empty): ${stats.nameOnly}`);
    console.log(`  unmatched AG entries: ${stats.unmatched.length}`);
    console.log(`  effects updated: ${stats.effects}`);
    console.log(`  name collisions: ${stats.collisions.length}`);

    if (stats.collisions.length > 0) {
      console.log("  collisions:");
      for (const name of stats.collisions) {
        console.log(`    - ${name}`);
      }
    }

    if (stats.unmatched.length > 0) {
      console.log("  unmatched:");
      for (const name of stats.unmatched) {
        console.log(`    - ${name}`);
      }
    }
  }

  const totals = allStats.reduce(
    (acc, stats) => {
      acc.matched += stats.matched;
      acc.nameOnly += stats.nameOnly;
      acc.unmatched += stats.unmatched.length;
      acc.effects += stats.effects;
      acc.collisions += stats.collisions.length;
      return acc;
    },
    { matched: 0, nameOnly: 0, unmatched: 0, effects: 0, collisions: 0 },
  );

  console.log(`\n${dryRun ? "Dry run" : "Done"}.`);
  console.log(
    `name+description=${totals.matched} name-only=${totals.nameOnly} unmatched=${totals.unmatched} effects=${totals.effects} collisions=${totals.collisions}`,
  );

  if (unknownPacks.size > 0) {
    console.log(`Unknown ag-fifthpendium packs: ${[...unknownPacks].sort().join(", ")}`);
  }

  await writeUnmatchedReport(unmatchedByPack, UNMATCHED_REPORT);
  console.log(`Unmatched report: ${path.relative(process.cwd(), UNMATCHED_REPORT)}`);
}

export {
  SOURCE_ROOT,
  createUuidRewriter,
  findSourceGroup,
  indexByEnglish,
  loadSourceEntries,
  lookupNameOnlyException,
  mergeDescription,
  mergeEffects,
  resolveGroup,
};

const isDirectRun =
  Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  });
}
