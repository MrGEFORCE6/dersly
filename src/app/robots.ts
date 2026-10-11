import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/student',
        '/settings',
        '/chat',
        '/messages',
        '/parent',
        '/feed/teachers',
      ],
    },
    sitemap: 'https://rad-marigold-ff55c6.netlify.app/sitemap.xml',
  };
}
