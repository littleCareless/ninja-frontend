// 公共数据容器

import {ref,reactive } from 'vue'

export let current = ref(0)
export let store = reactive({
  nodeLists: []
})
