import { default as instance } from "axios"

const isDev = process.env.NODE_ENV === "development"
const baseURL = isDev ? "http://localhost:3001/api" : "https://hiraishin.com.br/api"

const axios = instance.create()

axios.interceptors.request.use((config) => {
  config.baseURL = baseURL
  return config
})

export default axios
