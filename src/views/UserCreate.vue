<template>
    <v-container fluid class="signup-container fill-height" style="min-height: 100vh;">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="5">
          <v-card elevation="8" class="signup-card">
            <!-- 헤더 섹션 -->
            <div class="text-center pt-8">
              <v-card-title class="text-h4 font-weight-bold mb-2">
                회원가입
              </v-card-title>
              <v-card-subtitle class="mb-4">
                새로운 계정을 만들어보세요
              </v-card-subtitle>
            </div>
  
            <v-card-text>
              <v-stepper v-model="currentStep" class="signup-stepper">
                <!-- 스텝 헤더 -->
                <v-stepper-header>
                  <v-stepper-item :value="1">기본정보</v-stepper-item>
                  <v-divider></v-divider>
                  <v-stepper-item :value="2">개인정보</v-stepper-item>
                  <v-divider></v-divider>
                  <v-stepper-item :value="3">주소정보</v-stepper-item>
                </v-stepper-header>
  
                <v-stepper-window>
                  <!-- 스텝 1: 기본정보 -->
                  <v-stepper-window-item :value="1">
                    <v-form ref="form1" @submit.prevent>
                      <v-text-field
                        v-model="identify"
                        label="아이디"
                        :rules="[
                          v => !!v || '아이디를 입력해주세요',
                          v => idRule.test(v) || '아이디는 영어, 숫자, 특수문자(?,!) 중 2가지 이상을 섞어 8자리 이상이어야 합니다'
                        ]"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        class="mb-2 mt-4"
                        :readonly="isGoogleLogin"
                      >
                        <template v-if="!isGoogleLogin" #append-inner>
                          <v-btn
                            small
                            style="background-color: #F57C00; color: white;"
                            @click="checkId"
                            :disabled="!canCheckId"
                          >
                            중복확인
                          </v-btn>
                        </template>
                      </v-text-field>
  
                      <!-- 중복확인 결과 메시지 출력 -->
                      <div
                        v-if="idValidMessage && !isGoogleLogin"
                        class="dup-check-message"
                        :class="{'valid-text': idValid, 'invalid-text': !idValid}"
                      >
                        {{ idValidMessage }}
                      </div>
  
                      <v-text-field
                        v-model="password"
                        label="비밀번호"
                        :rules="[
                          v => !!v || '비밀번호를 입력해주세요',
                          v => passwordRule.test(v) || '비밀번호는 영어, 숫자, 특수문자(?,!) 중 2가지 이상을 섞어 8자리 이상이어야 합니다'
                        ]"
                        :type="showPassword ? 'text' : 'password'"
                        prepend-inner-icon="mdi-lock"
                        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showPassword = !showPassword"
                        variant="outlined"
                        class="mb-2"
                      />
                      <v-text-field
                        v-model="email"
                        label="이메일"
                        :rules="[v => !!v || '이메일을 입력해주세요', v => /.+@.+\..+/.test(v) || '올바른 이메일을 입력해주세요']"
                        prepend-inner-icon="mdi-email"
                        variant="outlined"
                        class="mb-4"
                      />
                    </v-form>
                  </v-stepper-window-item>
  
                  <!-- 스텝 2: 개인정보 -->
                  <v-stepper-window-item :value="2">
                    <v-form ref="form2" v-model="isStep2Valid" @submit.prevent>
                      <v-text-field
                        v-model="name"
                        label="이름"
                        :rules="[v => !!v || '이름을 입력해주세요']"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        class="mb-2"
                      />
                      <v-text-field
                        v-model="nickName"
                        label="닉네임"
                        :rules="[v => !!v || '닉네임을 입력해주세요']"
                        prepend-inner-icon="mdi-tag"
                        variant="outlined"
                        class="mb-2"
                      >
                        <!-- 닉네임 텍스트필드 오른쪽에 중복확인 버튼 -->
                        <template #append-inner>
                          <v-btn
                            small
                            style="background-color: #F57C00; color: white;"
                            @click="checkNickName"
                          >
                            중복확인
                          </v-btn>
                        </template>
                      </v-text-field>
                      <!-- 닉네임 중복확인 결과 메시지 -->
                      <div
                        v-if="nickNameValidMessage"
                        class="dup-check-message"
                        :class="{'valid-text': nickNameValid, 'invalid-text': !nickNameValid}"
                      >
                        {{ nickNameValidMessage }}
                      </div>
                      <v-text-field
                        v-model="phoneNumber"
                        label="전화번호"
                        :rules="[
                          v => !!v || '전화번호를 입력해주세요',
                          v => /^\d{10,11}$/.test(v) || '전화번호는 숫자 10~11자리여야 합니다'
                        ]"
                        prepend-inner-icon="mdi-phone"
                        variant="outlined"
                        class="mb-2"
                      />
                      <v-text-field
                        v-model="birth"
                        label="생년월일 (YYMMDD)"
                        :rules="[
                          v => !!v || '생년월일을 입력해주세요',
                          v => /^\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[0-1])$/.test(v) || '생년월일은 YYMMDD 형식이어야 합니다'
                        ]"
                        prepend-inner-icon="mdi-calendar"
                        variant="outlined"
                        class="mb-2"
                      />
                      <v-select
                        v-model="gender"
                        label="성별"
                        :items="['MALE', 'FEMALE']"
                        prepend-inner-icon="mdi-gender-male-female"
                        variant="outlined"
                        class="mb-4"
                      />
                    </v-form>
                  </v-stepper-window-item>
  
                  <!-- 스텝 3: 주소정보 -->
                  <v-stepper-window-item :value="3">
                    <v-form ref="form3" v-model="isStep3Valid" @submit.prevent>
                      <v-text-field
                        v-model="userAddress.state"
                        label="도 (State)"
                        :rules="[v => !!v || '도를 입력해주세요']"
                        prepend-inner-icon="mdi-map"
                        variant="outlined"
                        class="mb-2"
                      />
                      <v-text-field
                        v-model="userAddress.city"
                        label="시/군/구 (City)"
                        :rules="[v => !!v || '시/군/구를 입력해주세요']"
                        prepend-inner-icon="mdi-city"
                        variant="outlined"
                        class="mb-2"
                      />
                      <v-text-field
                        v-model="userAddress.village"
                        label="동/읍/면 (Village)"
                        :rules="[v => !!v || '동/읍/면을 입력해주세요']"
                        prepend-inner-icon="mdi-home"
                        variant="outlined"
                        class="mb-4"
                      />
                    </v-form>
                  </v-stepper-window-item>
                </v-stepper-window>
              </v-stepper>
  
              <!-- 버튼 그룹 -->
              <v-row class="mt-4">
                <v-col cols="6" v-if="currentStep > 1">
                  <v-btn
                    block
                    variant="outlined"
                    @click="currentStep--"
                    class="prev-btn"
                  >
                    이전
                  </v-btn>
                </v-col>
                <v-col :cols="currentStep === 1 ? 12 : 6">
                  <v-btn
                    v-if="currentStep < 3"
                    block
                    color="primary"
                    @click="nextStep"
                    class="next-btn"
                    :disabled="!canProceed"
                  >
                    다음
                  </v-btn>
                  <v-btn
                    v-else
                    block
                    color="primary"
                    @click="create"
                    :loading="loading"
                    class="submit-btn"
                    :disabled="!canProceed"
                  >
                    가입하기
                  </v-btn>
                </v-col>
              </v-row>
  
              <!-- 로그인 링크 -->
              <div class="text-center mt-4">
                <span class="text-body-2">이미 계정이 있으신가요? </span>
                <v-btn
                  variant="text"
                  color="primary"
                  class="text-caption"
                  @click="$router.push('/user/login')"
                >
                  로그인하러가기
                </v-btn>
              </div>
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
        currentStep: 1,
        loading: false,
        showError: false,
        errorMessage: "",
        showPassword: false,
        isStep1Valid: false,
        isStep2Valid: false,
        isStep3Valid: false,
        // 폼 데이터
        identify: localStorage.getItem("signup_identify") || "",
        email: localStorage.getItem("signup_email") || "",
        name: localStorage.getItem("signup_name") || "",
        isGoogleLogin: !!localStorage.getItem("signup_identify"),
        nickName: "",
        password: "",
        phoneNumber: "",
        birth: "",
        gender: "FEMALE",
        userAddress: {
          state: "",
          city: "",
          village: ""
        },
        // 중복확인 결과 관련 (아이디)
        idValidMessage: "",
        idValid: false,
        // 닉네임 중복확인 결과 관련
        nickNameValidMessage: "",
        nickNameValid: false
      }
    },
    watch: {
      identify(value) {
        if (this.isGoogleLogin) {
          this.isStep1Valid = !!this.password; // 구글 로그인 시 비밀번호 입력 필요
        } else {
          this.isStep1Valid = !!value && this.idValid && !!this.password; // 일반 회원가입 시 중복확인 & 비밀번호 입력 필요
        }
      },
      password(value) {
        if (this.isGoogleLogin) {
          this.isStep1Valid = !!value; // 구글 로그인 시 비밀번호 필수
        } else {
          this.isStep1Valid = !!value && !!this.identify && this.idValid; // 일반 회원가입 시 조건 유지
        }
      },
      email(value) {
        this.isStep1Valid = !!value && !!this.identify && this.idValid && !!this.password;
      }
    },
    mounted() {
      if (this.isGoogleLogin) {
        this.idValid = true;
        this.isStep1Valid = true; // 구글 로그인 시 1단계 자동 통과
      }
      // 회원가입 후 필요 없는 데이터 제거
      localStorage.removeItem("signup_identify");
      localStorage.removeItem("signup_email");
      localStorage.removeItem("signup_name");
    },
    computed: {
      canProceed() {
        switch (this.currentStep) {
          case 1:
            return this.isStep1Valid && (this.idValid || this.isGoogleLogin)&& !!this.password;
          case 2:
            return this.isStep2Valid && this.nickNameValid;
          case 3:
            return this.isStep3Valid;
          default:
            return false;
        }
      },
      // 아이디 정규식 (영어, 숫자, 특수문자(?,!) 중 2가지 이상 조합, 8자 이상)
      idRule() {
        return /^(?=.{8,})(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[!?])|(?=.*\d)(?=.*[!?]))[A-Za-z0-9!?]+$/;
      },
      // 비밀번호 정규식 (아이디와 동일)
      passwordRule() {
        return this.idRule;
      },
      canCheckId() {
        return this.idRule.test(this.identify) && !this.isGoogleLogin;
      }
    },
    methods: {
      nextStep() {
        if (this.canProceed) {
          this.currentStep++;
        }
      },
      async create() {
        if (!this.canProceed) return;
        
        this.loading = true;
        try {
          const data = {
            identify: this.identify,
            password: this.password,
            name: this.name,
            nickName: this.nickName,
            email: this.email,
            phoneNumber: this.phoneNumber,
            birth: this.birth,
            gender: this.gender,
            userAddress: {
              state: this.userAddress.state,
              city: this.userAddress.city,
              village: this.userAddress.village
            }
          };
          
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/create`, data);
          this.$router.push("/login");
        } catch (e) {
          this.errorMessage = e.response?.data || "회원가입에 실패했습니다";
          this.showError = true;
        } finally {
          this.loading = false;
        }
      },
      async checkId() {
        if (!this.identify) {
          this.idValidMessage = "아이디를 먼저 입력해주세요.";
          this.idValid = false;
          return;
        }
        try {
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user/idValid`,
            { identify: this.identify }
          );
          if (response.data === true) {
            this.idValidMessage = "사용 가능한 아이디입니다.";
            this.idValid = true;
          } else {
            this.idValidMessage = "이미 사용 중인 아이디입니다.";
            this.idValid = false;
          }
        } catch (error) {
          console.error("아이디 중복확인 실패:", error);
          this.idValidMessage = "아이디 확인 중 오류가 발생했습니다.";
          this.idValid = false;
        }
      },
      async checkNickName() {
        if (!this.nickName) {
          this.nickNameValidMessage = "닉네임을 먼저 입력해주세요.";
          this.nickNameValid = false;
          return;
        }
        try {
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user/nickNameValid`,
            { nickName: this.nickName }
          );
          if (response.data === true) {
            this.nickNameValidMessage = "사용 가능한 닉네임입니다.";
            this.nickNameValid = true;
          } else {
            this.nickNameValidMessage = "이미 사용 중인 닉네임입니다.";
            this.nickNameValid = false;
          }
        } catch (error) {
          console.error("닉네임 중복확인 실패:", error);
          this.nickNameValidMessage = "닉네임 확인 중 오류가 발생했습니다.";
          this.nickNameValid = false;
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .signup-container {
    background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
  }
  
  .signup-card {
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(255, 94, 98, 0.1);
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  .signup-stepper {
    background: transparent !important;
    box-shadow: none !important;
  }
  
  :deep(.v-stepper-header) {
    box-shadow: none !important;
    border-radius: 8px;
    margin-bottom: 20px !important;
  }
  
  :deep(.v-stepper-item--complete),
  :deep(.v-stepper-item--active) {
    color: #ff5e62 !important;
  }
  
  :deep(.v-stepper-item--complete .v-stepper-item__icon),
  :deep(.v-stepper-item--active .v-stepper-item__icon) {
    background-color: #ff5e62 !important;
  }
  
  .next-btn,
  .submit-btn {
    background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%) !important;
    color: white !important;
    transition: opacity 0.3s ease;
  }
  
  .next-btn:hover,
  .submit-btn:hover {
    opacity: 0.9;
  }
  
  .prev-btn {
    border-color: #ff5e62 !important;
    color: #ff5e62 !important;
  }
  
  :deep(.v-field.v-field--focused) {
    --v-field-border-color: #ff5e62 !important;
  }
  
  /* 에러 메시지 스타일 */
  .valid-text {
    color: green;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  .invalid-text {
    color: red;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  /* 중복확인 결과 메시지 스타일 */
  .dup-check-message {
    margin-top: 4px;
    margin-bottom: 8px;
    font-size: 0.8rem;
  }
  
  /* 애니메이션 */
  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }
  
  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
  </style>
  