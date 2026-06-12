<script setup lang="ts">
import { useAuthStore } from '../stores'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-links-left">
      <router-link to="/">Controle de Entregas e Despesas</router-link>
      <router-link v-if="authStore.user" to="/deliveries" class="highlight-btn">Entregadores</router-link>
      <router-link v-if="authStore.user" to="/sales" class="highlight-btn">Vendas</router-link>
      <router-link v-if="authStore.user" to="/expenses" class="highlight-btn">Despesas</router-link>
      <router-link v-if="authStore.user" to="/users" class="highlight-btn">Contas</router-link>
    </div>
    <div class="nav-links">
      <router-link v-if="!authStore.user" to="/login">Login</router-link>
      <router-link v-if="!authStore.user" to="/register">Cadastrar</router-link>
      <button v-if="authStore.user" @click="handleLogout">Sair</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #2c3e50;
  color: white;
}

.nav-links-left {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links-left a {
  color: white;
  text-decoration: none;
}

.nav-links-left .highlight-btn {
  background: #f1c40f;
  color: #2c3e50;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}

.nav-links-left .highlight-btn:hover {
  background: #f39c12;
}

.nav-links a {
  color: white;
  text-decoration: none;
  margin: 0 1rem;
}

.nav-links button {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
</style>