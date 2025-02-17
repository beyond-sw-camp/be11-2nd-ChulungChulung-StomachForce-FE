<template>
    <v-container>
        <v-row justify="center" align="center" class="profile-section">
        <v-col cols="12" sm="3" class="text-center">
          <v-avatar size="130">
            <v-img :src="profilePhoto" alt="프로필" />
          </v-avatar>
        </v-col>
        <v-col cols="12" sm="6" class="user-info text-left">
          <h2 class="user-name">{{ userName }}</h2>
          <p class="user-email">{{ userEmail }}</p>
          <v-row class="stats mt-2" justify="left">
            <v-col cols="auto" class="stat-item text-center">
              <strong>팔로워</strong>
              <p>{{ followers }}</p>
            </v-col>
            <v-col cols="auto" class="stat-item text-center">
              <strong>팔로잉</strong>
              <p>{{ following }}</p>
            </v-col>
            <v-col cols="auto" class="stat-item text-center">
              <strong>게시글</strong>
              <p>{{ posts }}</p>
            </v-col>
          </v-row>
        </v-col>
        </v-row>
  
        <v-divider class="my-4"></v-divider>
  
      <!-- 게시글 섹션 -->
        <v-row justify="start">
            <v-col v-for="(post, index) in postImages" :key="index" cols="12" sm="4">
                <v-card>
                    <v-img :src="post" aspect-ratio="1" class="post-image" />
                </v-card>
            </v-col>
        </v-row>
    </v-container>
  </template>
  
        <script>
        export default {
          data() {
            return {
              userEmail: "99dlatjdwo@naver.com",
              userName: localStorage.getItem("userName"), 
              profilePhoto: localStorage.getItem("profilePhoto"), 
              followers: 100,
              following: 100,
              posts: 100,
              postImages: [
                "https://via.placeholder.com/300", 
                "https://via.placeholder.com/300", 
                "https://via.placeholder.com/300", 
              ],
            };
          },
        };
        </script>
        
        <style scoped>
        .profile-section {
          display: flex;
          align-items: center;
          text-align: left;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .user-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .user-email {
          font-size: 14px;
        }
        
        .stats {
          display: flex;
          align-items: center;
        }
        
        .stat-item {
          margin-right: 100px;
        }
        .stat-item:last-child {
          margin-right: 0;
        }
        
        .stats p {
            font-size: 14px;
            margin: 4px 0;
        }
        
        .post-image {
          width: 100%;
          border-radius: 8px;
          transition: 0.3s;
          max-height: 250px; /* 원하는 높이로 조정 (예: 250px) */
          object-fit: cover; /* 이미지 비율 유지 */
        }
        
        .post-image:hover {
          opacity: 0.8;
        }
        </style>
