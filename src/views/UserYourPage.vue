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
        <p>해당 계정은 현재 차단 상태입니다.</p>
      </v-container>
    </v-main>

    <!-- 차단 상태가 아니라면 정상 페이지 내용 표시 -->
    <v-main v-else>
      <v-container>
        <!-- 프로필 섹션 -->
        <v-row justify="center" align="center" class="profile-section">
          <v-col cols="12" sm="3" class="text-center">
            <v-avatar size="130">
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
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  name: "YourPage",
  data() {
    return {
      userNickName: "",
      userEmail: "",
      profilePhoto: "https://via.placeholder.com/130",
      influencer: "N", // 서버에서 받아온 값
      totalPost: 0,
      postPhotos: [],
      postIds: [],
      pageSize: 6,
      currentPage: 0,
      isLoading: false,
      isLastPage: false,
      isFollowing: false,
      // 페이지 주인이 방문자를 차단한 경우(즉, 내가 차단당한 경우)
      isBlockedByOwner: false,
      // 내가 해당 페이지 주인을 차단했는지 여부
      iBlockedOwner: false,
      // 팔로워, 팔로잉, 차단 목록
      followersList: [],
      followingList: [],
      blockedList: []
    };
  },
  computed: {
    // 차단 목록의 닉네임 배열 생성
    blockedUserNickNames() {
      return this.blockedList.map(user => user.userNickName);
    },
    // 차단 관계에 있는 사용자는 제외한 팔로워 목록
    filteredFollowers() {
      return this.followersList.filter(follower =>
        !this.blockedUserNickNames.includes(follower.userNickName)
      );
    },
    // 차단 관계에 있는 사용자는 제외한 팔로잉 목록
    filteredFollowing() {
      return this.followingList.filter(following =>
        !this.blockedUserNickNames.includes(following.userNickName)
      );
    },
    filteredFollowersCount() {
      return this.filteredFollowers.length;
    },
    filteredFollowingCount() {
      return this.filteredFollowing.length;
    }
  },
  async created() {
    // 라우트 쿼리로부터 페이지 주인 닉네임 설정
    if (this.$route.query.nickName) {
      this.userNickName = this.$route.query.nickName;
    }
    // 먼저 차단 여부를 체크
    await this.checkBlockStatus();
    console.log("checkBlockStatus:", this.isBlockedByOwner, this.iBlockedOwner);
    // 만약 페이지 주인이 방문자를 차단한 경우, "비공개 계정입니다" 화면을 띄우고 나머지 데이터 로드는 진행하지 않음
    if (!this.isBlockedByOwner) {
      await this.loadUserPage();
      await this.fetchFollowersList();
      await this.fetchFollowingList();
      await this.fetchBlockedList();
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
        // response.data가 [true, false] 형태라면:
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
      // 현재 팔로잉 상태 토글 후 API 호출
      this.isFollowing = !this.isFollowing;
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
        if (responseMessage === "팔로우가 취소되었습니다.") {
          this.isFollowing = false;
        } else if (responseMessage === "ok") {
          this.isFollowing = true;
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
        // 차단 후 blockedList 업데이트
        await this.fetchBlockedList();
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
        // 차단 해제 후 blockedList 업데이트
        await this.fetchBlockedList();
      } catch (error) {
        console.error("차단 해제 요청 실패:", error);
        alert("차단 해제 요청에 실패했습니다.");
      }
    },
    async fetchFollowersList() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/followerList`,
          {
            params: { nickName: this.$route.query.nickName },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        this.followersList = response.data;
      } catch (error) {
        console.error("팔로워 목록 로드 실패:", error);
      }
    },
    async fetchFollowingList() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/followingList`,
          {
            params: { nickName: this.$route.query.nickName },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
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
    openFollowersDialog() {
      // 모달 관련 처리 (필요 시 filteredFollowers 사용)
    },
    openFollowingDialog() {
      // 모달 관련 처리 (필요 시 filteredFollowing 사용)
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
.gold-icon {
  color: #FFD700 !important;
}
</style>
