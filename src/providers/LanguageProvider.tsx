import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { PropsWithChildren } from 'react';

interface LanguageProviderProps extends PropsWithChildren {
  locale: string;
}

export const LanguageProvider = async ({ children, locale }: LanguageProviderProps) => {
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
};
