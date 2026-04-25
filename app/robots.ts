import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pilot-handbook.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', 
        '/admin/', 
        '/dashboard/', 
        '/settings/', 
        '/tools/',
        '/flights/new',
        '/aircraft/new'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
