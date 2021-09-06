<template>
  <n-alert title="操作步骤~" type="warning" class="setps-tip">
    <n-h6 prefix="bar" style="margin: 0 0 5px 0;">
      <n-text type="warning">1.请在下方选择你想使用的节点。</n-text>
    </n-h6>
    <n-h6 prefix="bar" style="margin: 0 0 5px 0;">
      <n-text type="warning">2.请点击下方扫描二维码登录或者点击跳转到京东 App 登录</n-text>
    </n-h6>
    <n-h6 prefix="bar" style="margin: 0 0 5px 0;">
      <n-text type="warning">如今CK有效期不长，平均1~3天，因此需要及时更新。</n-text>
    </n-h6>
    <n-h6 prefix="bar" style="margin: 0 0 5px 0;">
      <n-text type="warning">PC用户建议使用开源工具<a style="color: #CCCCFF" href="https://github.com/littleCareless/JD_Get_Cookie"  target="_blank">JD_GET_COOKIE</a>获取cookie并在下方填写</n-text>
    </n-h6>
    <n-h6 prefix="bar" style="margin: 0 0 5px 0;">
      <n-text type="warning">手机用户可以使用Alook浏览器登录JD官网，并在菜单-工具箱-开发者工具-Cookies中获取(Android和iPhone通用)</n-text>
    </n-h6>
    <n-h6 prefix="bar" style="margin: 0 0 5px 0;">
      <n-text type="warning">扫码以及跳转app登陆已失效，请自行抓取ck然后填入下方输入框上车即可。</n-text>
    </n-h6>
    <n-h6 prefix="bar" style="margin: 0 0 5px 0;">
      <n-text type="warning">建议抓取京东app的ck，格式为：pt_key=app_openAAJXXXXX;pt_pin=app_openAAJXXXXX;(注意后面的符号) </n-text>
    </n-h6>
  </n-alert>
  <n-card title="节点选择">
    <p>请选择你需要使用的节点</p>
    <n-select
      v-model:value="currentNode"
      :options="currentList"
      :on-update:value="updateCurrentNode"
      :render-label="renderLabel"
      placeholder="请选择节点"
    >
      <template #action>选择你使用的节点后，请点击下方按钮登录，点击按钮后回到本网站查看是否登录成功，京东的升级提示不用管。</template>
    </n-select>
  </n-card>

  <n-card title="节点数据统计" v-if="isNodeSelect">
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
        <n-statistic label="总计">{{ allCount }}</n-statistic>
      </n-col>
    </n-row>
    <template #action>
      <n-steps :current="current" :status="currentStatus">
        <n-step title="请选择节点" description="默认选择节点1 " />
        <n-step title="请点击登录。" description="点击扫描二维码登录" />
      </n-steps>
    </template>
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
      <n-input v-model:value="cookie" size="small" clearable placeholder="输入您的 cookie" />
    </template>
    <template #action>
      <div style="text-align:right;">
        <n-button type="primary" size="small" @click="CKLogin">登录</n-button>
      </div>
    </template>
  </n-card>
</template>

