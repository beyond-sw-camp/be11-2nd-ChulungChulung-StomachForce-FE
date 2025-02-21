<template>
    <v-app>
      <!-- 상단 앱바 -->
      <v-app-bar app color="white" flat>
        <v-btn icon @click="$router.push('/')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="logout">
              <v-list-item-title>로그아웃</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>
  
      <v-main>
        <v-container>
          <!-- 프로필 섹션 -->
          <v-row justify="center" align="center" class="profile-section">
            <v-col cols="12" sm="3" class="text-center">
              <v-avatar size="130">
                <v-img :src="profilePhoto" alt="프로필" />
              </v-avatar>
            </v-col>
            <v-col cols="12" sm="6" class="user-info text-left">
              <h2 class="user-name">{{ userNickName }}</h2>
              <p class="user-email">{{ userEmail }}</p>
              <v-row class="stats mt-2" justify="left">
                <v-col cols="auto" class="stat-item text-center">
                  <strong @click="openFollowersDialog" style="cursor:pointer;">팔로워</strong>
                  <p @click="openFollowersDialog" style="cursor:pointer;">{{ followersCount }}</p>
                </v-col>
                <v-col cols="auto" class="stat-item text-center">
                  <strong @click="openFollowingDialog" style="cursor:pointer;">팔로잉</strong>
                  <p @click="openFollowingDialog" style="cursor:pointer;">{{ followingCount }}</p>
                </v-col>
                <v-col cols="auto" class="stat-item text-center">
                  <strong>게시글</strong>
                  <p>{{ totalPost }}</p>
                </v-col>
              </v-row>
  
              <!-- 팔로우 버튼 -->
              <v-btn 
                :color="isFollowing ? 'grey' : 'primary'" 
                class="follow-btn mt-3"
                @click="toggleFollow"
              >
                {{ isFollowing ? "팔로우 취소" : "팔로우" }}
              </v-btn>
            </v-col>
          </v-row>
  
          <v-divider class="my-4"></v-divider>
  
          <!-- 게시글 섹션 -->
          <div v-if="postPhotos.length === 0" class="no-posts text-center">
            <p>게시글이 없습니다</p>
          </div>
          <v-row v-else justify="start" class="post-grid" no-gutters>
            <v-col
              v-for="(photo, index) in postPhotos"
              :key="index"
              cols="12"
              sm="4"
              class="post-col"
            >
              <v-card class="clickable-card" flat>
                <v-img 
                  :src="photo" 
                  aspect-ratio="1" 
                  cover 
                  class="post-image"
                ></v-img>
              </v-card>
            </v-col>
          </v-row>
  
          <!-- 로딩 인디케이터 -->
          <div v-if="isLoading" class="text-center my-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "YourPage",
    data() {
      return {
        userNickName: "",
        userEmail: "",
        profilePhoto: "https://via.placeholder.com/130",
        followersCount: 0,
        followingCount: 0,
        totalPost: 0,
        postPhotos: [],
        pageSize: 6,
        currentPage: 0,
        isLoading: false,
        isFollowing: false, // 현재 팔로우 상태
      };
    },
    created() {
      this.loadUserPage();
    },
    methods: {
      async loadUserPage() {
        if (this.isLoading) return;
        this.isLoading = true;
        try {
          const formData = new URLSearchParams();
          formData.append("size", this.pageSize);
          formData.append("page", this.currentPage);
          formData.append("nickName", this.$route.query.nickName || "");
  
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/user/yourPage`,
            {
              params: formData,
              headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
          );
  
          const data = response.data;
          this.profilePhoto = data.profile || "https://via.placeholder.com/130";
          this.userNickName = data.nickName;
          this.userEmail = data.email;
          this.followersCount = data.follwers;
          this.followingCount = data.followings;
          this.totalPost = data.totalPost;
          this.postPhotos = data.postPhotos || [];
  
          // 현재 사용자가 이 유저를 팔로우하고 있는지 여부 확인
          this.isFollowing = data.isFollowing || false;
        } catch (error) {
          console.error("유저 페이지 로드 실패:", error);
        }
        this.isLoading = false;
      },
      async toggleFollow() {
        // ✅ 1️⃣ 즉시 UI 업데이트 (팔로우 / 언팔로우)
        if (this.isFollowing) {
          this.isFollowing = false;
          if (this.followersCount > 0) this.followersCount--;
        } else {
          this.isFollowing = true;
          this.followersCount++;
        }
  
        try {
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user/follow`,
            { nickName: this.userNickName },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }
          );
  
          const responseMessage = response.data;
  
          // ✅ 2️⃣ 서버 응답에 따라 상태 조정 (서버 응답과 관계없이 UI 상태 유지)
          if (responseMessage === "팔로우가 취소되었습니다.") {
            this.isFollowing = false;
            this.followersCount = Math.max(0, this.followersCount - 1);
          } else if (responseMessage === "ok") {
            this.isFollowing = true;
            this.followersCount++;
          }
        } catch (error) {
          console.error("팔로우 요청 실패:", error);
        }
      },
      logout() {
        alert("로그아웃 되었습니다 (예시)");
      },
    }
  };
  </script>
  
  <style scoped>
  .follow-btn {
    width: 120px;
  }
  </style>
  