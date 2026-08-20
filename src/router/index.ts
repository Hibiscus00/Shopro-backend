import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/login', component: () => import('@/views/LoginView.vue')},
        {
            path: '/',
            component: () => import('@/layouts/AdminLayout.vue'),
            redirect: '/dashboard',
            children: [...['dashboard', 'users', 'jobs', 'contents', 'orders', 'system'].map((name) => ({
                path: name,
                component: () => import(`@/views/${name[0].toUpperCase() + name.slice(1)}View.vue`)
            }))]
        },
        {path: '/:pathMatch(.*)*', redirect: '/dashboard'},
    ],
})
router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.path !== '/login' && !auth.loggedIn) return '/login'
    if (to.path === '/login' && auth.loggedIn) return '/dashboard'
})
export default router