<script>
import { useMessage, useNotification, useDialog, NInput, NDialog, NButton, NCard, NGrid, NGridItem, NStatistic, NCol, NRow, NSelect, NSteps, NStep, NAlert, NH6, NText } from 'naive-ui'
import { h,ref, onMounted, reactive, toRefs, computed } from 'vue'
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
  newCheckLoginAPI,
  getNodeListAPI,
} from '@/api/index'
import axios from 'axios'
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
// 请求节点列表
import nodeList from '../assets/node.json'
import { each } from 'lodash-es'
import { current, store } from '../store/index'
export default {
  components: {
    NInput, NDialog, NButton, NCard, NGrid, NGridItem, NStatistic, NCol, NRow, NSelect, NSteps, NStep, NAlert, NH6, NText
  },
  setup() {
    const dialog = useDialog()
    const notification = useNotification()
    const frame = ref(null)
    dialog.warning({
      title: '公告',
      content: () => {
        return h('div', [
          h('p', {
            style: {
              color: 'Orange',
              textAlign: 'center',
            }
          }, '目前扫码已失效，请使用CK登录。CK登陆成功后自动跳转即为登陆成功。'),
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
      currentNode: null,
      currentList: [],
      currentInfoList: {},
      currentStatus: 'Process',
      isNodeSelect: computed(() => {
        return data.currentNode !== null
      }),
      nodeList: []
    })

    const getAllNodeInfo = async () => {
      let indexs = 1

      each(data.nodeList, async (item, index) => {
        console.log('item', item)
        await axios.get(`${item}/info`).then((res) => {
          data.currentInfoList[`${item}`] = res.data.data
          data.currentList.push({
            label: `节点${indexs++}`,
            value: index,
            allowCount: res.data.data.marginCount ?? 0,
            allCount: res.data.data.allCount ?? 40
          })
        }).catch((err) => {
          console.log('err', err)
        })
      })
    }
    const renderLabel = (SelectOption, selected) => {
      console.log('select', selected)
      console.log('SelectOption', SelectOption)
      return h('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between'
        }
      }, [
        h('span', SelectOption.label ?? `节点`),
        h('span', `可用：${SelectOption.allowCount ?? 0}`)
      ])
    }
    // 当节点切换的时候 切换接口请求地址 然后 重新请求数据
    const getInfo = async (reqUrl) => {
      const info = await newGetInfoAPI(reqUrl)
      console.log(info)
      const { allCount, allowCount, marginCount, allowAdd } = info.data.data
      data.marginCount = marginCount
      data.allowAdd = allowAdd
      data.allCount = allCount
      data.allowCount = allowCount
    }
    const updateCurrentNode = (val) => {
      clearInterval(data.timer)
      data.currentNode = val
      getInfo(data.nodeList[data.currentNode])
      // getQrcode(data.nodeList[data.currentNode])
    }
    const getQrcode = async (reqUrl) => {
      try {
        const body = await newGetQrcodeAPI(reqUrl,navigator.userAgent)
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
      getQrcode(data.nodeList[data.currentNode])
      console.log('frame',frame)
    }

    const jumpLogin = async () => {
      const href = `openapp.jdmobile://virtual/ad?params={"category":"jump","des":"ThirdPartyLogin","action":"to","onekeylogin":"return","url":"https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=${data.token}","authlogin_returnurl":"weixin://","browserlogin_fromurl":"${window.location.host}"}`
      window.location.href = href
    }

    const ckeckLogin = async (reqUrl = data.nodeList[data.currentNode]) => {
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
            localStorage.setItem('currentNode', data.currentNode)
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
        console.log('error', error)
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
        console.log(data.cookie,ptKey, ptPin);
      if (ptKey && ptPin) {
        const body = await newCKLoginAPI(data.nodeList[data.currentNode], { pt_key: ptKey, pt_pin: ptPin })
        console.log('CKLogin body', body)
        if (body.code === 200 || body.data.data.eid) {
          localStorage.setItem('eid', body.data.data.eid)
          localStorage.setItem('currentNode', data.currentNode)
          notification.success({
            title: "操作成功啦~!",
            content: body.data.message
          })
          router.push('/')
          current.value = data.currentNode
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

    onMounted(async () => {
      const currentNode = localStorage.getItem('currentNode')
      data.currentNode = currentNode ?? null

      await getNodeListAPI().then(res => {
        console.log(res)
        data.nodeList = ['https://jdapi.52mobileweb.com/api']
        store.nodeLists = ['https://jdapi.52mobileweb.com/api']
        data.nodeList = res.data
        store.nodeLists = res.data
        getInfo(data.nodeList[data.currentNode])
        getAllNodeInfo()
      }).catch(err => {
        console.log(err)
        // data.nodeList = ['https://jdapi.52mobileweb.com/api']
        // store.nodeLists = ['https://jdapi.52mobileweb.com/api']
        data.nodeList = ['https://jdapi.52mobileweb.com/api']
        store.nodeLists = ['https://jdapi.52mobileweb.com/api']
        getInfo(data.nodeList[data.currentNode])
        getAllNodeInfo()
      })
      // getQrcode(data.nodeList[data.currentNode])
    })

    return {
      ...toRefs(data),
      current,
      frame,
      getInfo,
      getQrcode,
      showQrcode,
      ckeckLogin,
      jumpLogin,
      CKLogin,
      updateCurrentNode,
      renderLabel
    }
  },
}
</script>

<style scoped lang="less">
.setps-tip {
  display: flex;
  width: 100%;
  ::v-deep(.n-alert-body) {
    width: 100%;
  }
}
.content {
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  gap: 25px;
}
.qr-btns {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
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
