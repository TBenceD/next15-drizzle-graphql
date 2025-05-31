import deepmerge from 'deepmerge';
import type { AbstractIntlMessages } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale, defaultLocale } from '@/config/locale';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Use default locale if locale is undefined (happens with localePrefix: 'as-needed')
  const resolvedLocale = locale || defaultLocale;

  // Validate that the resolved locale is valid
  if (!locales.includes(resolvedLocale as Locale)) {
    throw new Error(`Invalid locale: ${resolvedLocale}`);
  }

  const userMessages = (await import(`../../messages/${resolvedLocale}.json`)).default;
  const defaultMessages = (await import('../../messages/hu.json')).default;

  const messages = deepmerge(defaultMessages, userMessages) as AbstractIntlMessages;

  return {
    locale: resolvedLocale,
    messages
  };
});
