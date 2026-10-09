import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boki.vn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/books', '/schedule', '/blog', '/preview'],
        disallow: [
          '/admin',
          '/admin/*',
          '/cart',
          '/checkout',
          '/checkout/*',
          '/profile',
          '/profile/*',
          '/orders',
          '/orders/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
