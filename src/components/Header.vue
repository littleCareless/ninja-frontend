<template>
  <div class="header">
    <img class="NinjaLogo" src="@/assets/logo.png" alt="logo" />
    <span>{{ title }}</span>
  </div>
</template>

<script>
import { NGrid, NGridItem } from 'naive-ui'
const title = import.meta.env.VITE_TITLE || ''
export default {
  components: {
    NGrid,
    NGridItem
  },
  data() {
    return {
      title
    }
  }
}
</script>

<style scoped >
.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  /* gap: 15px; */
  padding: 0 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.09);
  background-color: #fff;
}
</style>
