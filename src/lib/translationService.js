let cachedTranslations = null;

export async function getTranslations() {
    if (cachedTranslations) return cachedTranslations;
    console.log('get new Translations');

  const res = await fetch('https://polyglot.globusgroup.com/api/v1/translations');
  if (!res.ok) {
    throw new Error('Could not load translations');
  }

  cachedTranslations = await res.json();
  return cachedTranslations;
}
