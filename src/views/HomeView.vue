<template>
  <div class="home">
    <div v-if="authStore.user" class="content">
      <h1>Controle de Motoboys & Vendas</h1>
      <p>Gerencie seus entregadores e controle as vendas diárias</p>
      <div class="nav-buttons">
        <router-link to="/deliveries" class="btn">Entregadores</router-link>
        <router-link to="/sales" class="btn">Vendas</router-link>
      </div>
    </div>
    <div v-else class="login-prompt">
      <h1>Controle de Motoboys & Vendas</h1>
      <p>Faça login para acessar o sistema</p>
      <router-link to="/login" class="btn">Entrar</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores'
const authStore = useAuthStore()
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  text-align: center;
  color: #ecf0f1;
}

.login-prompt {
  text-align: center;
}

.login-prompt .btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-prompt .btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
}

.nav-buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1.5rem;
}

.nav-buttons .btn {
  display: inline-block;
  padding: 1.2rem 2.5rem;
  background: #f1c40f;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.nav-buttons .btn:hover {
  background: #f39c12;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
}
</style>