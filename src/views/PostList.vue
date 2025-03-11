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

      <!-- 중앙 피드 영역 -->
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
            <!-- 작성자 정보 -->
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

      <!-- 오른쪽 인플루언서 랭킹 영역 -->
      <v-col cols="auto" lg="auto" class="d-none d-lg-block pr-4" style="min-width: 280px; max-width: 350px;">
        <div class="ranking-container">
          <v-card class="influencer-ranking">
            <!-- 헤더 부분 -->
            <div class="ranking-header pa-4 text-center">
              <div class="d-flex align-center justify-center">
                <v-icon color="amber-darken-2" size="24" class="mr-2">mdi-crown</v-icon>
                <span class="text-h6">인플루언서 랭킹</span>
              </div>
            </div>

            <!-- 랭킹 리스트 -->
            <div class="ranking-list pa-2">
              <div
                v-for="(user, index) in influencerRanking"
                :key="user.userId"
                class="ranking-item mb-2 pa-2"
                @click="goToUserPage(user)"
              >
                <div class="d-flex align-center justify-center">
                  <!-- 순위 표시 -->
                  <div class="rank-wrapper mr-2">
                    <div class="rank-number" :class="{
                      'rank-gold': index === 0,
                      'rank-silver': index === 1,
                      'rank-bronze': index === 2,
                      'rank-four': index === 3,
                      'rank-five': index === 4,
                      'rank-normal': index > 4
                    }">
                      {{ index + 1 }}
                    </div>
                  </div>

                  <!-- 프로필 이미지와 사용자 정보 -->
                  <div class="profile-container d-flex align-center">
                    <v-avatar size="36" class="mr-2">
                      <v-img :src="user.profileImage" cover />
                    </v-avatar>

                    <div class="user-info">
                      <div class="text-subtitle-2 font-weight-medium text-truncate mb-0">
                        {{ user.nickname }}
                      </div>
                      <div class="text-caption text-grey">
                        팔로워 {{ user.followersCount }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "PostList",
  data() {
    return {
      posts: [],           // 게시글 목록
      page: 0,             // 현재 페이지 번호
      size: 5,             // 한 번에 불러올 게시글 수
      isLastPage: false,   // 마지막 페이지 여부
      isLoading: false,    // 로딩 상태
      influencerRanking: [], // 인플루언서 랭킹 데이터
      loginUserNickName: "", // 로그인한 유저의 닉네임 (서버에서 받아옴)
      blockedList: []
    };
  },
  async created() {
    // 로그인한 유저 정보를 먼저 받아와서 loginUserNickName에 저장
    await this.fetchLoginUserInfo();
    await this.fetchBlockedList();
    await this.loadPosts({ done: () => {} });
    this.loadInfluencers();
  },
  methods: {
    async fetchLoginUserInfo() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/userInfo`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        // response.data에 userNickName이 포함되어 있다고 가정
        this.loginUserNickName = response.data.userNickName;
      } catch (error) {
        console.error("로그인 유저 정보 불러오기 실패:", error);
      }
    },
    async fetchBlockedList() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/blockedList`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        this.blockedList = response.data;
      } catch (error) {
        console.error("차단 목록 로드 실패:", error);
      }
    },
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
        let newPosts = response.data.content;
        
        // 차단한 유저의 닉네임 배열 생성
        const blockedNicknames = this.blockedList.map(user => user.userNickName);
        // blockedNicknames에 포함되지 않은 게시글만 필터링
        newPosts = newPosts.filter(post => !blockedNicknames.includes(post.userNickName));
        
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
    // 인플루언서 랭킹 클릭 시, 로그인한 유저의 닉네임과 비교하여 라우팅 처리
    goToUserPage(user) {
      if (user.nickname === this.loginUserNickName) {
        // 로그인한 유저와 인플루언서의 닉네임이 같으면 마이페이지로 이동
        this.$router.push("/user/MyPage");
      } else {
        // 다르면 타 유저 페이지로 이동 (쿼리 파라미터로 닉네임 전달)
        this.$router.push({ path: "/user/yourPage", query: { nickName: user.nickname } });
      }
    },
    // 날짜 형식: 일주일 이내면 "x일 전", 그 이상이면 "YYYY년 M월 D일" 형태로 표시
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
    async loadInfluencers() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/top-influencers`, {
          params: { limit: 5 }
        });
        this.influencerRanking = response.data;
      } catch (error) {
        console.error("인플루언서 불러오기 실패:", error);
      }
    }
  }
};
</script>

<style scoped>
/* 광고 배너 및 랭킹 영역 스타일 */
.ranking-container,
.ad-banner {
  position: sticky;
  top: 84px;
  height: fit-content;
  padding-top: 16px;
  margin-top: -16px;
  background: transparent;
  z-index: 1;
}

/* 인플루언서 랭킹 카드 스타일 */
.influencer-ranking {
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

/* 광고 이미지 스타일 */
.ad-image {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

/* 피드 영역 */
.post-list {}

/* 게시글 카드 스타일 */
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

/* 게시글 내용 스타일 */
.post-content {
  line-height: 1.6;
  color: #333;
  font-size: 1.1rem;
}

/* 좋아요 버튼 애니메이션 */
.like-btn {
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.like-btn:hover {
  transform: scale(1.2);
}

/* 사용자 정보 */
.user-info {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.post-user-name {
  font-size: 1rem;
  font-weight: 500;
}

.post-created-time {
  font-size: 0.75rem;
  color: #888;
}

/* 스크롤바 숨김 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 랭킹 리스트 스크롤바 스타일 */
.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  width: 100%;
  padding: 8px 12px;
  text-align: center;
}

.profile-container {
  flex: 1;
  justify-content: flex-start;
  padding-left: 4px;
}

.text-truncate {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-wrapper {
  margin-right: 12px;
}

.rank-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.rank-gold {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 160, 0, 0.3);
  border: 2px solid #FFD700;
}

.rank-silver {
  background: linear-gradient(135deg, #E8E8E8, #B0B0B0);
  color: white;
  box-shadow: 0 4px 12px rgba(176, 176, 176, 0.3);
  border: 2px solid #E8E8E8;
}

.rank-bronze {
  background: linear-gradient(135deg, #CD7F32, #A0522D);
  color: white;
  box-shadow: 0 4px 12px rgba(160, 82, 45, 0.3);
  border: 2px solid #CD7F32;
}

.rank-four {
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  color: white;
  box-shadow: 0 4px 12px rgba(53, 122, 189, 0.3);
  border: 2px solid #4A90E2;
}

.rank-five {
  background: linear-gradient(135deg, #9B59B6, #8E44AD);
  color: white;
  box-shadow: 0 4px 12px rgba(142, 68, 173, 0.3);
  border: 2px solid #9B59B6;
}

.rank-normal {
  background: #F5F5F5;
  color: #757575;
  border: 2px solid #EEEEEE;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.ranking-item:hover .rank-number {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* 랭킹 리스트 스크롤바 커스터마이징 */
.ranking-list::-webkit-scrollbar {
  width: 6px;
}

.ranking-list::-webkit-scrollbar-track {
  background: transparent;
}

.ranking-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.ranking-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

.ranking-header {
  background: linear-gradient(to right, #FFF8E1, #FFECB3);
  border-bottom: 1px solid #FFE0B2;
  text-align: center;
}
</style>
