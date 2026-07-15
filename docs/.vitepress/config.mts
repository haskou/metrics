import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@haskou/metrics',
  description: 'Framework-agnostic metrics instrumentation for TypeScript.',
  base: '/metrics/',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started/introduction' },
      { text: 'Reference', link: '/reference/' },
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Basic usage', link: '/getting-started/basic-usage' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Public API', link: '/reference/' },
          {
            text: 'Configuration and naming',
            link: '/reference/configuration',
          },
          { text: 'Ports and records', link: '/reference/contracts' },
          { text: 'Writing adapters', link: '/reference/adapters' },
          { text: 'Testing', link: '/reference/testing' },
        ],
      },
      {
        text: 'Integrations',
        items: [
          { text: 'Prometheus and Grafana', link: '/integrations/prometheus' },
          { text: 'Winston', link: '/integrations/winston' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/haskou/metrics' },
    ],
  },
});
