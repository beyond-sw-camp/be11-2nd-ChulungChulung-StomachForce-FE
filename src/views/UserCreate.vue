<template>
    <v-container fluid class="signup-container fill-height" style="min-height: 100vh;">
        <v-row justify="center" align="center">
            <v-col cols="12" sm="8" md="6" lg="5">
                <v-card elevation="8" class="signup-card">
                    <!-- 헤더 섹션 -->
                    <div class="text-center pt-8">
                        <v-avatar size="70" class="mb-3">
                            <v-img src="@/assets/logo.png" alt="로고"></v-img>
                        </v-avatar>
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
                                    <v-form ref="form1" v-model="isStep1Valid" @submit.prevent>
                                        <v-text-field
                                            v-model="identify"
                                            label="아이디"
                                            :rules="[v => !!v || '아이디를 입력해주세요']"
                                            prepend-inner-icon="mdi-account"
                                            variant="outlined"
                                            class="mb-2"
                                        />
                                        <v-text-field
                                            v-model="password"
                                            label="비밀번호"
                                            :rules="[v => !!v || '비밀번호를 입력해주세요']"
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
                                        />
                                        <v-text-field
                                            v-model="phoneNumber"
                                            label="전화번호"
                                            :rules="[v => !!v || '전화번호를 입력해주세요']"
                                            prepend-inner-icon="mdi-phone"
                                            variant="outlined"
                                            class="mb-2"
                                        />
                                        <v-text-field
                                            v-model="birth"
                                            label="생년월일 (YYMMDD)"
                                            :rules="[v => !!v || '생년월일을 입력해주세요']"
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
                                @click="$router.push('/login')"
                            >
                                로그인하기
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
            name: "",
            nickName: "",
            identify: "",
            password: "",
            phoneNumber: "",
            birth: "",
            gender: "FEMALE",
            email: "",
            userAddress: {
                state: "",
                city: "",
                village: ""
            }
        }
    },
    computed: {
        canProceed() {
            switch (this.currentStep) {
                case 1:
                    return this.isStep1Valid;
                case 2:
                    return this.isStep2Valid;
                case 3:
                    return this.isStep3Valid;
                default:
                    return false;
            }
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