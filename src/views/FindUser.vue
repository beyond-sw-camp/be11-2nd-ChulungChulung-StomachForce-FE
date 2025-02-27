<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h4 text-center mb-6">회원 검색 결과</h1>
        <p v-if="$route.query.nickName" class="text-subtitle-1 mb-4 text-center">
          검색어: <strong>{{ $route.query.nickName }}</strong>
        </p>

        <v-card v-if="users.length" class="pa-4">
          <v-list>
            <v-list-item v-for="user in users" :key="user.userId" class="mb-3 rounded-lg">
              <template v-slot:prepend>
                <v-avatar size="60" class="mr-4">
                  <v-img :src="user.profilePhoto" :alt="user.userNickName" cover />
                </v-avatar>
              </template>

              <v-list-item-content class="py-2">
                <v-list-item-title class="text-h6 mb-1">
                  {{ user.userNickName }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-subtitle-1">
                  {{ user.userName }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <template v-slot:append>
                <v-btn color="primary" variant="outlined" class="mt-2" @click="viewProfile(user.userNickName)">
                  프로필 보기
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card v-else class="pa-8 text-center" variant="outlined">
          <v-icon icon="mdi-account-search" size="64" color="grey" class="mb-4"></v-icon>
          <div class="text-h6 text-grey">검색 결과가 없습니다.</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "FindUser",
  data() {
    return {
      users: [],
      pageSize: 10,
      currentPage: 0,
      isLoading: false,
      isLastPage: false,
      // 현재 로그인한 사용자의 닉네임 (서버에서 받아옴)
      currentUserNickName: ""
    };
  },
  created() {
    // 먼저 현재 로그인한 사용자의 정보를 가져옴
    this.getCurrentUserInfo();
    // 검색어가 있을 때 사용자 목록을 로드
    this.loadUsers();
  },
  watch: {
    '$route.query.nickName'() {
      this.users = [];
      this.currentPage = 0;
      this.isLastPage = false;
      this.loadUsers();
    }
  },
  methods: {
    async getCurrentUserInfo() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/userInfo`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        // 응답 객체에서 현재 로그인한 사용자의 닉네임을 추출 (필드명은 서버 응답에 맞게 조정)
        this.currentUserNickName = response.data.userNickName;
      } catch (error) {
        console.error("내 정보 로드 실패:", error);
      }
    },
    async loadUsers() {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;
      try {
        const formData = new URLSearchParams();
        formData.append("size", this.pageSize);
        formData.append("page", this.currentPage);
        formData.append("nickName", this.$route.query.nickName || "");

        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/findUser`,
          {
            params: formData,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          }
        );

        const newUsers = response.data.content || response.data;
        if (newUsers.length === 0) {
          this.isLastPage = true;
        } else {
          this.users = [...this.users, ...newUsers];
          this.currentPage++;
        }
      } catch (error) {
        console.error("회원 검색 결과 로드 실패:", error);
      }
      this.isLoading = false;
    },
    viewProfile(nickName) {
      // 현재 로그인한 사용자의 닉네임과 클릭한 유저의 닉네임을 비교하여 라우팅
      if (nickName === this.currentUserNickName) {
        this.$router.push({ path: "/user/mypage" });
      } else {
        this.$router.push({ path: "/user/yourPage", query: { nickName } });
      }
    }
  }
};
</script>
