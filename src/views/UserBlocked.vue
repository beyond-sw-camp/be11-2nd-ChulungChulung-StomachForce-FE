<template>
    <v-container fluid class="blocked-container pa-0">
      <!-- 상단 헤더 -->
      <div class="header-section">
        <div class="header-content text-center pa-10">
          <h1 class="text-h3 font-weight-bold mb-3">차단 목록</h1>
          <p class="text-subtitle-1 text-white">차단한 사용자를 관리할 수 있습니다</p>
        </div>
        <div class="header-curve"></div>
      </div>
  
      <!-- 메인 컨텐츠 -->
      <v-container class="content-container">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="7">
            <v-card class="blocked-list-card" elevation="0">
              <!-- 차단 목록이 없을 때 -->
              <div v-if="blockedUsers.length === 0" class="empty-state text-center pa-12">
                <v-icon size="80" color="orange-lighten-3">mdi-shield-account</v-icon>
                <h3 class="text-h5 font-weight-medium mt-6 mb-2">차단된 사용자가 없습니다</h3>
                <p class="text-body-1 text-medium-emphasis">현재 차단한 사용자가 없습니다</p>
              </div>
  
              <!-- 차단 목록 -->
              <v-list v-else class="py-4">
                <v-list-item
                  v-for="user in blockedUsers"
                  :key="user.blockId"
                  class="blocked-user-item my-2 mx-4"
                >
                  <template v-slot:prepend>
                    <v-avatar size="60" class="user-avatar">
                      <v-img :src="user.userProfile" cover></v-img>
                    </v-avatar>
                  </template>
  
                  <v-list-item-title class="text-h6 font-weight-medium">
                    {{ user.userNickName }}
                  </v-list-item-title>
  
                  <template v-slot:append>
                    <v-btn
                      color="orange"
                      variant="tonal"
                      class="unblock-btn"
                      @click="unblockUser(user.userNickName)"
                    >
                      차단 해제
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  export default {
    name: "BlockedUsers",
    data() {
      return {
        blockedUsers: [],
        isLoading: false,
      };
    },
    created() {
      this.fetchBlockedUsers();
    },
    methods: {
      async fetchBlockedUsers() {
        this.isLoading = true;
        try {
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/user/blockedList`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          this.blockedUsers = response.data;
        } catch (error) {
          console.error("차단된 사용자 목록 로드 실패:", error);
        } finally {
          this.isLoading = false;
        }
      },
      // 차단 해제 버튼 클릭 시 호출: blockedUserRes의 userNickName을 payload로 전송
      async unblockUser(userNickName) {
        try {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user/unblock`,
            { blockedUserNickName: userNickName },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          alert("차단 해제되었습니다.");
          // 차단 해제 성공 시 목록에서 해당 사용자를 제거합니다.
          this.blockedUsers = this.blockedUsers.filter(
            (user) => user.userNickName !== userNickName
          );
        } catch (error) {
          console.error("차단 해제 실패:", error);
          alert("차단 해제에 실패했습니다.");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .blocked-container {
    background-color: #fafafa;
    min-height: 100vh;
  }
  
  .header-section {
    background: linear-gradient(120deg, #ffa726 0%, #fb8c00 100%);
    position: relative;
    padding-bottom: 4rem;
  }
  
  .header-curve {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4rem;
    background-color: #fafafa;
    clip-path: ellipse(60% 100% at 50% 100%);
  }
  
  .content-container {
    margin-top: -2rem;
    position: relative;
    z-index: 1;
  }
  
  .blocked-list-card {
    background: white;
    border-radius: 24px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05) !important;
    overflow: hidden;
  }
  
  .blocked-user-item {
    border-radius: 12px;
    transition: all 0.3s ease;
    padding: 16px;
  }
  
  .blocked-user-item:hover {
    background-color: #fff3e0;
  }
  
  .user-avatar {
    border: 3px solid white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .unblock-btn {
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  }
  
  .unblock-btn:hover {
    transform: translateY(-2px);
  }
  
  .empty-state {
    min-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 600px) {
    .header-section {
      padding-bottom: 3rem;
    }
  
    .header-curve {
      height: 3rem;
    }
  
    .content-container {
      margin-top: -1.5rem;
    }
  
    .blocked-list-card {
      border-radius: 20px;
    }
  
    .blocked-user-item {
      margin: 0.5rem;
      padding: 12px;
    }
  
    .user-avatar {
      width: 50px !important;
      height: 50px !important;
    }
  
    .text-h3 {
      font-size: 2rem !important;
    }
  }
  </style>
  