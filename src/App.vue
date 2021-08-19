<template>
  <Header />
  <div class="main">
    <n-notification-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-notification-provider>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import { NDialogProvider, NNotificationProvider } from 'naive-ui'
</script>

<style>
#app {
  /* width: 100vw; */
  height: 100vh;
  background-color: #f5f5f5;
}
.main {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-content: space-between;
  align-items: center;
  padding: 20px;
  gap: 20px;
  background-color: #f5f5f5;
}
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
