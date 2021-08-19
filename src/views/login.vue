<template>
  <n-card title="节点数据统计">
    <n-row>
      <n-col :span="12">
        <!-- 剩余 -->
        <n-statistic label="统计数据" :value="allowCount">
          <template #prefix>
            <n-icon>
              <md-save />
            </n-icon>
          </template>
          <template #suffix>/ {{ allCount }}</template>
        </n-statistic>
      </n-col>
      <n-col :span="12">
        <!-- 所有cookie -->
        <n-statistic label="总计">
          {{allCount}}
        </n-statistic>
      </n-col>
    </n-row>
    <template #action>
      <n-steps :current="current" :status="currentStatus">
        <n-step
          title="请选择你需要使用的节点"
          description="默认选择节点1 "
        />
        <n-step
          title="请点击下方按钮登录。"
          description="如果切换了节点 会重新更新扫码二维码"
        />
      </n-steps>
    </template>
  </n-card>
  <n-card title="节点选择">
    <p>请选择你需要使用的节点</p>
    <n-select
      v-model:value="currentNode"
      :options="currentList"
      :on-update:value="updateCurrentNode"
    />
  </n-card>
  <n-card title="扫码登录" v-if="isNodeSelect">
    <template #header-extra>余量：{{ marginCount }}</template>
    <template #default>
      <span class="card-subtitle">请点击下方按钮登录，点击按钮后回到本网站查看是否登录成功，京东的升级提示不用管。</span>
    </template>
    <!-- <template #footer>#footer</template> -->
    <template #action>
      <div v-if="!qrCodeVisibility" class="qr-btns">
        <n-button type="primary" round @click="showQrcode">扫描二维码登录</n-button>
        <n-button type="primary" round @click="jumpLogin">跳转到京东 App 登录</n-button>
      </div>
      <div v-else class="qr-code">
        <img :src="QRCode" :width="256" />
      </div>
    </template>
  </n-card>

  <n-card title="CooKie 登录" v-if="isNodeSelect">
    <template #header-extra>余量：{{ marginCount }}</template>
    <template #default>
      <span class="card-subtitle">请在下方输入您的 cookie 登录。</span>
    </template>
    <template #footer>
      <n-input v-model="cookie" size="small" clearable placeholder="输入您的 cookie" />
    </template>
    <template #action>
      <div style="text-align:right;">
        <n-button type="primary" size="small" @click="CKLogin">登录</n-button>
      </div>
    </template>
  </n-card>
</template>

