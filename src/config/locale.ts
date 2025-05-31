export type Locale = (typeof locales)[number];

export const locales = ['hu', 'en'] as const;
export const defaultLocale: Locale = 'hu';
