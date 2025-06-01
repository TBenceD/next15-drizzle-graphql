import type { Permission } from '@/types/global-types';
export const publicRoutes = ['/auth'];

export const authorizedRoutes: { path: string; permissions: Permission[] }[] = [];
