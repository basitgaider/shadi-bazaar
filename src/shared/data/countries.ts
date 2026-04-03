/**
 * Country list for the country selector: ISO code, name, dial code, flag emoji.
 * Uses libphonenumber-js and Intl for data.
 */

import { getCountryCallingCode, getCountries, type CountryCode } from 'libphonenumber-js';

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

function flagEmoji(iso: string): string {
  if (iso.length !== 2) return '';
  return [...iso].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('');
}

export interface CountryOption {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
}

let cached: CountryOption[] | null = null;

export function getCountryOptions(): CountryOption[] {
  if (cached) return cached;
  const list: CountryOption[] = [];
  try {
    const codes = getCountries();
    for (const iso of codes) {
      try {
        const name = displayNames.of(iso) ?? iso;
        const dialCode = getCountryCallingCode(iso as CountryCode);
        list.push({
          iso,
          name,
          dialCode,
          flag: flagEmoji(iso),
        });
      } catch {
        // skip
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    cached = list;
  } catch {
    // fallback empty
  }
  return list;
}

export function getCallingCodeFromCountry(isoCode: string): string {
  if (!isoCode) return '';
  try {
    return getCountryCallingCode(isoCode as CountryCode);
  } catch {
    return '';
  }
}
