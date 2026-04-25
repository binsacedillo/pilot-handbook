import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pilot-handbook.vercel.app';
  
  // Public routes for indexing
  const routes = [
    '',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/help',
    '/sign-in',
    '/sign-up',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
