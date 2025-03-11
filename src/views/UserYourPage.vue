<template>
  <v-app>
    <!-- 상단 앱바: 오른쪽 메뉴 버튼 -->
    <v-app-bar app color="white" flat>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="reportUser">
            <v-list-item-title>신고하기</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="!iBlockedOwner" @click="blockUser">
            <v-list-item-title>차단하기</v-list-item-title>
          </v-list-item>
          <v-list-item v-else @click="unblockUser">
            <v-list-item-title>차단 해제</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- 페이지 주인이 방문자를 차단한 경우 -->
    <v-main v-if="isBlockedByOwner">
      <v-container class="pa-12" style="text-align: center;">
        <h2>비공개 계정입니다.</h2>
        <p>해당 계정 게시물을 확인하실 수 없습니다.</p>
      </v-container>
    </v-main>

    <!-- 차단 상태가 아니라면 정상 페이지 내용 표시 -->
    <v-main v-else>
      <v-container>
        <!-- 프로필 섹션 -->
        <v-row justify="center" align="center" class="profile-section">
          <v-col cols="12" sm="3" class="text-center">
            <v-avatar size="150">
              <v-img :src="profilePhoto" alt="프로필" />
            </v-avatar>
          </v-col>
          <v-col cols="12" sm="6" class="user-info text-left">
            <h2 class="user-name">
              {{ userNickName }}
              <v-icon
                v-if="influencer === 'Y'"
                class="ml-1 gold-icon"
                size="30"
              >
                mdi-silverware-variant
              </v-icon>
            </h2>
            <p class="user-email">{{ userEmail }}</p>
            <v-row class="stats mt-2" justify="left">
              <!-- 서버에서 받은 follwers, followings 값을 그대로 사용 -->
              <v-col cols="auto" class="stat-item text-center">
                <strong @click="openFollowersDialog" style="cursor:pointer;">팔로워</strong>
                <p @click="openFollowersDialog" style="cursor:pointer;">{{ followerCountDisplay }}</p>
              </v-col>
              <v-col cols="auto" class="stat-item text-center">
                <strong @click="openFollowingDialog" style="cursor:pointer;">팔로잉</strong>
                <p @click="openFollowingDialog" style="cursor:pointer;">{{ filteredFollowing.length }}</p>
              </v-col>
              <v-col cols="auto" class="stat-item text-center">
                <strong>게시글</strong>
                <p>{{ totalPost }}</p>
              </v-col>
            </v-row>
    
            <!-- 팔로우 버튼 (내가 해당 계정을 차단한 경우 보이지 않음) -->
            <v-btn
              v-if="!iBlockedOwner"
              :color="isFollowing ? 'grey' : 'primary'"
              class="follow-btn mt-3"
              @click="toggleFollow"
            >
              {{ isFollowing ? "팔로우 취소" : "팔로우" }}
            </v-btn>
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
    <v-dialog v-model="showFollowersDialog" max-width="360">
      <v-card class="follow-dialog">
        <v-card-title class="dialog-title px-6 py-4">
          <span class="text-h6 font-weight-medium">팔로워</span>
          <v-btn
            icon
            variant="text"
            density="comfortable"
            class="close-btn"
            @click="showFollowersDialog = false"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <v-text-field
            v-model="followerSearch"
            label="닉네임 검색"
            dense
            outlined
            hide-details
            class="mx-4 mt-2"
          ></v-text-field>
          <v-list v-if="filteredFollowers.length > 0" class="follow-list py-2">
            <v-list-item
              v-for="(follower, index) in filteredFollowers"
              :key="index"
              class="follow-item px-6 py-3"
              @click="goToUserYourPage(follower.userNickName)"
              rounded="0"
            >
              <template v-slot:prepend>
                <v-avatar size="44" class="mr-4">
                  <v-img
                    :src="follower.userProfile || placeholderProfile"
                    class="profile-image"
                  />
                </v-avatar>
              </template>
              <v-list-item-title class="d-flex align-center">
                <span class="font-weight-medium text-body-1">{{ follower.userNickName }}</span>
                <v-icon
                  v-if="follower.influencer === 'Y'"
                  class="ml-2 gold-icon"
                  size="16"
                >
                  mdi-silverware-variant
                </v-icon>
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <div v-else class="empty-state">
            <v-icon size="40" color="grey-lighten-1" class="mb-3">
              mdi-account-multiple-outline
            </v-icon>
            <span class="text-body-1 text-medium-emphasis">아직 팔로워가 없습니다</span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 팔로잉 다이얼로그 -->
    <v-dialog v-model="showFollowingDialog" max-width="360">
      <v-card class="follow-dialog">
        <v-card-title class="dialog-title px-6 py-4">
          <span class="text-h6 font-weight-medium">팔로잉</span>
          <v-btn
            icon
            variant="text"
            density="comfortable"
            class="close-btn"
            @click="showFollowingDialog = false"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <v-text-field
            v-model="followingSearch"
            label="닉네임 검색"
            dense
            outlined
            hide-details
            class="mx-4 mt-2"
          ></v-text-field>
          <v-list v-if="filteredFollowing.length > 0" class="follow-list py-2">
            <v-list-item
              v-for="(following, index) in filteredFollowing"
              :key="index"
              class="follow-item px-6 py-3"
              @click="goToUserYourPage(following.userNickName)"
              rounded="0"
            >
              <template v-slot:prepend>
                <v-avatar size="44" class="mr-4">
                  <v-img
                    :src="following.userProfile || placeholderProfile"
                    class="profile-image"
                  />
                </v-avatar>
              </template>
              <v-list-item-title class="d-flex align-center">
                <span class="font-weight-medium text-body-1">{{ following.userNickName }}</span>
                <v-icon
                  v-if="following.influencer === 'Y'"
                  class="ml-2 gold-icon"
                  size="16"
                >
                  mdi-silverware-variant
                </v-icon>
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <div v-else class="empty-state">
            <v-icon size="40" color="grey-lighten-1" class="mb-3">
              mdi-account-multiple-outline
            </v-icon>
            <span class="text-body-1 text-medium-emphasis">팔로잉하는 사용자가 없습니다</span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  name: "YourPage",
  data() {
    return {
      // 프로필 정보
      userNickName: "",
      userEmail: "",
      influencer: "N",
      profilePhoto: localStorage.getItem("profilePhoto") || "https://via.placeholder.com/130",
      // 게시글 관련 데이터
      postPhotos: [],
      postIds: [],
      totalPost: 0,
      // 백엔드에서 받은 팔로워/팔로잉 수
      followingCount: 0,
      // 페이징/무한 스크롤 상태
      pageSize: 6,
      currentPage: 0,
      isLoading: false,
      isLastPage: false,
      isFollowing: false,
      followerCount: 0,  // 서버에서 받은 전체 숫자 (새로고침 시에는 이 값으로 초기화)
      followerCountDisplay: 0,
      // 차단 관련 상태
      isBlockedByOwner: false, // 페이지 주인이 방문자를 차단한 경우
      iBlockedOwner: false,    // 내가 해당 페이지 주인을 차단했는지 여부
      // 팔로워, 팔로잉, 차단 목록 (다이얼로그용)
      followersList: [],
      followingList: [],
      blockedList: [],
      // 검색 변수 및 모달 제어
      followerSearch: "",
      followingSearch: "",
      showFollowersDialog: false,
      showFollowingDialog: false,
      placeholderProfile: "https://via.placeholder.com/50"
    };
  },
  computed: {
    // 차단된 사용자 닉네임 배열
    blockedUserNickNames() {
      return this.blockedList.map(user => user.userNickName);
    },
    // 차단된 사용자를 제외한 팔로워 목록
    filteredFollowers() {
      return this.followersList.filter(user => {
        const notBlocked = !this.blockedUserNickNames.includes(user.userNickName);
        const matchesSearch = this.followerSearch
          ? user.userNickName.toLowerCase().includes(this.followerSearch.toLowerCase())
          : true;
        return notBlocked && matchesSearch;
      });
    },
    // 차단된 사용자를 제외한 팔로잉 목록
    filteredFollowing() {
      return this.followingList.filter(user => {
        const notBlocked = !this.blockedUserNickNames.includes(user.userNickName);
        const matchesSearch = this.followingSearch
          ? user.userNickName.toLowerCase().includes(this.followingSearch.toLowerCase())
          : true;
        return notBlocked && matchesSearch;
      });
    }
  },
  async created() {
    // 라우트 쿼리로부터 페이지 주인 닉네임 설정
    if (this.$route.query.nickName) {
      this.userNickName = this.$route.query.nickName;
    }
    // 차단 여부 체크 후, 차단 상태가 아니라면 나머지 데이터 로드
    await this.checkBlockStatus();
    console.log("checkBlockStatus:", this.isBlockedByOwner, this.iBlockedOwner);
    if (!this.isBlockedByOwner) {
      await this.loadUserPage();
      // 차단 목록을 먼저 로드한 후, 팔로워/팔로잉 목록을 로드
      await this.fetchBlockedList();
      await this.fetchFollowers();
      await this.fetchFollowing();
      window.addEventListener("scroll", this.scrollPagination);
    }
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.scrollPagination);
  },
  methods: {
    async checkBlockStatus() {
      try {
        const payload = {
          blockedUserNickName: this.$route.query.nickName
        };
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/isblocked`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        console.log("API isblocked result:", response.data);
        // response.data가 [true, false] 형태
        this.isBlockedByOwner = response.data[0];
        this.iBlockedOwner = response.data[1];
      } catch (error) {
        console.error("차단 여부 확인 실패:", error);
      }
    },
    async loadUserPage() {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;
      try {
        const params = {
          size: this.pageSize,
          page: this.currentPage,
          nickName: this.$route.query.nickName || ""
        };
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/yourPage`,
          {
            params,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          }
        );
        console.log("response : ", response.data);
        const data = response.data;
        if (this.currentPage === 0) {
          this.profilePhoto = data.profile || "https://via.placeholder.com/130";
          this.userNickName = data.nickName;
          this.userEmail = data.email;
          this.totalPost = data.totalPost;
          this.isFollowing = data.isFollowing || false;
          this.influencer = data.influencer;
          this.postPhotos = data.postPhotos || [];
          this.postIds = data.postIds || [];
          // 서버에서 받은 followers/followings 값 사용
          this.followerCount = data.follwers;
          this.followerCountDisplay = data.follwers; 
          this.followingCount = data.followings;
        } else {
          this.postPhotos = [...this.postPhotos, ...(data.postPhotos || [])];
          this.postIds = [...this.postIds, ...(data.postIds || [])];
        }
    
        if ((data.postPhotos || []).length < this.pageSize) {
          this.isLastPage = true;
          window.removeEventListener("scroll", this.scrollPagination);
        }
    
        this.currentPage++;
      } catch (error) {
        console.error("유저 페이지 로드 실패:", error);
      }
      this.isLoading = false;
    },
    scrollPagination() {
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (isBottom && !this.isLoading && !this.isLastPage) {
        this.loadUserPage();
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
      this.$router.push(`/post/detail/${postId}`);
    },
    async toggleFollow() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/follow`,
          { nickName: this.userNickName },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        
        const responseMessage = response.data;
        console.log(responseMessage);
        const currentUser = localStorage.getItem("userNickName");
        if (responseMessage.result === "팔로우가 취소되었습니다.") {
          this.isFollowing = false;
          // followersList에서 현재 사용자를 제거하는 기존 로직은 그대로 두고,
          // 화면에 보이는 숫자만 바로 줄임
          this.followerCountDisplay = Math.max(this.followerCountDisplay - 1, 0);
          this.followersList = this.followersList.filter(
            follower => follower.userNickName !== currentUser
          );
        } else if (responseMessage.result === "ok") {
          this.isFollowing = true;
          // 화면에 보이는 숫자 1 증가
          this.followerCountDisplay++;
          // followersList에 현재 사용자의 정보를 추가 (이미 있는지 확인)
          const currentProfile = localStorage.getItem("profilePhoto") || "https://via.placeholder.com/50";
          if (!this.followersList.find(follower => follower.userNickName === currentUser)) {
            this.followersList.push({
              userNickName: currentUser,
              userProfile: currentProfile,
              influencer: "N" // 또는 적절한 값을 설정
            });
          }
        }
      } catch (error) {
        console.error("팔로우 요청 실패:", error);
      }
    },



    reportUser() {
      this.$router.push({
        path: "/report/create",
        query: { reportedNickName: this.userNickName }
      });
    },
    async blockUser() {
      const payload = {
        blockedUserNickName: this.$route.query.nickName
      };
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/block`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        alert("차단되었습니다.");
        this.iBlockedOwner = true;
        // 차단 후 blockedList와 팔로워/팔로잉 목록 갱신
        await this.fetchBlockedList();
        await this.fetchFollowers();
        await this.fetchFollowing();
        window.location.reload();
      } catch (error) {
        console.error("차단 요청 실패:", error);
        alert("차단 요청에 실패했습니다.");
      }
    },
    async unblockUser() {
      const payload = {
        blockedUserNickName: this.$route.query.nickName
      };
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/unblock`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        alert("차단 해제되었습니다.");
        this.iBlockedOwner = false;
        
        // 차단 해제 시 팔로우 관계가 이미 취소되었으므로, 클라이언트 상태 업데이트:
        this.isFollowing = false;
        // 현재 사용자의 닉네임을 로컬 스토리지 또는 다른 곳에서 가져온다고 가정
        const currentUser = localStorage.getItem("userNickName");
        this.followersList = this.followersList.filter(
          follower => follower.userNickName !== currentUser
        );
        
        // 목록 갱신도 추가적으로 호출할 수 있음
        await this.fetchBlockedList();
        await this.fetchFollowers();
        await this.fetchFollowing();
      } catch (error) {
        console.error("차단 해제 요청 실패:", error);
        alert("차단 해제 요청에 실패했습니다.");
      }
    },

    async fetchFollowers() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/followerList`,
          { nickName: this.$route.query.nickName },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        console.log("Followers:", response.data);
        this.followersList = response.data;
      } catch (error) {
        console.error("팔로워 목록 로드 실패:", error);
      }
    },

    async fetchFollowing() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/followingList`,
          { nickName: this.$route.query.nickName },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        console.log("Following:", response.data);
        this.followingList = response.data;
      } catch (error) {
        console.error("팔로잉 목록 로드 실패:", error);
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
    async openFollowersDialog() {
      await this.fetchFollowers();  // 최신 팔로워 명단을 다시 불러옴
      this.showFollowersDialog = true;
    },
    async openFollowingDialog() {
      await this.fetchFollowing();  // 최신 팔로잉 명단을 다시 불러옴
      this.showFollowingDialog = true;
    },

    goToPostCreate() {
      this.$router.push("/post/create");
    },
    goToUserYourPage(nickName) {
      this.$router.push({ path: "/user/yourPage", query: { nickName } });
    }
  }
};
</script>

<style scoped>
.follow-btn {
  width: 120px;
}
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
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
.dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}
.close-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.close-btn:hover {
  opacity: 1;
}
.follow-list {
  max-height: 400px;
  overflow-y: auto;
}
.follow-item {
  transition: all 0.2s ease;
  border-radius: 0;
}
.follow-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
.profile-image {
  border-radius: 50%;
  object-fit: cover;
}
.gold-icon {
  color: #FFD700 !important;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: rgba(0, 0, 0, 0.6);
}
/* 스크롤바 스타일링 */
.follow-list::-webkit-scrollbar {
  width: 6px;
}
.follow-list::-webkit-scrollbar-track {
  background: transparent;
}
.follow-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.follow-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
