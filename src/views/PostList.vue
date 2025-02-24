<template>
    <v-container fluid class="post-container pa-0">
      <!-- 상단 헤더 -->
      <div class="header-section">
        <div class="header-content text-center pa-8">
          <h1 class="text-h4 font-weight-bold mb-2">오늘의 이야기</h1>
          <p class="text-subtitle-1 text-white">다른 사용자들과 이야기를 나눠보세요</p>
        </div>
        <div class="header-curve"></div>
      </div>
  
      <v-container class="content-container">
        <v-row justify="center">
          <v-col cols="12" sm="11" md="8" lg="6">
            <div class="post-list hide-scrollbar">
              <v-card
                v-for="post in posts"
                :key="post.postId"
                class="post-card mb-6"
                elevation="0"
              >
                <!-- 게시글 이미지 -->
                <v-img
                  v-if="post.postPhotos.length > 0"
                  :src="post.postPhotos[0]"
                  height="400"
                  cover
                  class="post-image"
                ></v-img>
  
                <v-card-text class="pa-5">
                  <!-- 게시글 내용 -->
                  <p class="text-body-1 mb-4 post-content">{{ post.contents }}</p>
  
                  <!-- 태그 -->
                  <div v-if="post.tags.length > 0" class="mb-4">
                    <v-chip
                      v-for="(tag, index) in post.tags"
                      :key="index"
                      class="mr-2 mb-2"
                      color="orange-lighten-4"
                      variant="flat"
                      size="small"
                    >
                      #{{ tag }}
                    </v-chip>
                  </div>
  
                  <!-- 좋아요 및 버튼 -->
                  <div class="d-flex align-center justify-space-between mt-2">
                    <div class="d-flex align-center">
                      <v-btn
                        icon
                        variant="text"
                        :color="post.isLiked ? 'orange-darken-2' : 'orange-lighten-1'"
                        @click="toggleLike(post)"
                        class="like-btn mr-2"
                      >
                        <v-icon size="28" class="like-icon">
                          {{ post.isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
                        </v-icon>
                      </v-btn>
                      <span class="text-subtitle-2 font-weight-medium" :class="post.isLiked ? 'text-orange-darken-2' : 'text-orange-lighten-1'">
                        {{ post.likes }}
                      </span>
                    </div>
  
                    <v-btn
                      variant="text"
                      color="orange-darken-2"
                      class="details-btn font-weight-medium"
                      @click="goToPostDetail(post.postId)"
                    >
                      자세히 보기
                      <v-icon size="20" class="ml-1">mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>
  
            <!-- 로딩 스피너 -->
            <v-row justify="center" class="py-8">
              <v-progress-circular
                v-if="isLoading"
                indeterminate
                color="orange"
                :size="40"
              ></v-progress-circular>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        posts: [], // 게시글 목록
        page: 0, // 현재 페이지
        size: 5, // 한 번에 가져올 개수
        isLastPage: false, // 마지막 페이지 여부
        isLoading: false // 로딩 상태
      };
    },
    async created() {
      // ✅ 페이지가 처음 로드될 때 좋아요 상태를 포함하여 게시글 로드
      await this.loadPosts({ done: () => {} });
    },
    methods: {
      async loadPosts({ done }) {
        if (this.isLoading || this.isLastPage) return;
        this.isLoading = true;
  
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/postList`, {
            params: { page: this.page, size: this.size },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });
  
          const newPosts = response.data.content;
          if (newPosts.length === 0) {
            this.isLastPage = true;
            done('empty');
          } else {
            this.posts.push(...newPosts);
            this.page++;
  
            // ✅ 각 게시글의 좋아요 여부 가져오기 (데이터 로드 직후 실행)
            await Promise.all(this.posts.map(post => this.fetchLikeData(post)));
  
            done('ok');
          }
        } catch (error) {
          console.error("게시글 불러오기 실패:", error);
          done('error');
        }
        this.isLoading = false;
      },
  
      async fetchLikeData(post) {
        if (!post.postId) {
          console.error("postId가 없습니다:", post);
          return;
        }
  
        try {
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/post/getLike/${post.postId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }
          );
          post.isLiked = response.data.liked;
          post.likes = response.data.likes;
        } catch (error) {
          console.error(`좋아요 상태 가져오기 실패 (postId: ${post.postId})`, error);
        }
      },
  
      async toggleLike(post) {
        if (!post.postId) {
          console.error("postId를 찾을 수 없습니다:", post);
          return;
        }
  
        try {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/post/postLike/${post.postId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }
          );
  
          // ✅ 좋아요 상태 즉시 업데이트
          await this.fetchLikeData(post);
        } catch (error) {
          console.error("좋아요 토글 실패:", error);
        }
      },
  
      goToPostDetail(postId) {
        this.$router.push({ name: "UserPostDetail", params: { postId } });
      }
    }
  };
  </script>
  
  <style scoped>
  .post-container {
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
  
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .post-card {
    border-radius: 20px;
    overflow: hidden;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  }
  
  .post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
  }
  
  .post-image {
    transition: transform 0.3s ease;
  }
  
  .post-content {
    line-height: 1.6;
    color: #333;
    font-size: 1.1rem;
  }
  
  .like-btn {
    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .like-btn:hover {
    transform: scale(1.2);
  }
  
  .like-btn:active {
    transform: scale(0.8);
  }
  
  .like-icon {
    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .like-btn:active .like-icon {
    transform: scale(1.2);
  }
  
  .v-icon.mdi-heart-outline {
    font-weight: 100;
  }
  
  .details-btn {
    text-transform: none;
    letter-spacing: 0.5px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
  }
  
  .details-btn:hover {
    transform: translateX(4px);
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
      padding: 0 8px;
    }
  
    .post-card {
      border-radius: 16px;
      margin-bottom: 16px;
    }
  
    .post-image {
      height: 300px !important;
    }
  
    .post-content {
      font-size: 1rem;
    }
  }
  </style>
  