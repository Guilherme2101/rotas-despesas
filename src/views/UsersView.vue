<template>
  <div class="users-view">
    <h2>Contas Cadastradas</h2>

    <div class="users-list">
      <div v-if="authStore.users.length === 0">Nenhuma conta cadastrada</div>
      <div v-else class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in authStore.users" :key="account.id">
              <td>{{ account.email }}</td>
              <td>{{ formatDate(account.createdAt) }}</td>
              <td>
                <button class="delete-btn" @click="deleteAccount(account.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores'

const authStore = useAuthStore()

onMounted(() => {
  authStore.loadUsers()
})

const deleteAccount = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta conta?')) {
    await authStore.deleteUser(id)
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 10) return dateStr
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}
</script>

<style scoped>
.users-view {
  max-width: 1000px;
  margin: 0 auto;
}

.users-list {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #34495e;
  border-radius: 8px;
  background: #ecf0f1;
  color: #2c3e50;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.users-table th {
  background: #34495e;
  color: #f1c40f;
  padding: 0.75rem;
  text-align: left;
}

.users-table td {
  border: 1px solid #bdc3c7;
  padding: 0.75rem;
  color: #2c3e50;
}

.table-wrapper {
  overflow-x: auto;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c0392b;
}
</style>
