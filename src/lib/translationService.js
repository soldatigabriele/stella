let cachedTranslations = null;

export async function getTranslations() {
    console.log('getTranslations');
  if (cachedTranslations) return cachedTranslations;

  const res = await fetch('https://polyglot.globusgroup.com/api/v1/translations');
  if (!res.ok) {
    throw new Error('Could not load translations');
  }

  cachedTranslations = await res.json();
  return cachedTranslations;
}
