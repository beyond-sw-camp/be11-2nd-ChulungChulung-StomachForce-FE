<template>
    <v-container class="d-flex justify-center align-center fill-height">
      <v-row class="justify-center">
        <!-- 일반 유저 회원가입 -->
        <v-col cols="12" sm="6" md="4">
          <v-card class="register-card" outlined>
            <v-card-text class="text-center">
                <v-img :src="require('@/assets/user.png')" contain height="80"></v-img>
              <h3 class="register-title">일반유저 회원가입</h3>
              <p class="register-subtitle">음식점 예약을 원하는 개인</p>
              <v-btn class="register-btn" block @click="$router.push('/user/create')">회원가입</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- 사업자 회원가입 -->
        <v-col cols="12" sm="6" md="4">
          <v-card class="register-card business-card" outlined>
            <v-card-text class="text-center">
                <v-img :src="require('@/assets/ceo.png')" contain height="80"></v-img>
              <h3 class="register-title">사업자 회원가입</h3>
              <p class="register-subtitle">웹사이트에 음식점을 등록할 사업자</p>
              <v-btn class="register-btn" block @click="$router.push('/restaurant/create')">회원가입</v-btn>
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
  
  .register-card {
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    transition: transform 0.2s;
    border-color: #39a0ef;
  }
  
  .business-card {
    border-color: #00c853;
  }
  
  .register-card:hover {
    transform: scale(1.03);
  }
  
  .register-title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 12px;
  }
  
  .register-subtitle {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
  }
  
  .register-btn {
    background-color: #ff7043;
    color: white;
    font-weight: bold;
  }
  
  .register-btn:hover {
    opacity: 0.9;
  }
  </style>
  