import type { PropsWithChildren } from 'react';
import { LanguageProvider } from './LanguageProvider';

interface ProvidersProps extends PropsWithChildren {
  locale: string;
}

export const Providers = ({ children, locale }: ProvidersProps) => {
  return <LanguageProvider locale={locale}>{children}</LanguageProvider>;
};
