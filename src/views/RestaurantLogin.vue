<template>
    <v-container fluid class="login-container fill-height" style="min-height: 100vh;">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="4" lg="4">
          <v-card elevation="8" class="login-card">
            <!-- 로고 -->
            <div class="text-center pt-8">
              <v-avatar size="80" class="mb-4">
                <v-img src="@/assets/logo.png" alt="로고"></v-img>
              </v-avatar>
            </div>
  
            <v-card-title class="text-h4 text-center font-weight-bold mb-2">
              점장님, 반갑습니다.
            </v-card-title>
            
            <v-card-subtitle class="text-center mb-4">
              사업자등록번호로 로그인하세요      
            </v-card-subtitle>
  
            <v-card-text>
              <v-form ref="form" v-model="isFormValid" lazy-validation>
                <v-text-field
                  v-model="registrationNumber"
                  :rules="registrationRules"
                  label="사업자등록번호(000-00-00000)"
                  prepend-inner-icon="mdi-card-account-details"
                  variant="outlined"
                  class="mb-4"
                  required
                  @keyup.enter="doLogin"
                  @input="formatRegistrationNumber"
                />
  
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
                    비밀번호 찾기
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
                <div class="text-center">
                  <span class="text-body-2">일반유저신가요? </span>
                  <v-btn
                    variant="text"
                    color="primary"
                    class="text-caption"
                    @click="goToUserLogin"
                  >
                    로그인하러가기
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 에러 메시지 -->
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
  import axios from "axios";
  
  export default {
    data() {
      return {
        registrationNumber: "",
        password: "",
        showPassword: false,
        loading: false,
        isFormValid: false,
        rememberMe: false,
        showError: false,
        errorMessage: "",
        registrationRules: [
          (v) => !!v || "사업자등록번호를 입력해주세요",
          (v) => /^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(v) || "올바른 사업자등록번호 형식이 아닙니다",
        ],
        passwordRules: [
          (v) => !!v || "비밀번호를 입력해주세요",
          (v) => v.length >= 8 || "비밀번호는 최소 8자 이상이어야 합니다",
        ],
      };
    },
    methods: {
      async doLogin() {
        if (!this.$refs.form.validate()) return;
  
        this.loading = true;
        try {
          const loginData = {
            registrationNumber: this.registrationNumber,
            password: this.password,
            rememberMe: this.rememberMe,
          };
  
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/restaurant/login`,
            loginData
          );
  
          const { id, name, email, userType, token, refreshToken } = response.data;
          localStorage.setItem("restaurantId", id);
          localStorage.setItem("restaurantName", name);
          localStorage.setItem("restaurantEmail", email);
          localStorage.setItem("userType", userType);
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);
  
          await this.fetchRestaurantInfo();
          window.location.href = "/";
        } catch (error) {
          this.errorMessage = "로그인 실패: 사업자등록번호 또는 비밀번호를 확인해주세요.";
          this.showError = true;
        } finally {
          this.loading = false;
        }
      },
      async fetchRestaurantInfo() {
        try {
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/restaurant/detail`
          );
          localStorage.setItem("restaurantName", response.data.name);
        } catch (error) {
          console.error("레스토랑 정보 불러오기 실패:", error);
        }
      },
      forgotPassword() {
        this.$router.push("/forgot-password");
      },
      goToSignup() {
        this.$router.push("/restaurant/create");
      },
      goToUserLogin(){
        this.$router.push("/user/login");
      },
      formatRegistrationNumber() {
        let numbers = this.registrationNumber.replace(/\D/g, ""); // 숫자만 추출
        if (numbers.length > 10) numbers = numbers.slice(0, 10); // 최대 10자리 제한

        if (numbers.length <= 3) {
          this.registrationNumber = numbers;
        } else if (numbers.length <= 5) {
          this.registrationNumber = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
          this.registrationNumber = `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
        }
      }
    },
  };
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
  
  .login-btn {
    background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%) !important;
    color: white !important;
    transition: opacity 0.3s ease;
  }
  
  .login-btn:hover {
    opacity: 0.9;
  }
  
  .login-btn:disabled {
    background: rgba(0, 0, 0, 0.12) !important;
    color: rgba(0, 0, 0, 0.38) !important;
  }
  </style>