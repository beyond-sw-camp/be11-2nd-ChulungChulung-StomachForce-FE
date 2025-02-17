<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="4" md="6">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        회원가입
                    </v-card-title>
                    <v-card-text>
                        <v-form @keydown.enter="create">
                            <v-text-field
                                label="이름"
                                v-model="name"
                                prepend-icon="mdi-account"
                                required
                            />
                            <v-text-field
                                label="닉네임"
                                v-model="nickName"
                                prepend-icon="mdi-tag"
                                required
                            />
                            <v-text-field
                                label="ID"
                                v-model="identify"
                                prepend-icon="mdi-account"
                                required
                            />
                            <v-text-field
                                label="비밀번호"
                                v-model="password"
                                type="password"
                                prepend-icon="mdi-lock"
                                required
                            />
                            <v-text-field
                                label="전화번호"
                                v-model="phoneNumber"
                                prepend-icon="mdi-phone"
                                required
                            />
                            <v-text-field
                                label="생년월일 (YYMMDD)"
                                v-model="birth"
                                prepend-icon="mdi-calendar"
                                required
                            />
                            <v-select
                                label="성별"
                                v-model="gender"
                                :items="['MALE', 'FEMALE']"
                                prepend-icon="mdi-gender-male-female"
                                required
                            />
                            <v-text-field
                                label="이메일"
                                v-model="email"
                                type="email"
                                prepend-icon="mdi-email"
                                required
                            />
                            <v-text-field
                                label="도 (State)"
                                v-model="userAddress.state"
                                prepend-icon="mdi-map"
                                required
                            />
                            <v-text-field
                                label="시/군/구 (City)"
                                v-model="userAddress.city"
                                prepend-icon="mdi-city"
                                required
                            />
                            <v-text-field
                                label="동/읍/면 (Village)"
                                v-model="userAddress.village"
                                prepend-icon="mdi-home"
                                required
                            />
                            <v-row>
                                <v-col cols="12">
                                    <v-btn color="primary" block @click="create()">등록</v-btn>
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
        methods: {
            async create(){
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
                    this.$router.push("/");
                } catch (e) {
                    alert(e.response?.data || "회원가입 실패");
                }
            }
        }
    }
</script>