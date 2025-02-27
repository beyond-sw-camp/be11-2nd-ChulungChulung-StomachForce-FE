<template>
  <v-app-bar app color="white" flat class="top-bar">
    <v-container>
      <v-row align="center">
        <!-- 로고 -->
        <v-col cols="auto" class="d-flex align-center">
          <img src="@/assets/stomach.png" class="logo-image" alt="stomach logo">
          <v-btn variant="plain" class="text-h5 font-weight-bold logo-text no-active-bg" to="/">뱃살력</v-btn>
        </v-col>

        <!-- 🔹 검색창 -->
        <v-col cols="5" class="search-container">
          <div class="search-bar">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              item-title="text"
              item-value="value"
              hide-details
              density="compact"
              class="category-select"
            ></v-select>

            <div class="search-input-wrapper">
              <input 
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="검색어 입력"
                @keyup.enter="search"
              />
            </div>

            <v-btn class="search-icon-btn" @click="search">
              <v-icon size="22">mdi-magnify</v-icon>
            </v-btn>
          </div>

        </v-col>
  
        <v-spacer></v-spacer>
        <!-- 로그인 & MyPage 버튼 -->
        <v-col cols="auto" class="d-flex align-center">
          <template v-if="!isLogin">
            <v-btn @click="doCreate" class="mr-4" variant="text" color="black">회원가입</v-btn>
            <v-btn @click="doLogin" variant="text" class="login-btn font-weight-bold" color="black">로그인</v-btn>
          </template>
          <div v-if="isLogin" class="d-flex align-center">
            <v-avatar size="40">
              <v-img :src="profilePhoto" />
            </v-avatar>
            <span class="ml-2">{{ userName }}</span>
          </div>
          <v-btn v-if="isLogin" text @click="myPage">MyPage</v-btn>
          <v-btn v-if="isLogin" text @click="doLogout">로그아웃</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>

  <!-- ✅ 네비게이션 바 -->
  <v-app-bar color="grey-lighten-4" flat class="menu-bar">
    <v-container>
      <v-row justify="center" no-gutters>
        <v-col cols="auto" v-for="(item, index) in menuItems" :key="index">
          <v-btn :to="item.path" class="menu-item mx-8" variant="text" :ripple="false">
            {{ item.title }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>
  
<script>
import axios from 'axios';
export default {
  data() {
    return {
      isLogin: false,
      isRestaurant: false,
      userName: "",
      profilePhoto: "",
      userRole: "",
      showSearch: false,
      selectedCategory: "회원", // ✅ 기본값을 "회원"으로 설정
      searchQuery: "",
      categories: [
        { text: "레스토랑", value: "레스토랑" },
        { text: "회원", value: "회원" }
      ],
      menuItems: [
        { title: "공지사항", path: "/notice" },
        { title: "레스토랑", path: "/restaurant/list" },
        { title: "오늘의 이야기", path: "/post/postList" },
        { title: "이벤트", path: "/event" },
        { title: "고객센터", path: "/service" },
      ]
    };
  },
  computed: {
    filteredMenuItems() {
      return this.menuItems.filter(item => !item.adminOnly || this.userRole === "ADMIN");
    }
  },
  created() {
    const restaurantId = localStorage.getItem("restaurantId");
    if (restaurantId) {
      this.isRestaurant = true;
      this.isLogin = true;
      this.userName = localStorage.getItem("restaurantName") || "";
      this.profilePhoto = localStorage.getItem("restaurantProfilePhoto") || "";
    } else {
      // 일반 회원 로그인 확인
      const token = localStorage.getItem("token");
      if (token) {
        this.isLogin = true;
        this.userName = localStorage.getItem("userName") || "";
        this.profilePhoto = localStorage.getItem("profilePhoto") || "";
        this.userRole = localStorage.getItem("userRole") || "";
        
        if (this.userRole === "ADMIN") {
          this.menuItems.push({ title: "회원 관리", path: "/user/list" });
        }
      }
    }
  },
  async beforeMount() {
    await this.fetchUserInfo();
  },

  methods: {
    async fetchUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("토큰이 없습니다. 비로그인 상태입니다.");
    return; // 토큰 없으면 호출하지 않음
  }

  try {
    const response = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/user/userInfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    this.loginUserNickName = response.data.userNickName;
    this.userRole = response.data.role;
  } catch (error) {
    console.error("로그인 유저 정보 조회 실패:", error);
  }
},
    
    doLogout() {
      localStorage.clear();
      window.location.href = "/";
    },
    doLogin() {
      window.location.href = "/login";
    },
    doCreate() {
      window.location.href = "/selectCreate";
    },
    myPage() {
      // localStorage에 저장된 정보로 isRestaurant 값을 확인하여 라우팅 결정
      if (this.isRestaurant) {
        window.location.href = "/restaurant/mypage";
      } else {
        window.location.href = "/user/mypage";
      }
    },
    search() {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = "http://localhost:3000/login";
        return;
      }
      if (!this.selectedCategory) {
        alert("카테고리를 선택해주세요.");
        return;
      }
      if (this.selectedCategory === "회원") {
        window.location.href = "/user/findUser?nickName=" + encodeURIComponent(this.searchQuery);
      } else if (this.selectedCategory === "레스토랑") {
        this.$router.push({ path: "/restaurant/list", query: { name: this.searchQuery } });
      }
      this.showSearch = false;
      this.searchQuery = "";
    }
  }
};
</script>
  
<style scoped>
/* 🔹 기본 스타일 */
@font-face {
  font-family: 'Cafe24Ssurround';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/Cafe24Ssurround.woff') format('woff');
}
.top-bar {
  border-bottom: 2px solid black;
}

/* ✅ 네비게이션 바 */
.menu-bar {
  border-bottom: 1px solid #e0e0e0;
  height: 56px;
}

/* 🔹 로고 이미지 */
.logo-image {
  max-height: 60px;
  max-width: 60px;
}

/* 🔹 검색창 스타일 */
.search-container {
  max-width: 520px;
}
.search-bar {
  display: flex;
  align-items: center;
  background: #F04E23;
  border-radius: 50px;
  height: 44px;
  padding: 4px 10px;
  gap: 6px;
}

/* 🔹 카테고리 스타일 */
.category-select {
  flex: 1;
  max-width: 140px;
  background: transparent;
  color: white !important;
  font-size: 14px;
  border: none !important;
  box-shadow: none !important;
}

/* 🔹 검색어 입력 필드 스타일 */
.search-input-wrapper {
  flex: 2;
  height: 100%;
}
.search-input {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  color: black;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}
.search-input::placeholder {
  color: #999;
  opacity: 1; /* ✅ 흐려지지 않게 */
}

/* 🔹 돋보기 버튼 */
.search-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #F04E23;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
  padding: 0;
  min-width: 38px;
}
.search-icon-btn:hover {
  background-color: #d93c1a;
}

/* 🔹 네비게이션 메뉴 */
.menu-item {
  font-family: 'Cafe24Ssurround', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #424242;
  text-transform: none;
  height: 56px;
  min-width: 120px;
  padding: 0 32px;
}
.menu-item:hover {
  color: #F04E23;
}
.menu-item.v-btn--active {
  color: #F04E23;
}

/* 🔹 로고 스타일 */
.logo-text {
  color: #F04E23 !important;
  font-weight: bold !important;
  opacity: 1 !important;
  text-transform: none;
}
</style>
