<template>
  <div class="auth-form">
    <h2>Cadastro</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">E-mail:</label>
        <input v-model="email" type="email" id="email" required />
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input v-model="password" type="password" id="password" required minlength="6" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit">Cadastrar</button>
    </form>
    <p>Já tem conta? <router-link to="/login">Faça login</router-link></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const handleRegister = async () => {
  const result = await authStore.register(email.value, password.value)
  if (result.success) {
    router.push('/sales')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  border: 1px solid #34495e;
  border-radius: 8px;
  background: #ecf0f1;
  color: #2c3e50;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}
input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #7f8c8d;
  border-radius: 4px;
  color: #2c3e50;
  background: white;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.error {
  color: #e74c3c;
  margin-bottom: 1rem;
}
.auth-form p {
  color: #2c3e50;
  margin-top: 1rem;
}
.auth-form a {
  color: #3498db;
}
</style>