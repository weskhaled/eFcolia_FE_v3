import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import generateSitemap from 'vite-ssg-sitemap'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Markdown from 'vite-plugin-vue-markdown'
import { VitePWA } from 'vite-plugin-pwa'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Inspect from 'vite-plugin-inspect'
import LinkAttributes from 'markdown-it-link-attributes'
import Shiki from 'markdown-it-shiki'
import Unocss from 'unocss/vite'
import { AntDesignVueResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'

// const markdownWrapperClasses = 'prose prose-sm m-auto text-left'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      pagesDir: [
        { dir: 'src/**/pages', baseRoute: '' },
      ],
      extendRoute(route) {
        // Augment the route with meta that indicates that the route requires authentication.
        return {
          ...route,
          meta: { ...route.meta, requiresAuth: route.meta?.layout === 'admin' },
        }
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: 'src/common/layouts',
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/head',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // relative paths to the directory to search for components
      // dirs: ['src/**/components'],

      // allow auto load markdown components under `./src/**/components/`
      // extensions: ['vue', 'md', 'svg'],
      // search for subdirectories
      // deep: true,

      // Generate TypeScript declaration for global components
      dts: './src/components.d.ts',

      // allow auto import and register components used in markdown
      // include: [/\.vue$/, /\.md$/],

      // custom resolvers
      // resolvers: [
      //   // AntDesignVueResolver({
      //   //   importStyle: false,
      //   //   // cjs: process.env.NODE_ENV === 'production',
      //   //   cjs: false,
      //   // }),

      //   // VueUseComponentsResolver(),
      // ],
      /**
               * {resolveIcons: true}: resolving problem with icons
               * {importStyle: false}: do not import css, do it manually for dark mode
               */
      resolvers: [
        AntDesignVueResolver({
          cjs: false,
          importStyle: false,
          resolveIcons: true,
        }),
      ],
      dirs: ['src/**/components', 'node_modules/@ant-design/icons-vue/es'],
      extensions: ['vue', 'js'],
      // // Allow subdirectories as namespace prefix for components.
      // directoryAsNamespace: true,

      // // Subdirectory paths for ignoring namespace prefixes
      // globalNamespaces: ['global'],
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),

    // https://github.com/antfu/vite-plugin-vue-markdown
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: 'prose prose-sm m-auto text-left',
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Shiki, {
          theme: {
            light: 'vitesse-light',
            dark: 'vitesse-dark',
          },
        })
        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
      },
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'efcolia',
        short_name: 'efcolia',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [path.resolve(__dirname, 'locales/**')],
    }),

    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    Inspect(),
  ],

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: 'sync',
    formatting: 'minify',
    onFinished() { generateSitemap() },
    format: 'cjs',
  },

  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ['workbox-window', /vue-i18n/],
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      '@vueuse/head',
      'ant-design-vue/lib/locale/fr_FR.js',
      'ant-design-vue/lib/locale/en_US.js',
    ],
    exclude: [
      'vue-demi',
    ],
  },

  css: {
    preprocessorOptions: {
      // less: {
      //   javascriptEnabled: true,
      //   additionalData: `
      //     @import "~/styles/ant/variables.less";
      //   `
      // }
      less: {
        modifyVars: {
          '@primary-color': 'rgb(0, 123, 255); // primary color for all components',
          '@link-color': '#1890ff; // link color',
          '@success-color': '#52c41a; // success state color',
          '@warning-color': '#faad14; // warning state color',
          '@error-color': '#f5222d; // error state color',
          '@font-size-base': '14px; // major text font size',
          '@heading-color': 'rgba(0, 0, 0, 0.85); // heading text color',
          '@text-color': 'rgba(0, 0, 0, 0.85); // major text color',
          '@text-color-secondary': 'rgba(0, 0, 0, 0.45); // secondary text color',
          '@disabled-color': 'rgba(0, 0, 0, 0.25); // disable state color',
          '@border-radius-base': '0px; // major border radius',
          '@border-color-base': '#d9d9d9; // major border color',
          '@box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15); // major shadow for layers',
        },
        // additionalData: ``,
        javascriptEnabled: true,
      },
    },
  },
})