<script>
import { useMessage, useNotification, useDialog, NInput, NDialog, NButton, NCard, NGrid, NGridItem, NStatistic, NCol, NRow, NSelect, NSteps, NStep } from 'naive-ui'
import { h, onMounted, reactive, toRefs, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ky from 'ky'
import {
  getInfoAPI,
  getQrcodeAPI,
  CKLoginAPI,
  checkLoginAPI,

  newCKLoginAPI,
  newGetQrcodeAPI,
  newGetInfoAPI,
  newCheckLoginAPI
} from '@/api/index'
import axios from 'axios'
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
import { each } from 'lodash-es'
import { current } from '../store/index'
export default {
  components: {
    NInput, NDialog, NButton, NCard, NGrid, NGridItem, NStatistic, NCol, NRow, NSelect, NSteps, NStep
  },
  setup() {
    const dialog = useDialog()
    const notification = useNotification()
    dialog.warning({
      title: '扫码公告',
      content: () => {
        return h('div', [
          h('p', {
            style: {
              color: 'Orange',
              textAlign: 'center',
            }
          }, '扫码后获取到用户名即为登录成功。'),
          h('p', {
            style: {
              color: 'Orange',
              textAlign: 'center',
            }
          }, '首次登陆请开启以下小游戏'),
          h('p', {
            style: {
              color: 'Orange',
              textAlign: 'center',
            }
          }, '并创建角色完成新手任务'),
          h('p', {
            style: {
              color: 'blue',
              opacity: 0.5,
            }
          }, '1、京东👉我的👉更多👉(东东农场、东东萌宠、东东工厂、宠汪汪、金榜创造营、领现金、健康社区、种豆得豆)。'),
          h('p', {
            style: {
              color: 'blue',
              opacity: 0.5,
            }
          }, '2、下载【京喜App】👉我的👉(京喜农场、京喜工厂、京喜财富岛)。'),
          h('p', {
            style: {
              color: 'blue',
              opacity: 0.5,
            }
          }, '3、下载【京东金融】👉我的👉(种摇钱树、天天提鹅、养猪猪)。'),
          h('p', {
            style: {
              color: 'blue',
              opacity: 0.5,
            }
          }, '4、每天可领取100+京豆和若干现金红包、优惠券等'),
        ])
      },
      negativeText: '朕已阅',
    })
    const router = useRouter()
    const route = useRoute()

    let data = reactive({
      marginCount: 0,
      allowAdd: true,
      cookie: '',
      QRCode: undefined,
      qrCodeVisibility: false,
      token: undefined,
      okl_token: undefined,
      cookies: undefined,
      timer: undefined,
      waitLogin: false,
      ua: null,
      dialogVisible: true,
      allCount: 40,
      allowCount: 40,
      //
      currentNode: 0,
      currentList: [],
      currentInfoList: {},
      currentStatus:  'Process' ,
      isNodeSelect: computed(() =>{
        return data.currentNode !== null
      })
    })
    const getAllNodeInfo = async () => {
      let indexs = 1
      each(JSON.parse(VITE_API_BASE_URL), async (item, index) => {
        const res = await axios.get(`${item}/info`)
        data.currentInfoList[`${item}`] = res.data.data
        data.currentList.push({
          label: `节点${indexs++}`,
          value: index
        })
      })
    }
    getAllNodeInfo()
    // 当节点切换的时候 切换接口请求地址 然后 重新请求数据
    const getInfo = async (reqUrl) => {
      const info = await newGetInfoAPI(reqUrl)
      console.log(info)
      const {allCount, allowCount, marginCount, allowAdd} = info.data.data
      data.marginCount = marginCount
      data.allowAdd = allowAdd
      data.allCount = allCount
      data.allowCount = allowCount
    }
    const updateCurrentNode = (val) => {
      clearInterval(data.timer)
      console.log('值更新了', val)
      data.currentNode = val
      getInfo(JSON.parse(VITE_API_BASE_URL)[data.currentNode])
      getQrcode(JSON.parse(VITE_API_BASE_URL)[data.currentNode])
    }
    const getQrcode = async (reqUrl) => {
      try {
        const body = await newGetQrcodeAPI(reqUrl)
        const { token, okl_token, cookies, QRCode, ua } = body.data.data
        data.token = token
        data.okl_token = okl_token
        data.cookies = cookies
        data.QRCode = QRCode
        data.ua = ua
        if (data.QRCode) {
          // data.qrCodeVisibility = true
          data.waitLogin = true
          clearInterval(data.timer) // 清除定时器
          data.timer = setInterval(ckeckLogin, 3000) // 设置定时器
        }
      } catch (e) {
        console.error(e)
        console.log('出错！4')
        notification.error({
          title: "出现错误~!",
          content: '生成二维码失败！请重试或放弃'
        })
      }
    }

    const showQrcode = async () => {
      data.qrCodeVisibility = true
      getQrcode(JSON.parse(VITE_API_BASE_URL)[data.currentNode])
    }

    const jumpLogin = async () => {
      const href = `openapp.jdmobile://virtual/ad?params={"category":"jump","des":"ThirdPartyLogin","action":"to","onekeylogin":"return","url":"https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=${data.token}","authlogin_returnurl":"weixin://","browserlogin_fromurl":"${window.location.host}"}`
      window.location.href = href
    }

    const ckeckLogin = async (reqUrl = JSON.parse(VITE_API_BASE_URL)[data.currentNode]) => {
      try {
        const body = await newCheckLoginAPI(reqUrl, {
          token: data.token,
          okl_token: data.okl_token,
          cookies: data.cookies,
          ua: data.ua,
        })
        console.log(body)
        switch (body?.data.data.errcode) {
          case 0:
            localStorage.setItem('eid', body.data.data.eid)
            // ElMessage.success(body.message)
            notification.success({
              title: "操作成功啦~!",
              content: body.data.message
            })
            clearInterval(data.timer)
            router.push('/')
            current.value = data.currentNode
            break
          case 176:
            break
          default:
            console.log('出错！3')
            notification.error({
              title: "出现错误啦~!",
              content: body.data.message
            })
            data.waitLogin = false
            clearInterval(data.timer)
            break
        }
      } catch (error) {
        console.log('error',error)
        clearInterval(data.timer)
        data.waitLogin = false
      }
    }

    const CKLogin = async () => {
      const ptKey =
        data.cookie.match(/pt_key=(.*?);/) &&
        data.cookie.match(/pt_key=(.*?);/)[1]
      const ptPin =
        data.cookie.match(/pt_pin=(.*?);/) &&
        data.cookie.match(/pt_pin=(.*?);/)[1]
      if (ptKey && ptPin) {
        const body = await newCKLoginAPI({ pt_key: ptKey, pt_pin: ptPin })
        console.log('CKLogin body',body)
        if (body.code === 200 && body.data.eid) {
          localStorage.setItem('eid', body.data.eid)
          notification.success({
            title: "操作成功啦~!",
            content: body.data.message
          })
        } else {
          console.log('出错1')
          notification.error({
            title: "出现错误啦~!",
            content: body.data.message || 'cookie 解析失败，请检查后重试！'
          })
        }
      } else {
        console.log('出错2')
        notification.error({
          title: "出现错误啦~!",
          content: 'cookie 解析失败，请检查后重试！'
        })
      }
    }

    onMounted(() => {
      getInfo(JSON.parse(VITE_API_BASE_URL)[data.currentNode])
      // getQrcode(JSON.parse(VITE_API_BASE_URL)[data.currentNode])
    })

    return {
      ...toRefs(data),
      current,
      getInfo,
      getQrcode,
      showQrcode,
      ckeckLogin,
      jumpLogin,
      CKLogin,
      updateCurrentNode
    }
  },
}
</script>

<style scoped lang="less">
.content {
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  gap: 25px;
}
.qr-btns {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 10px;
  .n-button {
    width: 192px;
  }
}
.qr-code {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
}
</style>
