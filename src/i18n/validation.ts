import enDict from './dictionaries/en.json';
import hiDict from './dictionaries/hi.json';
import { TranslationDictionary } from './types';

export interface I18nValidationResult {
  valid: boolean;
  missingKeysInHindi: string[];
  missingKeysInEnglish: string[];
  totalKeys: number;
}

function collectKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

export function validateDictionaries(): I18nValidationResult {
  const enKeys = new Set(collectKeys(enDict));
  const hiKeys = new Set(collectKeys(hiDict));

  const missingKeysInHindi = Array.from(enKeys).filter((k) => !hiKeys.has(k));
  const missingKeysInEnglish = Array.from(hiKeys).filter((k) => !enKeys.has(k));

  return {
    valid: missingKeysInHindi.length === 0 && missingKeysInEnglish.length === 0,
    missingKeysInHindi,
    missingKeysInEnglish,
    totalKeys: enKeys.size
  };
}
