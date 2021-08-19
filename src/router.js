import Index from '@/views/index.vue'
import Login from '@/views/login.vue'
import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: Index },
  { path: '/login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router.beforeEach((to, from, next) => {
//   if (!localStorage.getItem('eid') && to.path !== '/login')
//     next({ path: '/login' })
//   else next()
// })

export default router
