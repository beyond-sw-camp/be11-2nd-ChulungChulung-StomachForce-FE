<template>
  <v-app-bar app color="white" flat class="top-bar">
    <v-container>
      <v-row align="center">
        <!-- 로고 & 검색창 & 로그인 버튼 -->
        <v-col cols="auto" class="d-flex align-center">
          <img src="@/assets/stomach.png" style="object-fit: contain; max-height: 60px; max-width: 60px;" class="" alt="stomach logo">
          <v-btn variant="plain" text class="text-h5 font-weight-bold logo-text no-active-bg" to="/">뱃살력</v-btn>
        </v-col>
        
        <v-col cols="4">
          <v-menu
            v-model="showSearch"
            :close-on-content-click="false"
            location="bottom"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                class="search-box"
                solo
                placeholder="검색"
                prepend-inner-icon="mdi-magnify"
                hide-details
                rounded
                density="comfortable"
                readonly
                @click="showSearch = true"
              ></v-text-field>
            </template>

            <v-card min-width="600" class="pa-4">
              <v-row no-gutters align="center">
                <v-col cols="3" class="pr-3">
                  <v-select
                    v-model="selectedCategory"
                    :items="categories"
                    label="카테고리"
                    placeholder="카테고리 선택"
                    hide-details
                    density="comfortable"
                    class="category-select"
                  ></v-select>
                </v-col>
                
                <v-col cols="7" class="pr-3">
                  <v-text-field
                    v-model="searchQuery"
                    label="검색어 입력"
                    placeholder="검색어를 입력하세요"
                    hide-details
                    density="comfortable"
                    class="category-select"
                    @keyup.enter="search"
                  ></v-text-field>
                </v-col>

                <v-col cols="2">
                  <v-btn
                    color="primary"
                    @click="search"
                    block
                  >
                    검색
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-menu>
        </v-col>

        <v-spacer></v-spacer>

        <v-col cols="auto" class="d-flex align-center">
          <template v-if="!isLogin">
            <v-btn 
              @click="doCreate"
              class="mr-4"
              variant="text"
              color="black"
            >
              회원가입
            </v-btn>
            <v-btn 
              @click="doLogin"
              variant="text"
              class="login-btn font-weight-bold"
              color="black"
            >
              로그인
            </v-btn>
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
  
  <!-- 메뉴 항목 -->
  <v-app-bar color="grey-lighten-4" flat class="menu-bar">
    <v-container>
      <v-row justify="center" no-gutters>
        <v-col cols="auto" v-for="(item, index) in menuItems" :key="index">
          <v-btn 
            :to="item.path"
            class="menu-item mx-8"
            variant="text"
            :ripple="false"
          >
            {{ item.title }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>

export default {
  data() {
    return {
      isLogin: false,
      userName: "",
      profilePhoto: "",
      showSearch: false,
      selectedCategory: "",
      searchQuery: "",
      categories: ["레스토랑", "회원"],
      menuItems: [
        { title: "공지사항", path: "/notice" },
        { title: "레스토랑", path: "/restaurant/list" },
        { title: "오늘의 이야기", path: "/post/postList" },
        { title: "이벤트", path: "/event" },
        { title: "고객센터", path: "/service" }
      ]
    };
  },
  created() {
    const token = localStorage.getItem("token");
    if (token) {
      this.isLogin = true;
      this.userName = localStorage.getItem("userName") || "";
      this.profilePhoto = localStorage.getItem("profilePhoto") || "";
    }
    console.log(this.profilePhoto)
  },
  methods: {
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
      window.location.href = "/user/mypage";
    },
    search() {
      if (!this.selectedCategory) {
        alert("카테고리를 선택해주세요.");
        return;
      }
      // "회원" 선택 시 페이지 전체 리로드로 이동
      if (this.selectedCategory === "회원") {
        window.location.href = "/user/findUser?nickName=" + encodeURIComponent(this.searchQuery);
      } else if (this.selectedCategory === "레스토랑") {
        window.location.href = "/restaurant/findRestaurant";
      }
      // 검색 후 검색창 초기화
      this.showSearch = false;
      this.searchQuery = "";
    }
  }
};
</script>

<style scoped>
@font-face {
    font-family: 'Cafe24Ssurround';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/Cafe24Ssurround.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
.no-active-bg {
  background-color: transparent !important;
}

/* Vuetify가 active 상태일 때 배경색이 들어가는 걸 방지 */
.no-active-bg:active, 
.no-active-bg:focus, 
.no-active-bg:hover {
  background-color: transparent !important;
  box-shadow: none !important;
}

.top-bar {
  border-bottom: 2px solid black;
}
.menu-bar {
  border-bottom: 1px solid #e0e0e0;
  height: 56px;
}
.menu-item {
  font-family: 'Cafe24Ssurround', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #424242;
  text-transform: none;
  letter-spacing: -0.5px;
  height: 56px;
  position: relative;
  transition: color 0.3s ease;
  min-width: 120px;
  padding: 0 32px;
}
.menu-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background-color: #F04E23;
  transition: width 0.3s ease;
}
.menu-item:hover {
  color: #F04E23;
}
.menu-item:hover::after {
  width: 100%;
}
.menu-item.v-btn--active {
  color: #F04E23;
}
.menu-item.v-btn--active::after {
  width: 100%;
}
.search-box {
  max-width: 400px;
  margin: 0 auto;
}
.search-box :deep(.v-field__input) {
  padding: 8px 16px;
}
.search-box :deep(.v-field) {
  border-radius: 24px;
  background-color: #f5f5f5;
  cursor: pointer;
}
.search-box :deep(.v-field__outline) {
  display: none;
}
.search-box :deep(.v-menu .v-overlay__content) {
  border-radius: 8px;
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}
.logo-text {
  color: #F04E23 !important; /* 항상 진한 색 유지 */
  font-weight: bold !important; /* 항상 굵게 */
  opacity: 1 !important; /* 흐려지지 않도록 */
  text-transform: none; /* Vuetify 기본 스타일 제거 */
}
.login-btn {
  text-transform: none;
  letter-spacing: 0;
}
</style>
