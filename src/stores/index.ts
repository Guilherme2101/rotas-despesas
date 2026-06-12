import { defineStore } from 'pinia'
import { auth, db } from '../firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where 
} from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { uid: string; email: string | null }
  }),
  actions: {
    async register(email: string, password: string) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        this.user = { uid: cred.user.uid, email: cred.user.email }
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async login(email: string, password: string) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        this.user = { uid: cred.user.uid, email: cred.user.email }
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async logout() {
      await signOut(auth)
      this.user = null
    }
  }
})

export const useDeliveryStore = defineStore('delivery', {
  state: () => ({
    deliveries: [] as Array<{
      id: string
      name: string
      cpf: string
      vehicle: string
      city: string
      phone: string
    }>
  }),
  actions: {
    async addDelivery(name: string, cpf: string, vehicle: string, city: string, phone: string) {
      const user = auth.currentUser
      if (!user) return { success: false, error: 'User not authenticated' }
      
      try {
        const docRef = await addDoc(collection(db, 'deliveries'), {
          name, cpf, vehicle, city, phone,
          userId: user.uid
        })
        this.deliveries.push({ id: docRef.id, name, cpf, vehicle, city, phone })
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async loadDeliveries() {
      const user = auth.currentUser
      if (!user) return
      
      const q = query(collection(db, 'deliveries'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      this.deliveries = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as any))
    },
    async updateDelivery(id: string, name: string, cpf: string, vehicle: string, city: string, phone: string) {
      try {
        const deliveryRef = doc(db, 'deliveries', id)
        await updateDoc(deliveryRef, { name, cpf, vehicle, city, phone })
        const index = this.deliveries.findIndex(d => d.id === id)
        if (index !== -1) {
          this.deliveries[index] = { id, name, cpf, vehicle, city, phone }
        }
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async deleteDelivery(id: string) {
      try {
        await deleteDoc(doc(db, 'deliveries', id))
        this.deliveries = this.deliveries.filter(d => d.id !== id)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  }
})

export const useSaleStore = defineStore('sale', {
  state: () => ({
    sales: [] as Array<{
      id: string
      deliveryId: string
      deliveryName: string
      date: string
      sold: number
      returned: number
      extravios: number
      cartela: number
      total: number
    }>
  }),
  getters: {
    totalSold: (state) => state.sales.reduce((sum, s) => sum + s.sold, 0),
    totalReturned: (state) => state.sales.reduce((sum, s) => sum + s.returned, 0),
    totalExtravios: (state) => state.sales.reduce((sum, s) => sum + s.extravios, 0),
    totalCartela: (state) => state.sales.reduce((sum, s) => sum + s.cartela, 0),
    totalFinal: (state) => state.sales.reduce((sum, s) => sum + s.total, 0)
  },
  actions: {
    async addSale(deliveryId: string, deliveryName: string, date: string, sold: number, returned: number, extravios: number, cartela: number) {
      const user = auth.currentUser
      if (!user) return { success: false, error: 'User not authenticated' }
      const total = sold - returned - extravios
      
      try {
        const docRef = await addDoc(collection(db, 'sales'), {
          deliveryId, deliveryName, date, sold, returned, extravios, cartela, total,
          userId: user.uid
        })
        this.sales.push({ id: docRef.id, deliveryId, deliveryName, date, sold, returned, extravios, cartela, total })
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async loadSales() {
      const user = auth.currentUser
      if (!user) return
      
      const q = query(collection(db, 'sales'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      this.sales = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as any))
    },
    async updateSale(id: string, deliveryId: string, deliveryName: string, date: string, sold: number, returned: number, extravios: number, cartela: number) {
      const total = sold - returned - extravios
      
      try {
        const saleRef = doc(db, 'sales', id)
        await updateDoc(saleRef, { deliveryId, deliveryName, date, sold, returned, extravios, cartela, total })
        const index = this.sales.findIndex(s => s.id === id)
        if (index !== -1) {
          this.sales[index] = { id, deliveryId, deliveryName, date, sold, returned, extravios, cartela, total }
        }
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async deleteSale(id: string) {
      try {
        await deleteDoc(doc(db, 'sales', id))
        this.sales = this.sales.filter(s => s.id !== id)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async deleteAllByDate(date: string) {
      try {
        const toDelete = this.sales.filter(s => s.date === date)
        for (const sale of toDelete) {
          await deleteDoc(doc(db, 'sales', sale.id))
        }
        this.sales = this.sales.filter(s => s.date !== date)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  }
})

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [] as Array<{
      id: string
      deliveryId: string
      deliveryName: string
      description: string
      date: string
      category: string
      value: number
    }>
  }),
  getters: {
    totalExpenses: (state) => state.expenses.reduce((sum, e) => sum + e.value, 0)
  },
  actions: {
    async addExpense(deliveryId: string, deliveryName: string, description: string, date: string, category: string, value: number) {
      const user = auth.currentUser
      if (!user) return { success: false, error: 'User not authenticated' }

      try {
        const docRef = await addDoc(collection(db, 'expenses'), {
          deliveryId, deliveryName, description, date, category, value,
          userId: user.uid
        })
        this.expenses.push({ id: docRef.id, deliveryId, deliveryName, description, date, category, value })
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async loadExpenses() {
      const user = auth.currentUser
      if (!user) return

      const q = query(collection(db, 'expenses'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      this.expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any))
    },
    async updateExpense(id: string, deliveryId: string, deliveryName: string, description: string, date: string, category: string, value: number) {
      try {
        const expenseRef = doc(db, 'expenses', id)
        await updateDoc(expenseRef, { deliveryId, deliveryName, description, date, category, value })
        const index = this.expenses.findIndex(e => e.id === id)
        if (index !== -1) {
          this.expenses[index] = { id, deliveryId, deliveryName, description, date, category, value }
        }
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async deleteExpense(id: string) {
      try {
        await deleteDoc(doc(db, 'expenses', id))
        this.expenses = this.expenses.filter(e => e.id !== id)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    async deleteAllByDate(date: string) {
      try {
        const toDelete = this.expenses.filter(e => e.date === date)
        for (const expense of toDelete) {
          await deleteDoc(doc(db, 'expenses', expense.id))
        }
        this.expenses = this.expenses.filter(e => e.date !== date)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  }
})