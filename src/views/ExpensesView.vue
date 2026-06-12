<template>
  <div class="expenses-view">
    <h2>Controle de Despesas</h2>

    <div class="form-section">
      <div class="totals-summary">
        <p><strong>Total de Despesas:</strong> R$ {{ expenseStore.totalExpenses.toFixed(2) }}</p>
        <p><strong>Quantidade de Registros:</strong> {{ expenseStore.expenses.length }}</p>
      </div>

      <div class="expense-form">
        <h3>{{ editingId ? 'Editar Despesa' : 'Nova Despesa' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <select v-model="deliveryId" required>
              <option value="" disabled>Selecione o Motoqueiro</option>
              <option v-for="delivery in deliveryStore.deliveries" :key="delivery.id" :value="delivery.id">
                {{ delivery.name }}
              </option>
            </select>
            <input v-model="date" type="date" required />
            <select v-model="category" required>
              <option value="" disabled>Selecione a Categoria</option>
              <option value="gasto">Gasto</option>
              <option value="meta">Meta</option>
              <option value="premiacao">Premiação</option>
            </select>
            <input v-model="description" type="text" placeholder="Descrição" required />
            <input v-model.number="value" type="number" placeholder="Valor (R$)" step="0.01" min="0" required />
          </div>
          <button type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Salvando...' : 'Despesas Salvas' }}</button>
          <button v-if="editingId" type="button" @click="cancelEdit">Cancelar</button>
        </form>
      </div>
    </div>

    <div class="filter-section">
      <h4>Filtrar Despesas</h4>
      <div class="filter-row">
        <select v-model="filterDeliveryId">
          <option value="">Todos os Motoqueiros</option>
          <option v-for="delivery in deliveryStore.deliveries" :key="delivery.id" :value="delivery.id">
            {{ delivery.name }}
          </option>
        </select>
        <select v-model="filterDate">
          <option value="">Todas as Datas</option>
          <option v-for="d in uniqueDates" :key="d" :value="d">
            {{ formatDate(d) }}
          </option>
        </select>
        <button type="button" class="search-btn" @click="applyFilters">Buscar</button>
      </div>
    </div>

    <div v-if="searched" class="resumo-section">
      <h3>Resumo</h3>
      <div class="resumo-box">
        <p class="resumo-date">{{ formatDate(selectedDateDisplay) }}</p>
        <p><strong>Total Vendidas:</strong> {{ summaryTotals.totalVendidas }}</p>
        <p><strong>Total Devolvidas:</strong> {{ summaryTotals.totalDevolvidas }}</p>
        <p><strong>Total Extravios:</strong> {{ summaryTotals.totalExtravios }}</p>
        <p><strong>Total Cartela:</strong> R$ {{ summaryTotals.totalCartela.toFixed(2) }}</p>
        <p><strong>Total Final:</strong> {{ summaryTotals.totalFinal }}</p>
        <p><strong>Prejuízo:</strong> R$ {{ summaryTotals.prejuizo.toFixed(2) }}</p>
        <p><strong>Despesas:</strong> R$ {{ summaryTotals.totalDespesas.toFixed(2) }}</p>
      </div>
    </div>

    <div class="expenses-saved-section" v-if="searched">
      <h3>Despesas Salvas</h3>

      <div v-if="filteredExpenses.length === 0">Nenhuma despesa registrada</div>

      <div v-else class="table-wrapper">
        <table class="expenses-table">
          <thead>
            <tr>
              <th>Motoqueiro</th>
              <th>Data</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense.id">
              <td>{{ expense.deliveryName }}</td>
              <td>{{ formatDate(expense.date) }}</td>
              <td>
                <span :class="['category-badge', 'category-' + expense.category]">
                  {{ formatCategory(expense.category) }}
                </span>
              </td>
              <td>{{ expense.description }}</td>
              <td>R$ {{ expense.value.toFixed(2) }}</td>
              <td>
                <button class="edit-btn" @click="editExpense(expense)">Editar</button>
                <button class="delete-btn" @click="deleteExpense(expense.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useDeliveryStore, useExpenseStore, useSaleStore } from '../stores'

const deliveryStore = useDeliveryStore()
const expenseStore = useExpenseStore()
const saleStore = useSaleStore()

const deliveryId = ref('')
const date = ref('')
const category = ref('')
const description = ref('')
const value = ref(0)
const editingId = ref('')
const isSubmitting = ref(false)

const filterDeliveryId = ref('')
const filterDate = ref('')
const appliedFilters = reactive({ deliveryId: '', date: '' })
const searched = ref(false)

const uniqueDates = computed(() => {
  const dates = new Set<string>([
    ...expenseStore.expenses.map(e => e.date),
    ...saleStore.sales.map(s => s.date)
  ])
  return Array.from(dates).sort()
})

const selectedDateDisplay = computed(() => {
  return appliedFilters.date || (uniqueDates.value.length > 0 ? uniqueDates.value[0] : '')
})

const filteredExpenses = computed(() => {
  let expenses = expenseStore.expenses
  if (appliedFilters.deliveryId) {
    expenses = expenses.filter(e => e.deliveryId === appliedFilters.deliveryId)
  }
  if (appliedFilters.date) {
    expenses = expenses.filter(e => e.date === appliedFilters.date)
  }
  return expenses
})

const summaryTotals = computed(() => {
  let sales = saleStore.sales
  if (appliedFilters.deliveryId) {
    sales = sales.filter(s => s.deliveryId === appliedFilters.deliveryId)
  }
  if (appliedFilters.date) {
    sales = sales.filter(s => s.date === appliedFilters.date)
  }
  const totalVendidas = sales.reduce((sum, s) => sum + s.sold, 0)
  const totalDevolvidas = sales.reduce((sum, s) => sum + s.returned, 0)
  const totalExtravios = sales.reduce((sum, s) => sum + s.extravios, 0)
  const totalCartela = sales.reduce((sum, s) => sum + s.cartela, 0)
  const totalFinal = sales.reduce((sum, s) => sum + s.total, 0)
  const prejuizo = sales.reduce((sum, s) => sum + s.extravios * s.cartela, 0)
  const totalDespesas = filteredExpenses.value.reduce((sum, e) => sum + e.value, 0)
  return { totalVendidas, totalDevolvidas, totalExtravios, totalCartela, totalFinal, prejuizo, totalDespesas }
})

const applyFilters = () => {
  appliedFilters.deliveryId = filterDeliveryId.value
  appliedFilters.date = filterDate.value
  searched.value = true
}

const handleSubmit = async () => {
  if (!deliveryId.value || !date.value || !category.value || !description.value || !value.value) {
    alert('Preencha todos os campos')
    return
  }
  const deliveryName = deliveryStore.deliveries.find(d => d.id === deliveryId.value)?.name || 'Desconhecido'
  isSubmitting.value = true
  try {
    if (editingId.value) {
      const res = await expenseStore.updateExpense(editingId.value, deliveryId.value, deliveryName, description.value, date.value, category.value, value.value)
      if (!res.success) {
        alert(res.error || 'Erro ao atualizar despesa')
        return
      }
      editingId.value = ''
    } else {
      const res = await expenseStore.addExpense(deliveryId.value, deliveryName, description.value, date.value, category.value, value.value)
      if (!res.success) {
        alert(res.error || 'Erro ao adicionar despesa')
        return
      }
    }
    resetForm()
    await expenseStore.loadExpenses()
    applyFilters()
  } catch (e) {
    console.error(e)
    alert('Erro inesperado ao salvar despesa')
  } finally {
    isSubmitting.value = false
  }
}

const editExpense = (expense: any) => {
  editingId.value = expense.id
  deliveryId.value = expense.deliveryId
  date.value = expense.date
  category.value = expense.category
  description.value = expense.description
  value.value = expense.value
}

const deleteExpense = async (id: string) => {
  if (confirm('Tem certeza?')) {
    await expenseStore.deleteExpense(id)
  }
}

const cancelEdit = () => {
  editingId.value = ''
  resetForm()
}

const resetForm = () => {
  deliveryId.value = ''
  date.value = ''
  category.value = ''
  description.value = ''
  value.value = 0
}

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 10) return dateStr
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

const formatCategory = (cat: string) => {
  const map: Record<string, string> = { gasto: 'Gasto', meta: 'Meta', premiacao: 'Premiação' }
  return map[cat] || cat
}

onMounted(() => {
  deliveryStore.loadDeliveries()
  expenseStore.loadExpenses()
  saleStore.loadSales()
})
</script>

<style scoped>
.expenses-view {
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

.form-section {
  margin-bottom: 2rem;
}

.expense-form {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #34495e;
  border-radius: 8px;
  background: #ecf0f1;
  color: #2c3e50;
}

.expense-form h3 {
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

button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.search-btn {
  background: #27ae60;
  font-weight: bold;
}

.search-btn:hover {
  background: #219150;
}

.filter-section {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 2px solid #3498db;
}

.filter-section h4 {
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.filter-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-row select, .filter-row input {
  flex: 1;
  min-width: 150px;
  padding: 0.5rem;
  border: 1px solid #7f8c8d;
  border-radius: 4px;
}

.resumo-section {
  margin-bottom: 2rem;
}

.resumo-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.resumo-box {
  background: #2c3e50;
  color: #f1c40f;
  padding: 1rem;
  border-radius: 8px;
}

.resumo-box p {
  margin: 0.4rem 0;
}

.resumo-date {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.expenses-saved-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #34495e;
  border-radius: 8px;
  background: #ecf0f1;
  color: #2c3e50;
}

.expenses-saved-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.expenses-table th {
  background: #34495e;
  color: #f1c40f;
  padding: 0.5rem;
}

.expenses-table td {
  border: 1px solid #bdc3c7;
  padding: 0.5rem;
  color: #2c3e50;
}

.category-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-weight: bold;
  color: white;
}

.category-gasto {
  background: #e74c3c;
}

.category-meta {
  background: #f39c12;
}

.category-premiacao {
  background: #27ae60;
}

.edit-btn {
  background: #f39c12;
}

.edit-btn:hover {
  background: #e67e22;
}

.delete-btn {
  background: #e74c3c;
}

.delete-btn:hover {
  background: #c0392b;
}
</style>
