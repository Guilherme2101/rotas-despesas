<template>
  <div class="deliveries-view">
    <h2>Entregadores</h2>
    
    <div class="delivery-form">
      <h3>Novo Entregador</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <input v-model="name" type="text" placeholder="Nome" required />
          <input v-model="cpf" type="text" placeholder="CPF" required />
          <input v-model="vehicle" type="text" placeholder="Veículo" required />
          <input v-model="city" type="text" placeholder="Cidade" required />
          <input v-model="phone" type="text" placeholder="Telefone" required />
        </div>
        <button type="submit">{{ editingId ? 'Atualizar' : 'Cadastrar' }}</button>
        <button v-if="editingId" type="button" @click="cancelEdit">Cancelar</button>
      </form>
    </div>

    <div class="deliveries-list">
      <h3>Lista de Entregadores</h3>
      <div v-if="deliveryStore.deliveries.length === 0">Nenhum entregador cadastrado</div>
      <table v-else class="deliveries-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Veículo</th>
            <th>Cidade</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="delivery in deliveryStore.deliveries" :key="delivery.id">
            <td>{{ delivery.name }}</td>
            <td>{{ delivery.cpf }}</td>
            <td>{{ delivery.vehicle }}</td>
            <td>{{ delivery.city }}</td>
            <td>{{ delivery.phone }}</td>
            <td>
              <button @click="editDelivery(delivery)">Editar</button>
              <button @click="deleteDelivery(delivery.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeliveryStore } from '../stores'

const deliveryStore = useDeliveryStore()

const name = ref('')
const cpf = ref('')
const vehicle = ref('')
const city = ref('')
const phone = ref('')
const editingId = ref('')

const handleSubmit = async () => {
  if (editingId.value) {
    await deliveryStore.updateDelivery(editingId.value, name.value, cpf.value, vehicle.value, city.value, phone.value)
    editingId.value = ''
  } else {
    await deliveryStore.addDelivery(name.value, cpf.value, vehicle.value, city.value, phone.value)
  }
  resetForm()
}

const editDelivery = (delivery: any) => {
  editingId.value = delivery.id
  name.value = delivery.name
  cpf.value = delivery.cpf
  vehicle.value = delivery.vehicle
  city.value = delivery.city
  phone.value = delivery.phone
}

const deleteDelivery = async (id: string) => {
  if (confirm('Tem certeza?')) {
    await deliveryStore.deleteDelivery(id)
  }
}

const cancelEdit = () => {
  editingId.value = ''
  resetForm()
}

const resetForm = () => {
  name.value = ''
  cpf.value = ''
  vehicle.value = ''
  city.value = ''
  phone.value = ''
}

onMounted(() => {
  deliveryStore.loadDeliveries()
})
</script>

<style scoped>
.deliveries-view {
  max-width: 1000px;
  margin: 0 auto;
  color: #2c3e50;
}

.delivery-form, .deliveries-list {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #34495e;
  border-radius: 8px;
  background: #ecf0f1;
}

.delivery-form h3, .deliveries-list h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.form-row input {
  flex: 1;
  min-width: 120px;
  padding: 0.5rem;
  border: 1px solid #7f8c8d;
  border-radius: 4px;
  color: #2c3e50;
  background: white;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
}

.deliveries-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.deliveries-table th {
  background: #34495e;
  color: #f1c40f;
  padding: 0.5rem;
}

.deliveries-table td {
  border: 1px solid #bdc3c7;
  padding: 0.5rem;
  color: #2c3e50;
}
</style>