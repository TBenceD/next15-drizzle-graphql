import { getTranslations, getLocale } from 'next-intl/server';
import { locales } from '@/config/locale';
import GraphQLTest from '@/components/GraphQLTest';

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
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold text-3xl">{t('hello')}</h1>
          <p className="text-gray-600">Next.js 15.3.3 + Drizzle + Supabase + GraphQL Yoga Demo</p>
        </div>

        <GraphQLTest />
      </div>
    </div>
  );
}
