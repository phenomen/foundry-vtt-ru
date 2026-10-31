import { getCompendiumRuntime, registerCompendiumTranslations } from "#helpers";

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "crucible");
}

function originalName(document) {
  return document?.flags?.babele?.originalName ?? document?.originalName ?? document?.name;
}

function actionText(action) {
  return Object.fromEntries(["name", "description", "condition"]
    .filter((field) => typeof action[field] === "string")
    .map((field) => [field, action[field]]));
}

function actionKey(action, translation) {
  for (const key of [originalName(action), action.id]) {
    if (key && Object.hasOwn(translation, key)) return key;
  }
  const matches = Object.entries(translation).filter(([, text]) => text.name === action.name);
  if (matches.length === 1) return matches[0][0];
  return originalName(action) ?? action.id;
}

// During extraction Babele creates an empty embedded context. Unique adventure
// items have no owning Item pack, so index their existing inline dictionaries.
const actionDictionaryIndexes = new WeakMap();

function embeddedActionTranslation(source, action, runtime) {
  const matches = new Map();
  const originalActions = source?.flags?.babele?.originalPayload?.actions;
  for (const pack of runtime?.globalPacks?.values?.() ?? []) {
    if (pack.metadata?.packageName !== "crucible" && !pack.metadata?.id?.startsWith("crucible.")) continue;
    const root = pack.translation;
    if (!root || typeof root !== "object") continue;
    let index = actionDictionaryIndexes.get(root);
    if (!index) {
      index = new Map();
      const visit = (node) => {
        if (!node || typeof node !== "object") return;
        for (const [key, entry] of Object.entries(node)) {
          if (entry?.actions) {
            if (!index.has(key)) index.set(key, []);
            index.get(key).push(entry.actions);
          }
          visit(entry);
        }
      };
      visit(root.entries);
      actionDictionaryIndexes.set(root, index);
    }
    for (const dictionary of index.get(originalName(source)) ?? []) {
      for (const [key, text] of Object.entries(dictionary)) {
        if (originalActions && !Object.hasOwn(originalActions, key)) continue;
        if (text.name !== action.name) continue;
        if (!matches.has(key)) matches.set(key, []);
        matches.get(key).push(text);
      }
    }
  }
  if (matches.size !== 1) return null;
  const [key, texts] = matches.entries().next().value;
  return { key, text: texts.find((text) => text.effects) ?? texts[0] };
}

function effectKey(effect, translation) {
  if (Object.hasOwn(translation, effect.name)) return effect.name;
  const matches = Object.entries(translation).filter(([, name]) => name === effect.name);
  return matches.length === 1 ? matches[0][0] : effect.name;
}

function translateEffectNames(action, translation) {
  if (!Array.isArray(action.effects) || !translation) return action;
  return {
    ...action,
    effects: action.effects.map((effect) => {
      const name = translation[effectKey(effect, translation)];
      return typeof name === "string" ? { ...effect, name } : effect;
    }),
  };
}

