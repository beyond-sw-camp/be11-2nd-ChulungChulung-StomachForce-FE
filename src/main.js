import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import vuetify from './plugins/vuetify'
import router from './router'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if(token){
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config;
    },
    error => {
        // 에러가 발생시, 사용자의 본래요청의 화면으로 되돌아가야함
        return Promise.reject(error)
    }
)
axios.interceptors.response.use(
    response => response,
    async error => {
        if(error.response && error.response.status === 401){
            try{
                const restaurantId = localStorage.getItem("restaurantId");
                const refreshToken = localStorage.getItem('refreshToken');
                localStorage.removeItem("token");
                if(restaurantId){
                    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/restaurant/refresh-token`, {refreshToken});
                    const token = response.data.token;
                    localStorage.setItem("token", token)
                    window.location.reload();

                }else{
                    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/refresh-token`, {refreshToken});
                    const token = response.data.token;
                    localStorage.setItem("token", token)
                    window.location.reload();
                }
                
            }catch(e){
                // localStorage.clear();
                // window.location.href="/"
            }

        }
        return Promise.reject(error);
    }
)

app.use(vuetify)
app.use(router)
app.mount('#app')

