<template>
    <v-container class="d-flex justify-center align-center fill-height">
      <v-row class="justify-center">
        <!-- 일반 유저 로그인 -->
        <v-col cols="12" sm="6" md="4">
          <v-card class="login-card" outlined>
            <v-card-text class="text-center">
              <v-img :src="require('@/assets/user.png')" contain height="80"></v-img>
              <h3 class="login-title">일반유저 로그인</h3>
              <v-btn class="login-btn" block @click="$router.push('/user/login')">로그인</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- 사업자 로그인 -->
        <v-col cols="12" sm="6" md="4">
          <v-card class="login-card business-card" outlined>
            <v-card-text class="text-center">
                <v-img :src="require('@/assets/ceo.png')" contain height="80"></v-img>
              <h3 class="login-title">사업자 로그인</h3>
              <v-btn class="login-btn" block @click="$router.push('/restaurant/login')">로그인</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <style scoped>
  .fill-height {
    min-height: 100vh;
  }
  
  .login-card {
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    transition: transform 0.2s;
    border-color: #39a0ef;
  }
  
  .business-card {
    border-color: #00c853;
  }
  
  .login-card:hover {
    transform: scale(1.03);
  }
  
  .login-title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 12px;
  }
  
  .login-btn {
    background-color: #ff7043;
    color: white;
    font-weight: bold;
  }
  
  .login-btn:hover {
    opacity: 0.9;
  }
  </style>
  