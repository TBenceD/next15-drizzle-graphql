import { getTranslations, getLocale } from 'next-intl/server';
import { locales } from '@/config/locale';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home() {
  // Debug: check what locale is detected
  const currentLocale = await getLocale();
  console.log('Page component - detected locale:', currentLocale);

  // No need to pass locale - it's automatically detected from setRequestLocale
  const t = await getTranslations();

  console.log('Page component - translation for hello:', t('hello'));

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <h1>{t('hello')}</h1>
    </div>
  );
}
