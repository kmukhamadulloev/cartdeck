import { createRouter, createWebHistory } from 'vue-router'

import AboutView from '@/views/AboutView.vue'
import ContactView from '@/views/ContactView.vue'
import CopyrightView from '@/views/CopyrightView.vue'
import EmulatorView from '@/views/EmulatorView.vue'
import LibraryView from '@/views/LibraryView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PrivacyView from '@/views/PrivacyView.vue'
import TermsView from '@/views/TermsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/library' },
    { path: '/home', redirect: '/library' },
    { path: '/library', name: 'library', component: LibraryView },
    { path: '/emu', name: 'emulator', component: EmulatorView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/terms', name: 'terms', component: TermsView },
    { path: '/privacy', name: 'privacy', component: PrivacyView },
    { path: '/copyright', name: 'copyright', component: CopyrightView },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
