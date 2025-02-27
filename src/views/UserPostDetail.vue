<template>
  <v-app @click="closeContextMenu">
    <div v-if="loading">
      <!-- 로딩 중 -->
      <v-main>
        <v-container class="fill-height">
          <v-row align="center" justify="center">
            <v-progress-circular indeterminate color="primary" />
          </v-row>
        </v-container>
      </v-main>
    </div>
    <div v-else>
      <!-- 데이터 로드 후 화면 -->
      <v-main class="post-detail-bg">
        <v-container class="py-6">
          <v-card class="post-detail-card mx-auto" elevation="6" max-width="600">
            <!-- 작성자 정보 -->
            <div class="post-header pa-4">
              <div class="d-flex align-center justify-space-between">
                <!-- 프로필/닉네임 클릭 시 해당 유저 페이지로 이동 -->
                <div class="d-flex align-center" @click="goToUserPage" style="cursor:pointer">
                  <v-avatar size="40" class="mr-3">
                    <v-img :src="postDetail.userProfile || placeholderProfile" />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold mb-1">
                      {{ postDetail.userNickName }}
                    </h3>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatDate(postDetail.createdTime) }}
                    </span>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <!-- 로그인한 유저와 작성자가 같지 않으면 팔로우 버튼 -->
                  <v-btn 
                    v-if="loginUserNickName !== postDetail.userNickName && !iBlockedOwner"
                    :color="isFollowing ? 'grey-lighten-3' : 'orange-darken-2'" 
                    :class="[ isFollowing ? 'grey-text' : 'white-text' ]"
                    class="mr-3"
                    @click="toggleFollow"
                  >
                    {{ isFollowing ? "팔로우 취소" : "팔로우" }}
                  </v-btn>
                  <!-- 게시글 메뉴 (게시글 삭제/신고) -->
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn icon v-bind="props" variant="text" class="menu-btn">
                        <v-icon>mdi-dots-horizontal</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-if="loginUserNickName === postDetail.userNickName" @click="deletePost">
                        <template v-slot:prepend>
                          <v-icon color="error" class="mr-2">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title class="text-error">게시글 삭제</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-else @click="reportUser">
                        <template v-slot:prepend>
                          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
                        </template>
                        <v-list-item-title class="text-error">신고하기</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </div>

            <v-divider></v-divider>

            <!-- 이미지 캐러셀 -->
            <div class="post-images">
              <v-carousel
                v-if="postDetail.postPhotos && postDetail.postPhotos.length > 0"
                hide-delimiter-background
                show-arrows="hover"
                height="400"
              >
                <v-carousel-item
                  v-for="photo in postDetail.postPhotos"
                  :key="photo"
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
              <!-- 좋아요 및 상호작용 -->
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
                <v-btn 
                  variant="text" 
                  prepend-icon="mdi-comment-outline" 
                  class="interaction-btn"
                  @click="toggleComments"
                >
                  댓글 {{ postDetail.commentCount || comments.length }}
                </v-btn>
              </div>

              <!-- 댓글 섹션 -->
              <v-expand-transition>
                <div v-show="showComments">
                  <v-divider class="my-4"></v-divider>
                  <div v-if="comments.length > 0" class="comments-section mt-4">
                    <v-list class="comment-list">
                      <v-list-item
                        v-for="comment in comments"
                        :key="comment.id"
                        class="comment-item mb-3"
                        @contextmenu.prevent="openContextMenu($event, comment)"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="36" class="mr-3">
                            <v-img :src="comment.userProfile || placeholderProfile" />
                          </v-avatar>
                        </template>
                        <v-list-item-content>
                          <div class="comment-content">
                            <span class="font-weight-medium comment-author">
                              {{ comment.userNickname }}
                            </span>
                            <template v-if="editingCommentId === comment.id">
                              <!-- 수정 모드: 댓글 아래에 펼쳐지는 텍스트 필드 -->
                              <v-text-field 
                                v-model="editingCommentContent"
                                dense
                                hide-details
                                variant="filled"
                                class="edit-input"
                                placeholder="수정할 내용을 입력하세요..."
                              />
                              <div class="edit-buttons">
                                <v-btn small class="edit-btn" @click="saveUpdatedComment(comment.id)">
                                  저장
                                </v-btn>
                                <v-btn small text class="cancel-btn" @click="cancelEdit">
                                  취소
                                </v-btn>
                              </div>
                            </template>
                            <template v-else>
                              <span class="comment-text ml-2">
                                {{ comment.contents }}
                              </span>
                            </template>
                          </div>
                          <div class="update-row">
                            <span class="text-caption text-medium-emphasis">
                              {{ formatTime(comment.updatedTime) }}
                            </span>
                          </div>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </div>
                  <!-- 댓글 입력 -->
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
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-container>
      </v-main>
    </div>

    <!-- 컨텍스트 메뉴: 내 댓글에 우클릭 시 표시 -->
    <div
      v-if="contextMenu.visible"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="context-menu"
      @click.stop
    >
      <v-list>
        <v-list-item @click="startEdit(contextMenu.comment)">
          <v-list-item-title>수정</v-list-item-title>
        </v-list-item>
        <v-list-item @click="confirmDeleteComment(contextMenu.comment.id)">
          <v-list-item-title class="text-error">삭제</v-list-item-title>
        </v-list-item>
      </v-list>
    </div>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      isFromMyPage: false,
      loading: true,
      postDetail: {
        contents: "",
        likes: 0,
        tags: [],
        postPhotos: [],
        createdAt: "",
        commentCount: 0,
        userNickName: "",
        userProfile: ""
      },
      comments: [],
      newComment: "",
      isLiked: null,
      isFollowing: false,
      placeholderProfile: "https://via.placeholder.com/40",
      loginUserNickName: "",
      showComments: false,
      editingCommentId: null,
      editingCommentContent: "",
      // 컨텍스트 메뉴 상태
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        comment: null
      }
    };
  },
  created() {
    this.isFromMyPage = this.$route.query.from === "mypage";
    this.initializePage();
    this.fetchUserInfo();
  },
  methods: {
    reportUser() {
      this.$router.push({
        path: '/report/create',
        query: { reportedNickName: this.postDetail.userNickName }
      });
    },
    async initializePage() {
      try {
        await this.fetchPostDetail();
        await this.fetchWriterInfo();
        await this.fetchComments();
        await this.fetchFollowStatus();
      } catch (error) {
        console.error("페이지 초기화 실패:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchUserInfo() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/userInfo`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
          }
        );
        this.loginUserNickName = response.data.userNickName;
      } catch (error) {
        console.error("로그인 유저 정보 조회 실패:", error);
      }
    },
    async fetchPostDetail() {
      const postId = this.$route.params.postId;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post/postDetail/${postId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
          }
        );
        this.postDetail = { ...this.postDetail, ...response.data };
        if (!this.postDetail.createdAt) {
          this.postDetail.createdAt = new Date().toLocaleDateString();
        }
        await this.fetchLikeData();
      } catch (error) {
        console.error("게시글 상세 정보 로드 실패:", error);
      }
    },
    async fetchWriterInfo() {
      const postId = this.$route.params.postId;
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/writerInfo/${postId}`,
          null,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
        const writerInfo = response.data;
        this.postDetail.userNickName = writerInfo.userNickName;
        this.postDetail.userProfile = writerInfo.userProfile;
      } catch (error) {
        console.error("작성자 정보 조회 실패:", error);
      }
    },
    async fetchLikeData() {
      const postId = this.$route.params.postId;
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/getLike/${postId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
        this.isLiked = response.data.liked;
        this.postDetail.likes = response.data.likes;
      } catch (error) {
        console.error("좋아요 데이터 조회 실패:", error);
      }
    },
    async toggleLike() {
      const postId = this.$route.params.postId;
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/postLike/${postId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
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
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
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
    deletePost() {
      const postId = this.$route.params.postId;
      if (!confirm("정말 게시글을 삭제하시겠습니까?")) return;
      axios
        .patch(`${process.env.VUE_APP_API_BASE_URL}/post/delete/${postId}`, null, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        })
        .then(() => {
          alert("게시글이 삭제되었습니다.");
          this.$router.go(-1);
        })
        .catch(error => {
          console.error("게시글 삭제 실패:", error);
          alert("게시글 삭제에 실패했습니다.");
        });
    },
    async toggleFollow() {
      const previousState = this.isFollowing;
      this.isFollowing = !this.isFollowing;
      try {
        const payload = { nickName: this.postDetail.userNickName };
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/follow`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        const result = response.data;
        if (result === "팔로우가 취소되었습니다.") {
          this.isFollowing = false;
          alert("팔로우가 취소되었습니다.");
        } else if (result === "ok") {
          this.isFollowing = true;
          alert("팔로우하였습니다.");
        } else {
          console.log("응답:", result);
        }
      } catch (error) {
        this.isFollowing = previousState;
        console.error("팔로우 요청 실패:", error);
      }
    },
    async fetchFollowStatus() {
      try {
        const formData = new FormData();
        formData.append("userNickName", this.postDetail.userNickName);
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/isFollowing`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        this.isFollowing = response.data;
      } catch (error) {
        console.error("팔로우 상태 조회 실패:", error);
      }
    },
    goToUserPage() {
      if (this.loginUserNickName === this.postDetail.userNickName) {
        this.$router.push({ path: "/user/mypage" });
      } else {
        this.$router.push({ path: "/user/yourpage", query: { nickName: this.postDetail.userNickName } });
      }
    },
    toggleComments() {
      this.showComments = !this.showComments;
      if (this.showComments && !this.comments.length) {
        this.fetchComments();
      }
    },
    // 댓글 수정 관련 메서드
    startEdit(comment) {
      this.editingCommentId = comment.id;
      this.editingCommentContent = comment.contents;
      this.closeContextMenu();
    },
    cancelEdit() {
      this.editingCommentId = null;
      this.editingCommentContent = "";
    },
    async saveUpdatedComment(commentId) {
      if (!this.editingCommentContent.trim()) return;
      try {
        const payload = { commentId, contents: this.editingCommentContent };
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/updateComment`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
        const updatedComment = response.data;
        const index = this.comments.findIndex(c => c.id === commentId);
        if (index !== -1) {
          this.comments.splice(index, 1, updatedComment);
        }
        this.cancelEdit();
      } catch (error) {
        console.error("댓글 수정 실패:", error);
      }
    },
    // 댓글 삭제 메서드
    async confirmDeleteComment(commentId) {
      if (confirm("정말 댓글을 삭제하시겠습니까?")) {
        try {
          const payload = { commentId };
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/post/deleteComment`,
            payload,
            { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
          );
          alert(response.data);
          this.comments = this.comments.filter(comment => comment.id !== commentId);
          this.closeContextMenu();
        } catch (error) {
          console.error("댓글 삭제 실패:", error);
        }
      }
    },
    // createdTime이 일주일 이내이면 "x일 전", 그 이상이면 "YYYY년 M월 D일" 형식으로 반환
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
    },
    // 기존 formatTime 메서 (댓글 수정 시 업데이트된 시간 표시용)
    formatTime(timeStr) {
      const now = new Date();
      const commentTime = new Date(timeStr);
      const diffMs = now - commentTime;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "방금 전";
      if (diffMins < 60) return `${diffMins}분 전`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}시간 전`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}일 전`;
    },
    // 컨텍스트 메뉴 열기 (우클릭 이벤트)
    openContextMenu(e, comment) {
      if (this.loginUserNickName !== comment.userNickname) return;
      this.contextMenu.visible = true;
      this.contextMenu.x = e.clientX;
      this.contextMenu.y = e.clientY;
      this.contextMenu.comment = comment;
    },
    closeContextMenu() {
      this.contextMenu.visible = false;
      this.contextMenu.comment = null;
    }
  },
  mounted() {
    window.scrollTo(0, 0);
  }
};
</script>

<style scoped>
.post-detail-bg {
  background: linear-gradient(135deg, #fff3e0 0%, #ffab91 100%);
  min-height: 100vh;
}
.post-detail-card {
  max-width: 600px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(255, 87, 34, 0.1);
}
.post-header {
  background: white;
  border-bottom: 1px solid rgba(255, 87, 34, 0.1);
  padding: 16px !important;
}
.post-images {
  background: #fff8f6;
}
.post-images :deep(.v-carousel) {
  box-shadow: 0 4px 12px rgba(255, 87, 34, 0.1);
  height: 400px !important;
}
.content-text {
  font-size: 1rem;
  line-height: 1.6;
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
.edit-input {
  max-width: 80%;
  margin-top: 4px;
  background-color: transparent !important;
  box-shadow: none !important;
  border-radius: 0;
  padding: 0;
}
.edit-input .v-field__outline {
  border-bottom: 2px solid #FFB74D !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}
.edit-input .v-field--focused .v-field__outline {
  border-bottom: 2px solid #FFB74D !important;
  box-shadow: none !important;
}
.edit-buttons {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.edit-btn {
  background: linear-gradient(90deg, #ff9800, #f57c00);
  color: white !important;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.8rem;
  text-transform: none;
  transition: opacity 0.2s ease;
}
.edit-btn:hover {
  opacity: 0.9;
}
.cancel-btn {
  color: #f57c00;
  font-size: 0.8rem;
  text-transform: none;
  border: 1px solid #f57c00;
  border-radius: 20px;
  padding: 4px 12px;
  transition: background 0.2s ease, color 0.2s ease;
}
.cancel-btn:hover {
  background: #f57c00;
  color: white !important;
}
.update-row {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #888;
}
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
.context-menu .v-list {
  padding: 0;
}
.context-menu .v-list-item {
  cursor: pointer;
}
.context-menu .v-list-item:hover {
  background-color: #f5f5f5;
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
  0% { transform: scale(0); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}
.follow-btn {
  min-width: 80px;
  height: 32px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.3px;
  border-radius: 16px;
  transition: all 0.3s ease;
}
.follow-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.grey-text {
  color: rgba(0, 0, 0, 0.6) !important;
}
.white-text {
  color: white !important;
}
@media (max-width: 600px) {
  .post-detail-card {
    margin: 0 12px;
  }
  .post-images :deep(.v-carousel) {
    height: 300px !important;
  }
  .post-header {
    padding: 12px !important;
  }
  .post-content {
    padding: 16px !important;
  }
  .comment-menu-btn {
    min-width: 0;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }
  .comment-menu-btn .v-icon {
    font-size: 20px;
    color: #555;
  }
  .comment-menu-content {
    position: absolute !important;
    margin-top: 4px;
    z-index: 10;
  }
}
</style>
