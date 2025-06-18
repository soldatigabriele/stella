export function getSiteUrl(pathname) {
    const parts = pathname.split('/').filter(Boolean);
  
    const country = parts[0] || 'uk';
    const language = parts[1] || 'en';
  
    return `/${country}/${language}`;
  }
  