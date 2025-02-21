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
          <v-list-item @click="goToPostCreate">
            <v-list-item-title>게시글 작성</v-list-item-title>
          </v-list-item>
          <v-list-item @click="goToSettings">
            <v-list-item-title>설정</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>로그아웃</v-list-item-title>
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
                <!-- postPhotos.length 대신 백엔드에서 전달한 전체 게시글 수 totalPost 표시 -->
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
              >
              </v-img>
            </v-card>
          </v-col>
        </v-row>

        <!-- 로딩 인디케이터 -->
        <div v-if="isLoading" class="text-center my-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </v-container>
    </v-main>

    <!-- 팔로워 목록 모달 -->
    <v-dialog v-model="showFollowersDialog" max-width="400">
      <v-card>
        <v-card-title>
          팔로워 목록
          <v-spacer></v-spacer>
          <v-btn icon @click="showFollowersDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(follower, index) in followersList" :key="index">
              <v-list-item-avatar>
                <v-avatar size="40">
                  <v-img :src="follower.userProfile || placeholderProfile" />
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ follower.userName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <div v-if="followersList.length === 0" class="text-center">
            <p>팔로워가 없습니다.</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 팔로잉 목록 모달 -->
    <v-dialog v-model="showFollowingDialog" max-width="400">
      <v-card>
        <v-card-title>
          팔로잉 목록
          <v-spacer></v-spacer>
          <v-btn icon @click="showFollowingDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(following, index) in followingList" :key="index">
              <v-list-item-avatar>
                <v-avatar size="40">
                  <v-img :src="following.userProfile || placeholderProfile" />
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ following.userName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <div v-if="followingList.length === 0" class="text-center">
            <p>팔로잉한 회원이 없습니다.</p>
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
      profilePhoto:
        localStorage.getItem("profilePhoto") ||
        "https://via.placeholder.com/130",
      followersCount: 0,
      followingCount: 0,
      // 게시글 부분은 페이징으로 불러온 부분(각 페이지마다 일부 데이터)
      postPhotos: [],
      // postIds 리스트 (서버에서 받은 MyPostDto 객체 배열, 예: [{ postId: 1 }, { postId: 2 }])
      postIds: [],
      // 전체 게시글 수 (백엔드에서 totalPost로 전달)
      totalPost: 0,

      // 페이징/무한 스크롤 관련 상태
      pageSize: 6, // 한 번에 불러올 게시글 수
      currentPage: 0, // 현재 페이지 번호
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
    // 첫 페이지 게시글 로드 (postPhotos와 postIds 둘 다 채움)
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
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/myPage`,
          {
            params,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        console.log(response);
        // 백엔드에서 반환하는 response.data는 MypageRes 객체로,
        // postPhotos: 해당 페이지의 게시글 사진 리스트, totalPost: 전체 게시글 수,
        // nickName, email, 그리고 postIds: MyPostDto 객체 배열를 포함합니다.
        const additionalPhotos = response.data.postPhotos;
        // 전체 게시글 수 업데이트 (첫 호출이든 이후 호출이든)
        this.totalPost = response.data.totalPost;
        this.userNickName = response.data.nickName;
        this.userEmail = response.data.email;
        // postIds도 함께 병합 (서버가 전달한 postIds 리스트 사용)
        const additionalPostIds = response.data.postIds || [];

        if (additionalPhotos && additionalPhotos.length > 0) {
          this.postPhotos = [...this.postPhotos, ...additionalPhotos];
          this.postIds = [...this.postIds, ...additionalPostIds];
          // 반환된 데이터 수가 pageSize보다 작으면 마지막 페이지로 판단
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
      // postIds 리스트의 해당 인덱스의 postId를 이용해 상세 페이지로 이동
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
    editProfile() {
      alert("내 정보 수정 화면으로 이동합니다 (예시)");
    },
    goToPostCreate() {
      this.$router.push("/post/create");
    },
    goToSettings() {
      alert("설정 화면으로 이동합니다 (예시)");
    },
    logout() {
      alert("로그아웃 되었습니다 (예시)");
    },
    async fetchFollowers() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/followerList`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
        console.log(response);
        this.followersList = response.data;
        this.followersCount = response.data.length;
      } catch (error) {
        console.error("팔로워 목록 로드 실패:", error);
      }
    },
    async fetchFollowing() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/followingList`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );
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
</style>
