<template>
    <v-container fluid class="loading-container fill-height">
        <v-row align="center" justify="center" class="fill-height">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card elevation="10" class="loading-card">
                    <!-- 로딩 애니메이션 -->
                    <v-card-text class="text-center">
                        <v-progress-circular
                            indeterminate
                            size="64"
                            color="primary"
                        ></v-progress-circular>
                    </v-card-text>

                    <!-- 메시지 -->
                    <v-card-title class="text-h5 text-center">
                        구글 로그인 처리 중...
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        잠시만 기다려 주세요. 자동으로 로그인됩니다.
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    created(){
        const code = new URL(window.location.href).searchParams.get("code");
        this.sendCodeToServer(code);
    },
    methods:{
        async sendCodeToServer(code){
            try {
                const response = await axios.post("http://localhost:8080/user/google/doLogin", { code });

                if (response.data.token) {
                    // 로그인 성공 - 토큰 저장 후 홈으로 이동
                    localStorage.setItem("token", response.data.token);
                    await this.fetchUserInfo();
                    window.location.href = "/";
                } else {
                    // 회원가입 필요 - 회원가입 페이지로 이동 (데이터 전달)
                    const { identify, email, name } = response.data;
                    localStorage.setItem("signup_identify", identify);
                    localStorage.setItem("signup_email", email);
                    localStorage.setItem("signup_name", name);
                    window.location.href = "/user/create"; // 회원가입 페이지로 이동
                }
            } catch (error) {
                console.error("구글 로그인 실패:", error);
                alert("로그인 중 문제가 발생했습니다.");
            }
        },
        async fetchUserInfo() {
            try {
                const response = await axios.get("http://localhost:8080/user/userInfo", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                // 유저 정보 저장
                localStorage.setItem("userName", response.data.userName);
                localStorage.setItem("profilePhoto", response.data.profilePhoto);
                localStorage.setItem("userId", response.data.userId);
                localStorage.setItem("userRole", response.data.role);
            } catch (error) {
                console.error("유저 정보 가져오기 실패:", error);
            }
        }
    }
}
</script>
<style scoped>
.loading-container {
    background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
}
.loading-card {
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(255, 94, 98, 0.2);
    background-color: rgba(255, 255, 255, 0.95);
}
</style>
