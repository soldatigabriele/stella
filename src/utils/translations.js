import { getTranslations } from '../lib/translationService.js';

const translations = await getTranslations();

// export function t (key, ...args) {
//   let str = translations[language]?.[key] || key;
//   return str.replace(/{(\d+)}/g, (match, number) =>
//     typeof args[number] !== 'undefined' ? args[number] : match
//   );
// }

function substituteArgs(str, args) {
    if (str === undefined) {
        return '';
    }
    return str.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
}

// export function t(key, ...args) {
//     const lang = document.body.dataset.siteLanguage || 'en';
//     return t_lang(key, lang, ...args);
// }

export function t_lang(key, l, ...args) {
    var lang = l || 'en';
    lang = lang.toLowerCase();
    const langTranslations = translations;
    if (langTranslations && langTranslations[lang] && langTranslations[lang][key]) {
        return substituteArgs(langTranslations[lang][key], args);
    }
    return substituteArgs(key, args); // Fallback to the key if not found
}
