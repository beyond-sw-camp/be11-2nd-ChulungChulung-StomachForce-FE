<template>
    <v-app-bar app color="white" flat class="top-bar">
      <v-container>
        <v-row align="center">
          <!-- 상단: 로고 & 검색창 & 로그인 버튼 -->
          <v-col class="d-flex align-center">
            <v-img src="/stomach.png" contain max-height="60" max-width="60" class="mr-2"></v-img>
            <v-btn text class="text-h5 font-weight-bold logo-text" to="/">뱃살력</v-btn>
            <v-text-field
              class="ml-4 search-box rounded-search"
              solo
              placeholder="검색"
              append-icon="mdi-magnify"
            ></v-text-field>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn v-if="!isLogin" :to="{path:'/selectCreate'}">회원가입</v-btn>
            <v-img v-if="!isLogin" text @click="doLogin" src="/login.png" contain max-height="40" max-width="80" class="login-img"></v-img>
            <div v-if="isLogin" class="d-flex align-center">
              <v-avatar size="40">
                <v-img :src="profilePhoto"/>
              </v-avatar>
              <span class="ml-2">{{ userName }}</span>
            </div>
            <v-btn v-if="isLogin" text @click="myPage">MyPage</v-btn>
            <v-btn v-if="isLogin" text @click="doLogout">로그아웃</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    
    <!-- 별도의 줄: 메뉴 항목 -->
    <v-app-bar color="lightgrey" flat class="menu-bar">
      <v-container>
        <v-row justify="center">
          <v-btn text to="/notice" class="menu-item">공지사항</v-btn>
          <v-btn text to="/restaurant/list" class="menu-item">레스토랑</v-btn>
          <v-btn text to="/influencer" class="menu-item">인플루언서</v-btn>
          <v-btn text to="/event" class="menu-item">이벤트</v-btn>
          <v-btn text to="/customer" class="menu-item">고객센터</v-btn>
        </v-row>
      </v-container>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isLogin: false,
        userName:"",
        profilePhoto: "",
      };
    },
    created() {
      const token = localStorage.getItem('token');
      if (token) {
        this.isLogin = true;
        this.userName = localStorage.getItem("userName") || "";
        this.profilePhoto =
          localStorage.getItem("profilePhoto") || "";
        }
    },
    methods: {
      doLogout() {
        localStorage.clear();
        window.location.href = "/";
      },
      doLogin(){
        window.location.href = "/login";
      },
      myPage(){
        window.location.href = "/user/mypage";
      }
    }
  };
  </script>
  
  <style scoped>
  .top-bar {
    border-bottom: 2px solid black;
  }
  .menu-bar {
    border-bottom: 2px solid lightgray;
  }
  .menu-item {
    font-size: 18px;
    font-weight: 600;
    color: black;
  }
  .search-box {
    max-width: 250px;
  }
  .rounded-search {
    border-radius: 20px;
    border: 1px solid black;
  }
  .logo-text {
    color: #F04E23;
  }
  .login-img {
  cursor: pointer;
}
  </style>