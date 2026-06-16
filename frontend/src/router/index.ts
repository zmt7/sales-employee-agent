import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/home/index.vue'),
        },
        {
          path: 'whatsapp',
          name: 'whatsapp',
          component: () => import('@/views/whatsapp/index.vue'),
        },
        {
          path: 'product',
          name: 'product',
          component: () => import('@/views/product/index.vue'),
        },
        {
          path: 'content',
          name: 'content',
          component: () => import('@/views/content/index.vue'),
        },
      ],
    },
  ],
})

export default router
