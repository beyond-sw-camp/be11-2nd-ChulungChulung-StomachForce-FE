<template>
  <v-app>
    <!-- 상단 앱바 -->
    <v-app-bar app color="white" flat>
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="editProfile">
            <v-list-item-title>내 정보 수정</v-list-item-title>
          </v-list-item>
          <v-list-item @click="goToMileage">
            <v-list-item-title>마일리지 내역</v-list-item-title>
          </v-list-item>
          <v-list-item @click="goToReservation">
            <v-list-item-title>내 예약 내역</v-list-item-title>
          </v-list-item>
          <v-list-item @click="goToVipInfo">
            <v-list-item-title>내 Vip 정보</v-list-item-title>
          </v-list-item>
          <!-- 게시글 작성 항목 추가 -->
          <v-list-item @click="goToPostCreate">
            <v-list-item-title>게시글 작성</v-list-item-title>
          </v-list-item>
          <v-list-item @click="goToFavorite">
            <v-list-item-title>즐겨찾기</v-list-item-title>
          </v-list-item>
          <v-list-item @click="goToBlockList">
            <v-list-item-title>차단목록</v-list-item-title>
          </v-list-item>
          <v-list-item @click="withdrawAccount">
            <v-list-item-title>회원 탈퇴</v-list-item-title>
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
            <v-card 
              class="clickable-card" 
              @click="goToPostDetail(index)"
              flat
            >
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

    <!-- 팔로워 다이얼로그 -->
    <v-dialog v-model="showFollowersDialog" max-width="400">
      <v-card class="follow-dialog">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6">팔로워 목록</span>
          <v-btn icon size="small" @click="showFollowersDialog = false" class="close-btn">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <v-list v-if="followersList && followersList.length" class="follow-list">
            <v-list-item v-for="(follower, index) in followersList" :key="index" class="follow-item mb-3">
              <template v-slot:prepend>
                <v-avatar size="48" class="mr-3">
                  <v-img :src="follower.userProfile || placeholderProfile" alt="" cover></v-img>
                </v-avatar>
              </template>
              <v-list-item-title class="text-subtitle-1 font-weight-medium">
                {{ follower.userName }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <div v-else class="d-flex justify-center align-center empty-state">
            <span class="text-grey">팔로워가 없습니다</span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 팔로잉 다이얼로그 -->
    <v-dialog v-model="showFollowingDialog" max-width="400">
      <v-card class="follow-dialog">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6">팔로잉 목록</span>
          <v-btn icon size="small" @click="showFollowingDialog = false" class="close-btn">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <v-list v-if="followingList && followingList.length" class="follow-list">
            <v-list-item v-for="(following, index) in followingList" :key="index" class="follow-item mb-3">
              <template v-slot:prepend>
                <v-avatar size="48" class="mr-3">
                  <v-img :src="following.userProfile || placeholderProfile" alt="" cover></v-img>
                </v-avatar>
              </template>
              <v-list-item-title class="text-subtitle-1 font-weight-medium">
                {{ following.userName }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <div v-else class="d-flex justify-center align-center empty-state">
            <span class="text-grey">팔로잉하는 사용자가 없습니다</span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      // 프로필 정보
      userNickName: "",
      userEmail: "",
      profilePhoto: localStorage.getItem("profilePhoto") || "https://via.placeholder.com/130",
      followersCount: 0,
      followingCount: 0,
      // 게시글 관련 데이터
      postPhotos: [],
      postIds: [],
      totalPost: 0,
      // 페이징/무한 스크롤 관련 상태
      pageSize: 6,
      currentPage: 0,
      isLoading: false,
      isLastPage: false,
      // 모달 관련 데이터
      showFollowersDialog: false,
      showFollowingDialog: false,
      followersList: [],
      followingList: [],
      placeholderProfile: "https://via.placeholder.com/50"
    };
  },
  async created() {
    // 프로필 및 팔로워/팔로잉 목록 로드
    await this.fetchFollowers();
    await this.fetchFollowing();
    // 첫 페이지 게시글 로드
    await this.loadData();
    // 스크롤 이벤트 등록
    window.addEventListener("scroll", this.scrollPagination);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.scrollPagination);
  },
  methods: {
    async loadData() {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;
      try {
        const params = {
          size: this.pageSize,
          page: this.currentPage
        };
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myPage`, {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        console.log(response);
        const additionalPhotos = response.data.postPhotos;
        this.totalPost = response.data.totalPost;
        this.userNickName = response.data.nickName;
        this.userEmail = response.data.email;
        const additionalPostIds = response.data.postIds || [];
  
        if (additionalPhotos && additionalPhotos.length > 0) {
          this.postPhotos = [...this.postPhotos, ...additionalPhotos];
          this.postIds = [...this.postIds, ...additionalPostIds];
          if (additionalPhotos.length < this.pageSize) {
            this.isLastPage = true;
            window.removeEventListener("scroll", this.scrollPagination);
          }
          this.currentPage++;
        } else {
          this.isLastPage = true;
          window.removeEventListener("scroll", this.scrollPagination);
        }
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      }
      this.isLoading = false;
    },
    scrollPagination() {
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (isBottom && !this.isLoading && !this.isLastPage) {
        this.loadData();
      }
    },
    goToPostDetail(index) {
      if (!this.postIds || this.postIds.length <= index) {
        console.error("postId를 찾을 수 없습니다.");
        return;
      }
      const postId = this.postIds[index]?.postId;
      if (!postId) {
        console.error(`postId가 올바르지 않습니다. index: ${index}`);
        return;
      }
      this.$router.push({
        path: `/post/detail/${postId}`,
        query: { from: 'mypage' }
      });
    },
    editProfile() {
      this.$router.push("/user/update");
    },
    // 내 Vip 정보는 기존 구현대로
    goToVipInfo() {
      this.$router.push('/user/myVip');
    },
    // 새로 추가된 메뉴 항목
    goToMileage() {
      this.$router.push("/user/mileage");
    },
    goToReservation() {
      this.$router.push("/user/reservation");
    },
    goToFavorite() {
      this.$router.push("/user/favorite");
    },
    // 차단목록 메뉴 클릭 시 "/user/block"로 이동
    goToBlockList() {
      this.$router.push("/user/block");
    },
    // 회원 탈퇴: 확인 창 후 axios 요청을 보내고, 성공 시 localStorage 삭제 후 로그인 화면으로 이동하여 전체 페이지를 새로고침
    withdrawAccount() {
      if (confirm("정말 회원탈퇴를 진행하시겠습니까?")) {
        axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/user/stop`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        )
        .then(() => {
          alert("회원탈퇴가 완료되었습니다. 로그아웃 처리됩니다.");
          localStorage.clear();
          // 로그인 페이지로 이동한 후 전체 페이지를 리로드
          window.location.href = "/login";
        })
        .catch(error => {
          console.error("회원 탈퇴 실패:", error);
          alert("회원 탈퇴에 실패했습니다.");
        });
      }
    },
    logout() {
      alert("로그아웃 되었습니다 (예시)");
    },
    async fetchFollowers() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/followerList`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        this.followersList = response.data;
        this.followersCount = response.data.length;
      } catch (error) {
        console.error("팔로워 목록 로드 실패:", error);
      }
    },
    async fetchFollowing() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/followingList`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        this.followingList = response.data;
        this.followingCount = response.data.length;
      } catch (error) {
        console.error("팔로잉 목록 로드 실패:", error);
      }
    },
    async openFollowersDialog() {
      this.showFollowersDialog = true;
    },
    async openFollowingDialog() {
      this.showFollowingDialog = true;
    },
    // 게시글 작성 메뉴 항목: "/post/create"로 이동
    goToPostCreate() {
      this.$router.push("/post/create");
    }
  }
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
.no-posts {
  margin: 20px 0;
  text-align: center;
}
.post-grid {
  margin: 0 !important;
}
.post-col {
  padding: 1px !important;
}
.clickable-card {
  border-radius: 0;
  transition: opacity 0.3s ease;
}
.post-image {
  width: 100%;
  transition: 0.3s;
  object-fit: cover;
}
.clickable-card:hover .post-image {
  opacity: 0.8;
}
.follow-dialog {
  border-radius: 12px;
  overflow: hidden;
}
.follow-list {
  background-color: transparent;
  padding: 0;
}
.follow-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  padding: 12px;
  background-color: #f8f9fa;
}
.follow-item:hover {
  background-color: #f1f3f5;
  transform: translateY(-1px);
}
.v-list-item-title {
  color: #343a40;
  font-size: 0.95rem !important;
}
.empty-state {
  height: 120px;
  color: #868e96;
  font-size: 0.95rem;
}
.v-card-text {
  max-height: 400px;
  overflow-y: auto;
}
.v-card-text::-webkit-scrollbar {
  width: 6px;
}
.v-card-text::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.v-card-text::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}
.v-card-text::-webkit-scrollbar-thumb:hover {
  background: #ced4da;
}
</style>
