const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');

// Replace with your domain
const hostname = 'https://example.com';

// Your Angular app routes
const routes = [
  '/', 
  '/about', 
  '/contact', 
  '/products', 
  '/blog'
];

// Create a stream to write the sitemap
const sitemap = new SitemapStream({ hostname });
const writeStream = fs.createWriteStream('./src/sitemap.xml');

sitemap.pipe(writeStream);

routes.forEach(route => {
  sitemap.write({
    url: route,
    changefreq: 'weekly',
    priority: 0.8,
  });
});

sitemap.end();

streamToPromise(sitemap)
  .then(() => {
    console.log('sitemap.xml generated successfully!');
  })
  .catch((error) => {
    console.error('Error generating sitemap:', error);
  });
