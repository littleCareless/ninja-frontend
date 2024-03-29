<template>
  <n-card title="个人中心" class="user-info">
    <template #header-extra></template>
    <template #default>
      <p>昵称：{{ nickName }}</p>
      <p>更新时间：{{ timestamp }}</p>
    </template>
    <template #action>
      <n-button type="success" size="small" @click="logout">退出登录</n-button>
      <n-button type="error" size="small" @click="delAccount">删除账号</n-button>
    </template>
  </n-card>

  <n-card title="备注" class="user-remark">
    <template #header-extra>备注用于识别用户，强烈建议配置。</template>
    <template #default>
      <n-input v-model:value="remark" placeholder="请输入备注"></n-input>
    </template>
    <template #action>
      <n-button size="small" type="success" @click="saveRemark">保存</n-button>
    </template>
  </n-card>

  <n-card title="推送" class="user-push">
    <template #header-extra>扫码接收运行通知。</template>
    <template #default>
      <div class="push_wrapper">
        <img :src="PUSHIMAGE" width="256" class="m-auto" />
      </div>
    </template>
  </n-card>

  <n-card title="常见活动位置">
    <template #header-extra>下面是一些常见活动的位置</template>
    <template #default>
      <ul>
        <li v-for="(item, index) in activity" :key="index" class="leading-normal">
          <span>{{ item.name }}：</span>
          <span class="pr-2">{{ item.address }}</span>
          <a v-if="item.href" class="text-blue-400" href="#" @click="openUrlWithJD(item.href)">直达链接</a>
        </li>
      </ul>
    </template>
  </n-card>
</template>

<script>
import {
  getUserInfoAPI, delAccountAPI, updateRemarkAPI,
  newGetUserInfoAPI, newDelAccountAPI, newUpdateRemarkAPI,getNodeListAPI
} from '@/api/index'
import { onMounted, reactive, toRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotification, NInput, NButton, NCard } from 'naive-ui'

