import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
export const useAuthStore = defineStore('auth', () => { const user = ref(JSON.parse(localStorage.getItem('shopro-admin') || 'null')); const loggedIn = computed(() => !!user.value); function setUser(v) { user.value = v; localStorage.setItem('shopro-admin', JSON.stringify(v)); } function logout() { user.value = null; localStorage.removeItem('shopro-admin'); } return { user, loggedIn, setUser, logout }; });
