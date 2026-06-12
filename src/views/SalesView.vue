<template>
  <div class="sales-view">
    <h2>Controle de Vendas</h2>

    <div class="totals-summary">
      <p><strong>Total Geral (Vendidas + Devolvidas):</strong> {{ summary.totalGeral }}</p>
      <p><strong>Total Vendidas:</strong> {{ summary.totalVendidas }}</p>
      <p><strong>Total Devolvidas:</strong> {{ summary.totalDevolvidas }}</p>
      <p><strong>Total Extravios:</strong> {{ summary.totalExtravios }}</p>
      <p><strong>Total Cartela:</strong> R$ {{ summary.totalCartela.toFixed(2) }}</p>
      <p class="final-total"><strong>Total Final:</strong> {{ summary.totalFinal }}</p>
      <p><strong>Prejuízo:</strong> R$ {{ summary.prejuizo.toFixed(2) }}</p>
    </div>

    <div class="sale-form">
      <h3>{{ editingId ? 'Editar Venda' : 'Nova Venda' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <select v-model="deliveryId" required>
            <option value="">Selecione o Entregador</option>
            <option v-for="delivery in deliveryStore.deliveries" :key="delivery.id" :value="delivery.id">
              {{ delivery.name }}
            </option>
          </select>
          <input v-model="date" type="date" required />
          <input v-model.number="sold" type="number" placeholder="Quantidade Vendida" min="0" required />
          <input v-model.number="returned" type="number" placeholder="Quantidade Devolvida" min="0" required />
          <input v-model.number="extravios" type="number" placeholder="Extravios" min="0" required />
          <input v-model.number="cartela" type="number" placeholder="Valor Cartela (R$)" step="0.01" min="0" required />
        </div>
        <button type="submit">{{ editingId ? 'Atualizar' : 'Adicionar' }}</button>
        <button v-if="editingId" type="button" @click="cancelEdit">Cancelar</button>
      </form>
    </div>

    <div class="sales-list">
      <h3>Vendas por Data</h3>
      
      <div v-if="saleStore.sales.length === 0">Nenhuma venda registrada</div>
      
      <div v-else v-for="(group, date) in groupedSales" :key="date" class="date-group">
        <div class="date-header" @click="toggleDate(date)">
          <h4>{{ formatDate(date) }}</h4>
          <div class="date-totals">
            <span v-if="expandedDates[date] !== false">
              <strong>Total Vendidas:</strong> {{ group.totals.sold }}
            </span>
            <span v-if="expandedDates[date] !== false">
              <strong>Total Devolvidas:</strong> {{ group.totals.returned }}
            </span>
            <span v-if="expandedDates[date] !== false">
              <strong>Total Extravios:</strong> {{ group.totals.extravios }}
            </span>
            <span v-if="expandedDates[date] !== false">
              <strong>Total Cartela:</strong> R$ {{ group.totals.cartela.toFixed(2) }}
            </span>
            <span v-if="expandedDates[date] !== false">
              <strong>Total Final:</strong> {{ group.totals.final }}
            </span>
            <span v-if="expandedDates[date] !== false">
              <strong>Prejuízo:</strong> R$ {{ group.totals.loss.toFixed(2) }}
            </span>
            <button class="delete-all-btn" @click.stop="deleteAllByDate(date)">Apagar Tudo</button>
            <span class="toggle-icon">{{ expandedDates[date] === false ? '▼' : '▲' }}</span>
          </div>
        </div>
        <div v-show="expandedDates[date] !== false" class="date-content">
          <table class="sales-table">
            <thead>
              <tr>
                <th>Motoqueiro</th>
                <th>Data</th>
                <th>Vendidas</th>
                <th>Devolvidas</th>
                <th>Extravios</th>
                <th>Valor Cartela</th>
                <th>Prejuízo (R$)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in group.sales" :key="sale.id">
                <td>{{ sale.deliveryName }}</td>
                <td>{{ formatDate(sale.date) }}</td>
                <td>{{ sale.sold }}</td>
                <td>{{ sale.returned }}</td>
                <td>{{ sale.extravios }}</td>
                <td>R$ {{ sale.cartela.toFixed(2) }}</td>
                <td class="loss">{{ calculateLoss(sale) }}</td>
                <td>
                  <button @click="editSale(sale)">Editar</button>
                  <button @click="deleteSale(sale.id)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useDeliveryStore, useSaleStore } from '../stores'

const deliveryStore = useDeliveryStore()
const saleStore = useSaleStore()

const deliveryId = ref('')
const date = ref('')
const sold = ref(0)
const returned = ref(0)
const extravios = ref(0)
const cartela = ref(0)
const editingId = ref('')

const expandedDates = reactive<Record<string, boolean>>({})

const summary = reactive({
  totalGeral: 0,
  totalVendidas: 0,
  totalDevolvidas: 0,
  totalExtravios: 0,
  totalCartela: 0,
  totalFinal: 0,
  prejuizo: 0
})

watch(
  () => saleStore.sales,
  (sales) => {
    summary.totalVendidas = sales.reduce((sum, s) => sum + s.sold, 0)
    summary.totalDevolvidas = sales.reduce((sum, s) => sum + s.returned, 0)
    summary.totalExtravios = sales.reduce((sum, s) => sum + s.extravios, 0)
    summary.totalCartela = sales.reduce((sum, s) => sum + s.cartela, 0)
    summary.totalFinal = sales.reduce((sum, s) => sum + s.total, 0)
    summary.prejuizo = sales.reduce((sum, s) => sum + s.extravios * s.cartela, 0)
    summary.totalGeral = summary.totalVendidas + summary.totalDevolvidas
  },
  { immediate: true }
)

const groupedSales = computed(() => {
  const groups: Record<string, { sales: any[], totals: { sold: number, returned: number, extravios: number, cartela: number, final: number, loss: number } }> = {}
  saleStore.sales.forEach(sale => {
    if (!groups[sale.date]) {
      groups[sale.date] = { sales: [], totals: { sold: 0, returned: 0, extravios: 0, cartela: 0, final: 0, loss: 0 } }
    }
    groups[sale.date].sales.push(sale)
    groups[sale.date].totals.sold += sale.sold
    groups[sale.date].totals.returned += sale.returned
    groups[sale.date].totals.extravios += sale.extravios
    groups[sale.date].totals.cartela += sale.cartela
    groups[sale.date].totals.final += sale.total
    groups[sale.date].totals.loss += sale.extravios * sale.cartela
  })
  return groups
})

const toggleDate = (dateStr: string) => {
  if (expandedDates[dateStr] === undefined) {
    expandedDates[dateStr] = true
  } else {
    expandedDates[dateStr] = expandedDates[dateStr] === false ? true : false
  }
}

const handleSubmit = async () => {
  const deliveryName = deliveryStore.deliveries.find(d => d.id === deliveryId.value)?.name || 'Desconhecido'
  if (editingId.value) {
    const res = await saleStore.updateSale(editingId.value, deliveryId.value, deliveryName, date.value, sold.value, returned.value, extravios.value, cartela.value)
    if (!res.success) {
      alert(res.error || 'Erro ao atualizar venda')
      return
    }
    editingId.value = ''
  } else {
    const res = await saleStore.addSale(deliveryId.value, deliveryName, date.value, sold.value, returned.value, extravios.value, cartela.value)
    if (!res.success) {
      alert(res.error || 'Erro ao adicionar venda')
      return
    }
  }
  resetForm()
}

const deleteSale = async (id: string) => {
  if (confirm('Tem certeza?')) {
    await saleStore.deleteSale(id)
  }
}

const editSale = (sale: any) => {
  editingId.value = sale.id
  deliveryId.value = sale.deliveryId
  date.value = sale.date
  sold.value = sale.sold
  returned.value = sale.returned
  extravios.value = sale.extravios
  cartela.value = sale.cartela
}

const deleteAllByDate = async (dateToDelete: string) => {
  if (confirm(`Tem certeza que deseja apagar todas as vendas desta data?`)) {
    await saleStore.deleteAllByDate(dateToDelete)
  }
}

const cancelEdit = () => {
  editingId.value = ''
  resetForm()
}

const resetForm = () => {
  deliveryId.value = ''
  date.value = ''
  sold.value = 0
  returned.value = 0
  extravios.value = 0
  cartela.value = 0
}

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 10) return dateStr
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

const calculateLoss = (sale: any) => {
  return (sale.extravios * sale.cartela).toFixed(2)
}

onMounted(() => {
  deliveryStore.loadDeliveries()
  saleStore.loadSales()
})
</script>

<style scoped>
.sales-view {
  max-width: 1200px;
  margin: 0 auto;
}

.totals-summary {
  background: #2c3e50;
  color: #f1c40f;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.final-total {
  font-size: 1.2rem;
  font-weight: bold;
}

.sale-form, .sales-list {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #34495e;
  border-radius: 8px;
  background: #ecf0f1;
  color: #2c3e50;
}

.sale-form h3, .sales-list h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.form-row input, .form-row select {
  flex: 1;
  min-width: 120px;
  padding: 0.5rem;
  border: 1px solid #7f8c8d;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background: #2980b9;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.sales-table th {
  background: #34495e;
  color: #f1c40f;
  padding: 0.5rem;
}

.sales-table td {
  border: 1px solid #bdc3c7;
  padding: 0.5rem;
  color: #2c3e50;
}

.date-group {
  margin-bottom: 1.5rem;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #34495e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  user-select: none;
}

.date-totals {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.delete-all-btn {
  background: #e74c3c;
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
}

.delete-all-btn:hover {
  background: #c0392b;
}

.toggle-icon {
  margin-left: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
}

.date-content {
  overflow: hidden;
}

.loss {
  color: #e74c3c;
  font-weight: bold;
}
</style>