import push from '../assets/push.jpg'
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const PUSHIMAGE = import.meta.env.VITE_PUSH_IMG || ''
import { store } from '../store/index'
export default {
  components: {
    NInput, NButton, NCard,
  },
  setup() {
    const notification = useNotification()

    const router = useRouter()
    const route = useRoute()

    let data = reactive({
      nickName: undefined,
      timestamp: undefined,
      remark: undefined,
      push,
      PUSHIMAGE,
      dialogVisible: true,
      nodeList: ['https://jdapi.52mobileweb.com/api'],
      currentNode: 0
    })
    const getInfo = async () => {
      const eid = localStorage.getItem('eid')
      if (!eid) {
        logout()
        return
      }
      const userInfo = await newGetUserInfoAPI(data.nodeList[data.currentNode], eid)
      if (userInfo.data.data.code === 200) {
        data.nickName = userInfo.data.data.result.nickName
        data.remark = userInfo.data.data.result.remark
        data.timestamp = new Date(userInfo.data.data.result.timestamp).toLocaleString()
      } else if(userInfo.data.data.eid){
        data.nickName = userInfo.data.data.nickName
        data.remark = userInfo.data.data.remark
        data.timestamp = new Date(userInfo.data.data.timestamp).toLocaleString()
        return
      } else if (!userInfo.data.code !== 200) {
        // ElMessage.error('获取用户信息失败，请重重新登录')
        notification.error({
          title: "出现错误啦~!",
          content: userInfo.data.message
        })
        logout()
        return
      }

    }

    onMounted(async ()=> {
      const currentNode = localStorage.getItem('currentNode')
      data.currentNode = currentNode ?? [0]
      await getNodeListAPI().then(res => {
        // 默认
        data.nodeList = ['https://jdapi.52mobileweb.com/api']
        store.nodeLists =  ['https://jdapi.52mobileweb.com/api']
        // 从服务器获取
        data.nodeList = res.data
        store.nodeLists = res.data
        getInfo()
      }).catch(err => {
        console.log('出现错误啦~',err)
        data.nodeList = ['https://jdapi.52mobileweb.com/api']
        store.nodeLists =  ['https://jdapi.52mobileweb.com/api']
        getInfo()
      })
    })

    const logout = () => {
      localStorage.removeItem('eid')
      router.push('/login')
    }

    const delAccount = async () => {
      const eid = localStorage.getItem('eid')
      const body = await newDelAccountAPI(data.nodeList[data.currentNode], { eid })
      if (body.data.data.code !== 200) {
        // ElMessage.error(body.message)
        notification.error({
          title: "出现错误啦~!",
          content: body.data.message
        })
      } else {
        // ElMessage.success(body.message)
        notification.error({
          title: "操作成功啦~!",
          content: body.data.message
        })
        setTimeout(() => {
          logout()
        }, 1000)
      }
    }

    const openUrlWithJD = (url) => {
      const params = encodeURIComponent(
        `{"category":"jump","des":"m","action":"to","url":"${url}"}`
      )
      window.location.href = `openapp.jdmobile://virtual?params=${params}`
    }

    const saveRemark = async () => {
      const body = await newUpdateRemarkAPI(data.nodeList[data.currentNode], {
        eid: localStorage.getItem('eid'),
        remark: data.remark,
      })
      if(body.data.data.code === 200) {
        notification.success({
          title: "操作成功啦~!",
          content: body?.data.message
        })
      }else{
        notification.error({
          title: "操作失败啦~!",
          content: body?.data.message
        })
      }
      // ElMessage.success(body?.message)

    }

    const activity = [
      {
        name: '玩一玩（可找到大多数活动）',
        address: '京东 APP 首页-频道-边玩边赚',
        href: 'https://funearth.m.jd.com/babelDiy/Zeus/3BB1rymVZUo4XmicATEUSDUgHZND/index.html',
      },
      {
        name: '宠汪汪',
        address: '京东APP-首页/玩一玩/我的-宠汪汪',
      },
      {
        name: '东东萌宠',
        address: '京东APP-首页/玩一玩/我的-东东萌宠',
      },
      {
        name: '东东农场',
        address: '京东APP-首页/玩一玩/我的-东东农场',
      },
      {
        name: '东东工厂',
        address: '京东APP-首页/玩一玩/我的-东东工厂',
      },
      {
        name: '东东超市',
        address: '京东APP-首页/玩一玩/我的-东东超市',
      },
      {
        name: '领现金',
        address: '京东APP-首页/玩一玩/我的-领现金',
      },
      {
        name: '东东健康社区',
        address: '京东APP-首页/玩一玩/我的-东东健康社区',
      },
      {
        name: '京喜农场',
        address: '京喜APP-我的-京喜农场',
      },
      {
        name: '京喜牧场',
        address: '京喜APP-我的-京喜牧场',
      },
      {
        name: '京喜工厂',
        address: '京喜APP-我的-京喜工厂',
      },
      {
        name: '京喜财富岛',
        address: '京喜APP-我的-京喜财富岛',
      },
      {
        name: '京东极速版红包',
        address: '京东极速版APP-我的-红包',
      },
    ]

    // warning () {
    // }
    return {
      ...toRefs(data),
      activity,
      getInfo,
      logout,
      delAccount,
      openUrlWithJD,
      saveRemark
    }
  },
}
</script>

<style lang="less" scoped>
.content {
  display: flex;
  overflow: hidden;
  overflow-y: auto;
  flex-direction: column;
  justify-content: space-around;
  align-content: space-between;
  align-items: center;
  margin: 20px 50px 0;
  margin-top: 20px;
  gap: 20px;
  max-height: calc(100% - 200px);
}
.user-info {
  ::v-deep(.n-card__action) {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
  }
}
.user-remark {
  ::v-deep(.n-card__action) {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
  }
}
.push_wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
