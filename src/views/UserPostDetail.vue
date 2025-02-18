<template>
  <v-app>
    <v-main class="post-detail-bg">
      <v-container class="py-8">
        <v-card class="post-detail-card mx-auto" elevation="6">
          <!-- 작성자 정보 -->
          <div class="post-header pa-4">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar size="40" class="mr-3">
                  <v-img :src="postDetail.userProfile || 'https://cdn.vuetifyjs.com/images/john.jpg'" />
                </v-avatar>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ postDetail.userName }}</h3>
                  <span class="text-caption text-medium-emphasis">{{ postDetail.createdAt }}</span>
                </div>
              </div>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    v-bind="props"
                    variant="text"
                    class="menu-btn"
                  >
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
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </v-row>
                </template>
              </v-carousel-item>
            </v-carousel>
          </div>

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
              <v-btn
                variant="text"
                :color="isLiked ? 'error' : 'default'"
                prepend-icon="mdi-heart"
                class="interaction-btn"
                @click="toggleLike"
              >
                좋아요 {{ postDetail.likes }}
              </v-btn>
              <v-btn
                variant="text"
                prepend-icon="mdi-comment-outline"
                class="interaction-btn"
              >
                댓글 {{ postDetail.commentCount || 0 }}
              </v-btn>
              <v-btn
                variant="text"
                prepend-icon="mdi-share-variant-outline"
                class="interaction-btn"
              >
                공유하기
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

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

.interaction-btn.liked {
  color: #ff5722 !important;
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

/* 반응형 스타일 */
@media (max-width: 600px) {
  .post-detail-card {
    margin: 0;
    border-radius: 0;
  }

  .post-images :deep(.v-carousel) {
    height: 400px !important;
  }

  .content-text {
    font-size: 1rem;
  }

  .post-actions {
    flex-wrap: wrap;
  }
}

.menu-btn {
  color: #ff5722 !important;
}

.menu-btn:hover {
  background-color: #fff3e0 !important;
}

:deep(.v-list-item--density-default) {
  min-height: 40px;
}

:deep(.v-list-item-title) {
  font-size: 0.9rem;
}
</style>

<script>
import axios from "axios";
export default {
  data() {
    return {
      postDetail: {
        contents: "",
        likes: 0,
        tags: [],
        postPhotos: [],
        userName: localStorage.getItem("userName") || "",
        userProfile: localStorage.getItem("profilePhoto") || "https://cdn.vuetifyjs.com/images/john.jpg",
        createdAt: new Date().toLocaleDateString()
      },
      isLiked: false
    };
  },
  created() {
    this.fetchPostDetail();
  },
  methods: {
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
        this.postDetail = {
          ...response.data,
          userName: localStorage.getItem("userName") || response.data.userName,
          userProfile: localStorage.getItem("profilePhoto") || response.data.userProfile || "https://cdn.vuetifyjs.com/images/john.jpg"
        };
      } catch (error) {
        console.error("게시글 상세 정보 로드 실패:", error);
      }
    },
    toggleLike() {
      this.isLiked = !this.isLiked;
      // TODO: 좋아요 API 연동
    },
    reportPost() {
      alert('신고가 접수되었습니다.'); // 임시 알림
    }
  }
};
</script>
