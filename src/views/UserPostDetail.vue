<template>
  <v-app>
    <div v-if="loading">
      <!-- 데이터 로드 중일 때 로딩 스피너 표시 -->
      <v-main>
        <v-container class="fill-height">
          <v-row align="center" justify="center">
            <v-progress-circular indeterminate color="primary" />
          </v-row>
        </v-container>
      </v-main>
    </div>
    <div v-else>
      <!-- 데이터가 모두 로드된 후 화면 렌더링 -->
      <v-main class="post-detail-bg">
        <v-container class="py-8">
          <v-card class="post-detail-card mx-auto" elevation="6" max-width="800">
            <!-- 작성자 정보 (로컬스토리지 사용) -->
            <div class="post-header pa-4">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-avatar size="40" class="mr-3">
                    <v-img :src="localUserProfile" />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ localUserName }}</h3>
                    <span class="text-caption text-medium-emphasis">{{ postDetail.createdAt }}</span>
                  </div>
                </div>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" variant="text" class="menu-btn">
                      <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="reportPost">
                      <template v-slot:prepend>
                        <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
                      </template>
                      <v-list-item-title class="text-error">신고하기</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <v-divider></v-divider>

            <!-- 이미지 캐러셀 -->
            <div class="post-images">
              <v-carousel
                v-if="postDetail.postPhotos && postDetail.postPhotos.length > 0"
                hide-delimiter-background
                show-arrows="hover"
                height="500"
              >
                <v-carousel-item
                  v-for="(photo, idx) in postDetail.postPhotos"
                  :key="idx"
                  :src="photo"
                  cover
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height" align="center" justify="center">
                      <v-progress-circular indeterminate color="primary" />
                    </v-row>
                  </template>
                </v-carousel-item>
              </v-carousel>
            </div>

            <v-divider></v-divider>

            <!-- 게시글 내용 -->
            <v-card-text class="post-content pa-6">
              <div class="content-text mb-6">
                {{ postDetail.contents }}
              </div>

              <!-- 해시태그 -->
              <div class="post-tags mb-6" v-if="postDetail.tags && postDetail.tags.length > 0">
                <v-chip
                  v-for="(tag, idx) in postDetail.tags"
                  :key="idx"
                  class="mr-2 mb-2"
                  color="primary"
                  variant="flat"
                  size="small"
                >
                  #{{ tag }}
                </v-chip>
              </div>

              <!-- 좋아요 & 상호작용 -->
              <div class="post-actions">
                <div class="d-flex align-center">
                  <v-btn
                    icon
                    variant="text"
                    :color="isLiked ? 'error' : 'default'"
                    class="like-btn mr-2"
                    @click="toggleLike"
                  >
                    <v-icon :class="{ 'heart-active': isLiked }">
                      {{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
                    </v-icon>
                  </v-btn>
                  <span class="text-body-2">{{ postDetail.likes }}</span>
                </div>
                <v-btn variant="text" prepend-icon="mdi-comment-outline" class="interaction-btn">
                  댓글 {{ postDetail.commentCount || comments.length }}
                </v-btn>
                <v-btn variant="text" prepend-icon="mdi-share-variant-outline" class="interaction-btn">
                  공유하기
                </v-btn>
              </div>

              <!-- 댓글 섹션 -->
              <v-divider class="my-4"></v-divider>
              <div v-if="comments.length > 0" class="comments-section mt-4">
                <v-list class="comment-list">
                  <v-list-item
                    v-for="(comment, idx) in comments"
                    :key="idx"
                    class="comment-item mb-3"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="36" class="mr-3">
                        <v-img :src="comment.userProfile || placeholderProfile" />
                      </v-avatar>
                    </template>
                    <v-list-item-content>
                      <div class="comment-content">
                        <span class="font-weight-medium comment-author">{{ comment.userNickname }}</span>
                        <span class="comment-text ml-2">{{ comment.contents }}</span>
                      </div>
                      <span class="text-caption text-medium-emphasis mt-1">
                        {{ comment.createdAt || '방금 전' }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>

              <!-- 댓글 입력 (디자인 그대로 유지) -->
              <div class="comment-input-section" :class="{ 'mt-4': comments.length > 0 }">
                <v-row no-gutters align="center">
                  <v-col cols="12">
                    <v-text-field
                      v-model="newComment"
                      placeholder="댓글을 입력하세요..."
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      class="comment-input"
                      @keyup.enter="submitComment"
                    >
                      <template v-slot:append-inner>
                        <v-btn
                          icon
                          variant="text"
                          size="small"
                          color="primary"
                          class="submit-icon-btn"
                          @click="submitComment"
                          :disabled="!newComment.trim()"
                        >
                          <v-icon>mdi-send</v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-container>
      </v-main>
    </div>
  </v-app>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      postDetail: {
        contents: "",
        likes: 0,
        tags: [],
        postPhotos: [],
        createdAt: "",
        commentCount: 0
      },
      comments: [],
      newComment: "",
      isLiked: null, // 서버에서 받아온 좋아요 상태
      placeholderProfile: "https://via.placeholder.com/40"
    };
  },
  computed: {
    localUserName() {
      return localStorage.getItem("userName") || "";
    },
    localUserProfile() {
      return localStorage.getItem("profilePhoto") || "https://cdn.vuetifyjs.com/images/john.jpg";
    }
  },
  created() {
    this.initializePage();
  },
  methods: {
    async initializePage() {
      try {
        await this.fetchPostDetail();
        await this.fetchComments();
      } catch (error) {
        console.error("페이지 초기화 실패:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchPostDetail() {
      const postId = this.$route.params.postId;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post/postDetail/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        this.postDetail = response.data;
        if (!this.postDetail.createdAt) {
          this.postDetail.createdAt = new Date().toLocaleDateString();
        }
        // 좋아요 데이터 가져오기
        await this.fetchLikeData();
      } catch (error) {
        console.error("게시글 상세 정보 로드 실패:", error);
      }
    },
    // /getLike/{postId} 엔드포인트를 호출하여 좋아요 데이터 업데이트
    async fetchLikeData() {
      const postId = this.$route.params.postId;
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/getLike/${postId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        console.log(response.data);
        this.isLiked = response.data.liked;
        this.postDetail.likes = response.data.likes;
        console.log(this.isLiked);
      } catch (error) {
        console.error("좋아요 데이터 조회 실패:", error);
      }
    },
    // 좋아요 버튼 클릭 시 /postLike/{postId} 호출 후, 최신 상태 업데이트
    async toggleLike() {
      const postId = this.$route.params.postId;
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/postLike/${postId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        await this.fetchLikeData();
      } catch (error) {
        console.error("좋아요 토글 실패:", error);
      }
    },
    async fetchComments() {
      const postId = this.$route.params.postId;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post/getComments/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        this.comments = response.data;
      } catch (error) {
        console.error("댓글 로드 실패:", error);
      }
    },
    async submitComment() {
      if (!this.newComment.trim()) return;
      const postId = this.$route.params.postId;
      try {
        const formData = new FormData();
        formData.append("contents", this.newComment);
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/comment/${postId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        this.newComment = "";
        await this.fetchComments();
      } catch (error) {
        console.error("댓글 등록 실패:", error);
      }
    },
    reportPost() {
      alert("신고가 접수되었습니다.");
    }
  }
};
</script>

<style scoped>
.post-detail-bg {
  background: linear-gradient(135deg, #fff3e0 0%, #ffab91 100%);
  min-height: 100vh;
}
.post-detail-card {
  max-width: 800px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(255, 87, 34, 0.1);
}
.post-header {
  background: white;
  border-bottom: 1px solid rgba(255, 87, 34, 0.1);
}
.post-images {
  background: #fff8f6;
}
.post-images :deep(.v-carousel) {
  box-shadow: 0 4px 12px rgba(255, 87, 34, 0.1);
}
.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #37474f;
  white-space: pre-wrap;
}
.post-tags {
  display: flex;
  flex-wrap: wrap;
}
.post-tags .v-chip {
  background: #fff3e0 !important;
  color: #f4511e !important;
  font-weight: 500;
}
.post-actions {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 87, 34, 0.1);
  align-items: center;
}
.interaction-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  color: #ff5722 !important;
}
.interaction-btn:hover {
  background: #fff3e0 !important;
}
:deep(.v-btn--variant-text) {
  color: #ff5722 !important;
}
:deep(.v-carousel .v-btn--icon) {
  background: rgba(255, 87, 34, 0.1);
  color: #ff5722;
}
:deep(.v-carousel .v-btn--icon:hover) {
  background: rgba(255, 87, 34, 0.2);
}
.comments-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 87, 34, 0.1);
}
.comment-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0;
}
.comment-item {
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.comment-item:hover {
  background-color: #fff3e0;
}
.comment-content {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}
.comment-author {
  color: #333;
  font-size: 0.95rem;
}
.comment-text {
  color: #555;
  font-size: 0.95rem;
  word-break: break-word;
}
.comment-input-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 87, 34, 0.1);
}
.comment-input {
  background-color: #fff8f6;
}
.comment-input :deep(.v-field__outline__start),
.comment-input :deep(.v-field__outline__end) {
  border-color: rgba(255, 87, 34, 0.2) !important;
}
.comment-input :deep(.v-field--focused .v-field__outline__start),
.comment-input :deep(.v-field--focused .v-field__outline__end) {
  border-color: #ff5722 !important;
}
.submit-icon-btn {
  color: #ff5722 !important;
}
.submit-icon-btn:hover {
  background-color: #fff3e0 !important;
}
:deep(.v-text-field .v-input__details) {
  display: none;
}
.like-btn {
  transition: transform 0.2s;
}
.like-btn:active {
  transform: scale(1.2);
}
.heart-active {
  animation: heart-burst 0.45s cubic-bezier(0.17, 0.89, 0.32, 1.49);
}
@keyframes heart-burst {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}
</style>
