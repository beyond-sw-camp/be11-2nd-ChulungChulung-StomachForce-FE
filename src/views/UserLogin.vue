<template>
     <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="2" md="4">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        로그인
                    </v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                            label="id"
                            v-model="identify"
                            type="identify"
                            prepend-icon = "mdi-email"
                            required
                            />
                            <v-text-field
                            label="password"
                            v-model="password"
                            type="password"
                            prepend-icon = "mdi-lock"
                            required
                            />
                            <v-row>
                                <v-col cols="12">
                                    <v-btn color="primary" block @click="doLogin()">로그인</v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
    import axios from 'axios';
    export default{
        data(){
            return{
                identify:"",
                password:""
            }
        },
        methods: {
            async doLogin(){
                // form데이터인지 json인지 주의
                try {
                    const loginData = { identify: this.identify, password: this.password };
                    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/doLogin`,loginData);
                    const token = response.data.token;
                    const refreshToken = response.data.refreshToken;
                    localStorage.setItem("token", token);
                    localStorage.setItem("refreshToken", refreshToken);
                    await this.fetchUserInfo();
                    window.location.href = "/";
                } catch (error) {
                    console.error("로그인 실패:", error);
                    alert("로그인에 실패했습니다. 다시 시도해주세요.");
                }
            },
            async fetchUserInfo() {
                try {
                    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/userInfo`);
                    console.log
                    localStorage.setItem("userName", response.data.userName);
                    localStorage.setItem("profilePhoto", response.data.profilePhoto);
                } catch (error) {
                    console.error("유저 정보 불러오기 실패:", error);
                }
            },
                
        }
    }
</script>