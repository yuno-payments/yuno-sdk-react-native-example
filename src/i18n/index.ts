/**
 * Internationalization (i18n) module
 * 
 * Provides translations for the app in multiple languages.
 * Currently supports: English (en)
 */

import {en} from './en';

// Default language
const defaultLanguage = 'en';

// Available translations
const translations = {
  en,
};

/**
 * Get translations for the current language
 * @returns Translation object
 */
export const useTranslation = () => {
  return translations[defaultLanguage];
};

// Export translation types
export type {TranslationKeys} from './en';