function extractEffectNames(action, translation = {}) {
  const entries = (action.effects ?? [])
    .filter((effect) => typeof effect.name === "string" && effect.name.length)
    .map((effect) => [effectKey(effect, translation), effect.name]);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function registerBabeleConverters(babele) {
  babele.registerIdentityExtractors({ crucibleOriginalName: originalName });
  babele.registerConverters({
    // The pregen pack contains level variants with the same English name.
    // Babele exports one entry for that name, so retain its complete item
    // dictionary when the last variant is exported. English source payloads
    // must stay English and are extracted without this translated fallback.
    crucibleActorItems: {
      prepare(context) {
        return context.contextCompendium.documentMappings.converterRegistry.named("document").prepare(context);
      },
      translate(context) {
        return context.contextCompendium.documentMappings.converterRegistry.named("document").translate(context);
      },
      extract(context) {
        const extracted = context.contextCompendium.documentMappings.converterRegistry.named("document").extract(context);
        if (!context.source?.flags?.babele?.hasTranslation) return extracted;
        const known = context.contextCompendium.translationsFor(context.source)?.items;
        return known ? foundry.utils.mergeObject(foundry.utils.deepClone(known), extracted ?? {}) : extracted;
      },
    },
    // Some item types use text here, others use structured system data.
    crucibleText: {
      translate({ value, translation }) {
        if (typeof value !== "string") return undefined;
        return typeof translation === "string" ? translation : value;
      },
      extract({ value }) {
        return typeof value === "string" ? value : undefined;
      },
    },
    // Actions are plain system data. Resolve their English keys even after
    // translation, without adding unsupported fields to the action schema.
    crucibleActions: {
      translate({ value, translation }) {
        if (!Array.isArray(value) || !translation) return value;
        return value.map((action) => {
          const key = actionKey(action, translation);
          const translated = translation[key];
          if (!translated) return action;
          const result = translateEffectNames({ ...action, ...actionText(translated) }, translated.effects);
          if (action.regionBehavior && typeof translated.regionName === "string") {
            result.regionBehavior = { ...action.regionBehavior, name: translated.regionName };
          }
          const regionAction = action.regionBehavior?.system?.action;
          if (regionAction && translated.regionAction) {
            result.regionBehavior = {
              ...(result.regionBehavior ?? action.regionBehavior),
              system: {
                ...action.regionBehavior.system,
                action: translateEffectNames(
                  { ...regionAction, ...actionText(translated.regionAction) },
                  translated.regionAction.effects,
                ),
              },
            };
          }
          return result;
        });
      },
      extract({ value, source, contextCompendium, runtime }) {
        if (!Array.isArray(value) || !value.length) return undefined;
        // Embedded extraction may have no inline dictionary. Reuse the owning
        // Item pack to retain English action keys after fallback translation.
        const inline = contextCompendium?.translationsFor(source)?.actions;
        const activeRuntime = getCompendiumRuntime(runtime);
        const owner = inline ? null : activeRuntime?.translatedPackFor?.(contextCompendium?.metadata?.type ?? "Item", source, {
          predicate: (pack) => Boolean(pack.translationsFor(source)?.actions),
        });
        const translation = inline ?? owner?.translationsFor(source)?.actions ?? {};
        const result = {};
        for (const action of value) {
          const embedded = embeddedActionTranslation(source, action, activeRuntime);
          const key = embedded?.key ?? actionKey(action, translation);
          if (!key) continue;
          const translated = translation[key] ?? embedded?.text ?? {};
          const text = actionText(action);
          const effects = extractEffectNames(action, translated.effects);
          if (effects) text.effects = effects;
          if (typeof action.regionBehavior?.name === "string") text.regionName = action.regionBehavior.name;
          const regionAction = action.regionBehavior?.system?.action;
          if (regionAction) {
            text.regionAction = actionText(regionAction);
            const effects = extractEffectNames(regionAction, translated.regionAction?.effects);
            if (effects) text.regionAction.effects = effects;
          }
          if (Object.hasOwn(result, key)) {
            throw new Error("Conflicting Crucible action key: " + key);
          }
          result[key] = text;
        }
        return result;
      },
    },

    // Keep category/folder dictionaries keyed exactly as in the English exports.
    crucibleNames: {
      translate({ value, translation }) {
        if (!Array.isArray(value)) return value;
        return value.map((document) => {
          const key = originalName(document);
          const name = translation?.[key];
          if (typeof name !== "string") return document;
          return {
            ...document,
            name,
            flags: {
              ...document.flags,
              babele: { ...document.flags?.babele, originalName: key },
            },
          };
        });
      },
      extract({ value }) {
        if (!Array.isArray(value) || !value.length) return undefined;
        const result = {};
        for (const document of value) {
          const key = originalName(document);
          if (!key || typeof document.name !== "string") continue;
          if (Object.hasOwn(result, key) && result[key] !== document.name) {
            throw new Error("Conflicting Crucible collection names: " + key);
          }
          result[key] = document.name;
        }
        return result;
      },
    },
  });
}
