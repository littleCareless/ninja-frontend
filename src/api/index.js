import ky from 'ky'

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
import { current } from '../store/index'
//
const api = ky.create({ prefixUrl: JSON.parse(VITE_API_BASE_URL)[current.value], retry: { limit: 0 } })
import axios from 'axios'
export function getInfoAPI() {
  return api.get('info').json()
}

export function CKLoginAPI(body) {
  return api.post('cklogin', { json: body }).json()
}

export function getQrcodeAPI() {
  return api.get('qrcode').json()
}

export function checkLoginAPI(body) {
  return api.post('check', { json: body }).json()
}

export function getUserInfoAPI(eid) {
  const searchParams = new URLSearchParams()
  searchParams.set('eid', eid)
  return api.get('userinfo', { searchParams: searchParams }).json()
}

export function delAccountAPI(body) {
  return api.post('delaccount', { json: body }).json()
}


export function updateRemarkAPI(body) {
  return api.post('update/remark', { json: body }).json()
}





export function newGetInfoAPI(reqUrl) {
  return axios.get(`${reqUrl}/info`)
}

export function newGetQrcodeAPI(reqUrl) {
  return axios.get(`${reqUrl}/qrcode`)
}

export function newCheckLoginAPI(reqUrl, body) {
  return axios.post(`${reqUrl}/check`, body)
}

export function newCKLoginAPI(reqUrl,body) {
  return axios.post(`${reqUrl}/cklogin`, body)
}

export function newGetUserInfoAPI(reqUrl,eid) {
  const searchParams = new URLSearchParams()
  searchParams.set('eid', eid)
  return axios.get(`${reqUrl}/userinfo`, {
    params: searchParams
  })
}

export function newDelAccountAPI(reqUrl,body) {
  return axios.post(`${reqUrl}/delaccount`, body)
}


export function newUpdateRemarkAPI(reqUrl,body) {
  return axios.post(`${reqUrl}/update/remark`, body)
}

export function getNodeListAPI() {
  return axios.get(`/assets/node.json`)
}


