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
          <v-list-item @click="goToReservation">
            <v-list-item-title>내 예약 내역</v-list-item-title>
          </v-list-item>
          <v-list-item @click="goToVipInfo">
            <v-list-item-title>내 Vip 정보</v-list-item-title>
          </v-list-item>
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

    <!-- 메인 컨텐츠 -->
    <v-main>
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
              <v-col cols="auto" class="stat-item text-center">
                <strong @click="openFollowersDialog" style="cursor:pointer;">팔로워</strong>
                <p @click="openFollowersDialog" style="cursor:pointer;">{{ filteredFollowersCount }}</p>
              </v-col>
              <v-col cols="auto" class="stat-item text-center">
                <strong @click="openFollowingDialog" style="cursor:pointer;">팔로잉</strong>
                <p @click="openFollowingDialog" style="cursor:pointer;">{{ filteredFollowingCount }}</p>
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
            <v-card class="clickable-card" @click="goToPostDetail(index)" flat>
              <v-img :src="photo" aspect-ratio="1" cover class="post-image"></v-img>
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
          <v-btn icon variant="text" density="comfortable" class="close-btn" @click="showFollowersDialog = false">
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
                  <v-img :src="follower.userProfile || placeholderProfile" class="profile-image"></v-img>
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
          <v-btn icon variant="text" density="comfortable" class="close-btn" @click="showFollowingDialog = false">
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
                  <v-img :src="following.userProfile || placeholderProfile" class="profile-image"></v-img>
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
      // 프로필 및 게시글 관련 데이터
      userNickName: "",
      userEmail: "",
      influencer: "N",
      profilePhoto: localStorage.getItem("profilePhoto") || "https://via.placeholder.com/130",
      postPhotos: [],
      postIds: [],
      totalPost: 0,
      // 페이징/무한 스크롤 관련 상태
      pageSize: 6,
      currentPage: 0,
      isLoading: false,
      isLastPage: false,
      // 모달 및 검색용 데이터
      showFollowersDialog: false,
      showFollowingDialog: false,
      // 팔로워/팔로잉 리스트 (서버에서 받아옴)
      followersList: [],
      followingList: [],
      // 차단 여부를 개별 확인하기 위한 추가 필드
      // 각 항목에 { isBlocked: true/false } 값을 추가할 예정입니다.
      followerSearch: "",
      followingSearch: "",
      placeholderProfile: "https://via.placeholder.com/50"
    };
  },
  computed: {
    // 차단되지 않은 팔로워만 필터링
    filteredFollowers() {
      return this.followersList.filter(user => {
        const matchesSearch = this.followerSearch
          ? user.userNickName.toLowerCase().includes(this.followerSearch.toLowerCase())
          : true;
        return !user.isBlocked && matchesSearch;
      });
    },
    // 차단되지 않은 팔로잉만 필터링
    filteredFollowing() {
      return this.followingList.filter(user => {
        const matchesSearch = this.followingSearch
          ? user.userNickName.toLowerCase().includes(this.followingSearch.toLowerCase())
          : true;
        return !user.isBlocked && matchesSearch;
      });
    },
    filteredFollowersCount() {
      return this.filteredFollowers.length;
    },
    filteredFollowingCount() {
      return this.filteredFollowing.length;
    }
  },
  async created() {
    // 먼저 팔로워/팔로잉 리스트를 로드한 후, 각 항목별로 차단 여부를 확인
    await this.loadData();
    await this.fetchFollowers();
    await this.fetchFollowing();
    window.addEventListener("scroll", this.scrollPagination);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.scrollPagination);
  },
  methods: {
    // 개별 사용자 차단 여부 확인 메서드 (blockedUserNickName: 대상 닉네임)
    async checkIfBlocked(blockedUserNickName) {
      try {
        const payload = { blockedUserNickName };
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
        // response.data: [blockedByOther, blockedByMe]
        return response.data[0] || response.data[1];
      } catch (error) {
        console.error(`차단 여부 확인 실패 (${blockedUserNickName}):`, error);
        return false;
      }
    },
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
        const additionalPhotos = response.data.postPhotos;
        this.totalPost = response.data.totalPost;
        this.userNickName = response.data.nickName;
        this.userEmail = response.data.email;
        this.influencer = response.data.influencer;
  
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
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
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
    goToVipInfo() {
      this.$router.push('/user/myVip');
    },
    goToMileage() {
      this.$router.push("/user/mileage");
    },
    goToReservation() {
      this.$router.push("/user/reservation");
    },
    goToFavorite() {
      this.$router.push("/user/myBookMark");
    },
    goToBlockList() {
      this.$router.push("/user/block");
    },
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
          window.location.href = "/login";
        })
        .catch(error => {
          console.error("회원 탈퇴 실패:", error);
          alert("회원 탈퇴에 실패했습니다.");
        });
      }
    },
    async fetchFollowers() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/followerList`,
          { nickName: this.userNickName }, // $route.query.nickName 대신 this.userNickName 사용
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        // 각 항목별로 차단 여부 확인 후, isBlocked 필드를 추가
        const list = response.data;
        const checkedList = await Promise.all(
          list.map(async user => {
            user.isBlocked = await this.checkIfBlocked(user.userNickName);
            return user;
          })
        );
        this.followersList = checkedList;
      } catch (error) {
        console.error("팔로워 목록 로드 실패:", error);
      }
    },

    async fetchFollowing() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user/followingList`,
          { nickName: this.userNickName }, // 여기도 this.userNickName 사용
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        console.log(response.data);
        // 각 항목별로 차단 여부 확인 후, isBlocked 필드를 추가
        const list = response.data;
        const checkedList = await Promise.all(
          list.map(async user => {
            user.isBlocked = await this.checkIfBlocked(user.userNickName);
            return user;
          })
        );
        this.followingList = checkedList;
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
