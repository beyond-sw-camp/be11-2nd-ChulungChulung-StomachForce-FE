<template>
  <v-container fluid class="login-container fill-height" style="min-height: 100vh;">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="4" lg="4">
        <v-card elevation="8" class="login-card">
          <!-- 로고 영역 -->
          <div class="text-center pt-8">
            <v-avatar size="80" class="mb-4">
              <v-img src="@/assets/logo.png" alt="로고"></v-img>
            </v-avatar>
          </div>

          <v-card-title class="text-h4 text-center font-weight-bold mb-2">
            Welcome Back
          </v-card-title>
          
          <v-card-subtitle class="text-center mb-4">
            서비스를 이용하시려면 로그인해주세요
          </v-card-subtitle>

          <v-card-text>
            <v-form ref="form" v-model="isFormValid" lazy-validation>
              <v-text-field
                v-model="identify"
                :rules="identifyRules"
                label="아이디"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                class="mb-4"
                required
                @keyup.enter="doLogin"
              ></v-text-field>

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="비밀번호"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                required
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                @keyup.enter="doLogin"
              ></v-text-field>

              <div class="d-flex justify-space-between align-center mb-4">
                <v-checkbox
                  v-model="rememberMe"
                  label="로그인 상태 유지"
                  color="primary"
                  hide-details
                ></v-checkbox>
                <v-btn
                  variant="text"
                  color="primary"
                  class="text-caption"
                  @click="forgotPassword"
                >
                  비밀번호를 잊으셨나요?
                </v-btn>
              </div>

              <v-btn
                :loading="loading"
                block
                color="primary"
                size="large"
                :disabled="!isFormValid"
                @click="doLogin"
                class="mb-4 login-btn"
              >
                로그인
              </v-btn>

              <div class="text-center">
                <span class="text-body-2">계정이 없으신가요? </span>
                <v-btn
                  variant="text"
                  color="primary"
                  class="text-caption"
                  @click="goToSignup"
                >
                  회원가입
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="3000"
      location="top"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      identify: "",
      password: "",
      showPassword: false,
      loading: false,
      isFormValid: false,
      rememberMe: false,
      showError: false,
      errorMessage: "",
      identifyRules: [
        v => !!v || '아이디를 입력해주세요',
        v => v.length >= 4 || '아이디는 최소 4자 이상이어야 합니다'
      ],
      passwordRules: [
        v => !!v || '비밀번호를 입력해주세요',
        v => v.length >= 6 || '비밀번호는 최소 6자 이상이어야 합니다'
      ]
    }
  },
  methods: {
    async doLogin() {
      if (!this.$refs.form.validate()) return;
      
      this.loading = true;
      try {
        const loginData = { 
          identify: this.identify, 
          password: this.password,
          rememberMe: this.rememberMe 
        };
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/doLogin`,
          loginData
        );
        
        const { token, refreshToken } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        
        await this.fetchUserInfo();
        window.location.href = "/"
      } catch (error) {
        this.errorMessage = "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";
        this.showError = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchUserInfo() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/userInfo`
        );
        localStorage.setItem("userName", response.data.userName);
        localStorage.setItem("profilePhoto", response.data.profilePhoto);
        localStorage.setItem("userId",response.data.userId);
      } catch (error) {
        console.error("유저 정보 불러오기 실패:", error);
      }
    },
    forgotPassword() {
      this.$router.push('/forgot-password');
    },
    goToSignup() {
      this.$router.push('/user/create');
    }
  }
}
</script>

<script setup>
import { useTheme } from 'vuetify'

const theme = useTheme()
theme.themes.value.light = {
  ...theme.themes.value.light,
  primary: '#ff5e62',
  secondary: '#ff9966',
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
}

.login-card {
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(255, 94, 98, 0.1);
  background-color: rgba(255, 255, 255, 0.95);
}

.v-btn.v-btn--variant-text {
  color: #ff5e62 !important;
}

.v-btn.v-btn--variant-text:hover {
  color: #ff9966 !important;
}

:deep(.v-checkbox .v-selection-control--density-default) {
  color: #ff5e62;
}

:deep(.v-field.v-field--focused) {
  --v-field-border-color: #ff5e62 !important;
}

/* 애니메이션 효과 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* 로그인 버튼 스타일링 */
.login-btn {
  background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%) !important;
  color: white !important;
  transition: opacity 0.3s ease;
}

.login-btn:hover {
  opacity: 0.9;
}

/* 비활성화된 버튼 스타일 */
.login-btn:disabled {
  background: rgba(0, 0, 0, 0.12) !important;
  color: rgba(0, 0, 0, 0.38) !important;
}
</style>