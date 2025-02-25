<template>
  <v-container fluid class="py-6">
    <v-row justify="space-between" class="mx-4">
      <!-- 왼쪽 광고 배너 -->
      <v-col cols="2" class="d-none d-lg-block pl-4">
        <div class="ad-banner">
          <v-img
            :src="require('@/assets/advertisement1.webp')"
            height="800"
            class="rounded-lg ad-image"
            cover
          ></v-img>
        </div>
      </v-col>

      <!-- 중앙 피드 -->
      <v-col cols="12" lg="6">
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
            <!-- 작성자 정보: 프로필과 닉네임은 좌측, 작성일은 닉네임 아래에 작게 표시 -->
            <v-card-title class="post-user-info pa-4">
              <div class="d-flex align-center">
                <v-avatar size="40" class="mr-3">
                  <v-img :src="post.userProfile" alt="프로필" />
                </v-avatar>
                <div class="user-info">
                  <span class="post-user-name">{{ post.userNickName }}</span>
                  <span class="post-created-time">{{ formatDate(post.createdTime) }}</span>
                </div>
              </div>
            </v-card-title>

            <!-- 게시글 이미지 -->
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

              <!-- 태그 -->
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

              <!-- 좋아요 및 기타 버튼 -->
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

      <!-- 오른쪽 광고 배너 -->
      <v-col cols="2" class="d-none d-lg-block pr-4">
        <div class="ad-banner">
          <v-img
            :src="require('@/assets/advertisement2.webp')"
            height="800"
            class="rounded-lg ad-image"
            cover
          ></v-img>
        </div>
      </v-col>
    </v-row>
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
      if (!post.postId) return;
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
      if (!post.postId) return;
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
        await this.fetchLikeData(post);
      } catch (error) {
        console.error("좋아요 토글 실패:", error);
      }
    },
    goToPostDetail(postId) {
      this.$router.push({ name: "UserPostDetail", params: { postId } });
    },
    // createdTime이 일주일 이내이면 "x일 전", 그 외는 "YYYY년 M월 D일" 형식으로 반환
    formatDate(createdTime) {
      if (!createdTime) return "";
      const now = new Date();
      const created = new Date(createdTime);
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        return diffDays === 0 ? "오늘" : `${diffDays}일 전`;
      } else {
        return `${created.getFullYear()}년 ${created.getMonth() + 1}월 ${created.getDate()}일`;
      }
    }
  }
};
</script>

<style scoped>
.ad-banner {
  position: sticky;
  top: 20px;
  width: 100%;
}

.ad-image {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.post-container {
  background-color: #fafafa;
  min-height: 100vh;
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

.user-info {
  display: flex;
  flex-direction: column;
}

.post-user-name {
  font-size: 1rem;
  font-weight: 500;
}

.post-created-time {
  font-size: 0.75rem;
  color: #888;
}

/* 스크롤바 숨기기 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 헤더 섹션 */
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

/* 반응형 디자인 (모바일 고려 안함) */
</style>
