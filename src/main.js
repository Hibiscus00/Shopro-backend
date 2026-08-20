import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './style.css';
import App from './App.vue';
import router from './router';
async function boot() {
    if (import.meta.env.VITE_USE_MOCK !== 'false') {
        const { worker } = await import('./mocks/browser');
        await worker.start({ onUnhandledRequest: 'bypass' });
    }
    createApp(App).use(createPinia()).use(router).use(ElementPlus).mount('#app');
}
boot();
