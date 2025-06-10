import { locales } from '@/config/locale';
import { getTranslations } from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold text-3xl">{t('hello')}</h1>
          <p className="text-gray-600">Next.js 15.4.0-canary.75 + Drizzle + Supabase + GraphQL Yoga Demo</p>
        </div>

        {/* Authentication Section */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold text-xl">Authentication</h2>
        </div>
      </div>
    </div>
  );
}
