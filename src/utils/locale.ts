'use server';

import { COOKIE_NAME } from '@/config/common';
import { defaultLocale, type Locale } from '@/config/locale';
import { cookies } from 'next/headers';

export async function getUserLocale() {
  const cookie = await cookies();
  return cookie.get(COOKIE_NAME)?.value ?? defaultLocale;
}
export async function setUserLocale(locale: Locale) {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, locale);
}
