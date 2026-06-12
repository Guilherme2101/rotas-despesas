<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Navbar from './components/Navbar.vue'

const authStore = useAuthStore()

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authStore.user = { uid: user.uid, email: user.email }
    } else {
      authStore.user = null
    }
  })
})
</script>

<template>
  <Navbar />
  <main class="container">
    <router-view />
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
}
</style>