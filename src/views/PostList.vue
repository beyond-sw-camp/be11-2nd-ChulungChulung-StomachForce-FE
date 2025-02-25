<template>
  <v-container fluid class="post-container pa-0">
    <!-- 상단 헤더 -->
    <div class="header-section">
      <div class="header-background"></div>
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="header-inner pa-12">
          <div class="d-flex flex-column align-center">
            <h1 class="header-title mb-3">오늘의 이야기</h1>
            <div class="subtitle-wrapper">
              <span class="header-subtitle">여러분들의 이야기를 공유해보세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-container class="content-container">
      <v-row justify="center">
        <v-col cols="12" sm="11" md="8" lg="6">
          <div class="post-list hide-scrollbar">
            <v-card
              v-for="post in posts"
              :key="post.postId"
              class="post-card"
              elevation="0"
              v-intersect="{
                handler: (entries, observer, isIntersecting) => {
                  if (isIntersecting && post === posts[posts.length - 2]) {
                    loadPosts({ done: () => {} });
                  }
                },
                options: { threshold: 0.5 }
              }"
              @click="goToPostDetail(post.postId)"
            >
              <!-- 작성자 정보 (작성자 프로필 및 닉네임) -->
              <v-card-title class="post-user-info pa-4">
                <v-avatar size="40" class="mr-3">
                  <v-img :src="post.userProfile" alt="프로필" />
                </v-avatar>
                <span class="post-user-name">{{ post.userNickName }}</span>
              </v-card-title>

              <!-- 게시글 이미지 (post.postPhotos가 null이 아닌지 확인) -->
              <v-img
                v-if="post.postPhotos && post.postPhotos.length > 0"
                :src="post.postPhotos[0]"
                height="400"
                cover
                class="post-image"
              ></v-img>

              <v-card-text class="pa-5">
                <!-- 게시글 내용 -->
                <p class="text-body-1 mb-4 post-content">{{ post.contents }}</p>

                <!-- 태그 (post.tags가 null이 아닌지 확인) -->
                <div v-if="post.tags && post.tags.length > 0" class="mb-4">
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

                <!-- 좋아요 및 기타 버튼 (상세보기 버튼 제거) -->
                <div class="d-flex align-center justify-space-between mt-2">
                  <div class="d-flex align-center">
                    <v-btn
                      icon
                      variant="text"
                      :color="post.isLiked ? 'orange-darken-2' : 'orange-lighten-1'"
                      @click.stop="toggleLike(post)"
                      class="like-btn mr-2"
                    >
                      <v-icon size="28" class="like-icon">
                        {{ post.isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
                      </v-icon>
                    </v-btn>
                    <span
                      class="text-subtitle-2 font-weight-medium"
                      :class="post.isLiked ? 'text-orange-darken-2' : 'text-orange-lighten-1'"
                    >
                      {{ post.likes }}
                    </span>
                  </div>
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
    // 페이지가 처음 로드될 때 좋아요 상태를 포함하여 게시글 로드
    await this.loadPosts({ done: () => {} });
  },
  methods: {
    async loadPosts({ done }) {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;

      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post/postList`,
          {
            params: { page: this.page, size: this.size },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );

        const newPosts = response.data.content;
        if (newPosts.length === 0) {
          this.isLastPage = true;
          done("empty");
        } else {
          this.posts.push(...newPosts);
          this.page++;

          // 각 게시글의 좋아요 여부 가져오기 (데이터 로드 직후 실행)
          await Promise.all(this.posts.map((post) => this.fetchLikeData(post)));

          done("ok");
        }
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
        done("error");
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

        // 좋아요 상태 즉시 업데이트
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
  position: relative;
  height: 300px;
  margin-bottom: 4rem;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80');
  background-size: cover;
  background-position: center;
  transform: scale(1.1);
  filter: blur(3px);
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4));
}

.header-content {
  position: relative;
  height: 100%;
  z-index: 2;
}

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  color: white;
  font-size: 3rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.header-subtitle {
  color: white;
  font-size: 1.25rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.content-container {
  margin-top: 2rem;
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
  margin-bottom: 4rem !important;
}

.post-card:last-child {
  margin-bottom: 2rem !important;
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

/* 작성자 정보 스타일 */
.post-user-info {
  align-items: center;
  padding: 12px 16px;
}
.post-user-name {
  font-size: 1rem;
  font-weight: 500;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .header-section {
    height: 250px;
    margin-bottom: 3rem;
  }

  .header-inner {
    padding: 1.5rem !important;
  }

  .header-title {
    font-size: 2.2rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .content-container {
    margin-top: 1.5rem;
  }

  .post-card {
    margin-bottom: 3rem !important;
  }

  .post-card:last-child {
    margin-bottom: 1.5rem !important;
  }
}
</style>
