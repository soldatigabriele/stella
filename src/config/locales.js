// Centralized configuration for locales and search indexes
export const LOCALES = [
  {
    country: "uk",
    language: "en",
    label: "🇬🇧 UK",
    indexEnvVar: "SEARCH_INDEX_UK",
    defaultIndex: "staging_products_uk_en-gb"
  },
  {
    country: "it", 
    language: "it",
    label: "🇮🇹 IT",
    indexEnvVar: "SEARCH_INDEX_IT",
    defaultIndex: "staging_products_it_it"
  },
  {
    country: "de",
    language: "de", 
    label: "🇩🇪 DE",
    indexEnvVar: "SEARCH_INDEX_DE",
    defaultIndex: "staging_products_de_de"
  }
];

// Helper functions
export function getStaticPaths() {
  return LOCALES.map(({ country, language }) => ({
    params: { country, language }
  }));
}

export function getIndexes() {
  const indexes = {};
  LOCALES.forEach(({ country, indexEnvVar, defaultIndex }) => {
    indexes[country] = import.meta.env[indexEnvVar] || defaultIndex;
  });
  return indexes;
}

export function getLocaleUrls(baseParts = []) {
  const urls = {};
  LOCALES.forEach(({ country, language }) => {
    const key = `${country}Url`;
    urls[key] = '/' + [country, language, ...baseParts].join('/');
  });
  return urls;
}

export function generateLocaleUrls(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  return getLocaleUrls(parts.slice(2));
}

export function findLocaleByLanguage(lang) {
  return LOCALES.find(locale => locale.language === lang);
}

export function findLocaleByCountry(country) {
  return LOCALES.find(locale => locale.country === country);
} 