import { default as instance } from 'axios';

const isDev = process.env.NODE_ENV === 'development';
const baseURL = isDev ? 'http://localhost:3001/api' : 'http://141.148.138.17/api';

const axios = instance.create();

axios.interceptors.request.use((config) => {
  config.baseURL = baseURL;
  config.headers['X-RIOT-TOKEN'] = process.env.RIOT_API_KEY;
  return config;
});

export default axios;
