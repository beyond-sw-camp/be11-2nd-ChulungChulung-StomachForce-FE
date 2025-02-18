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
          <!-- 프로필 사진 -->
          <v-col cols="12" sm="3" class="text-center">
            <v-avatar size="130">
              <v-img :src="profilePhoto" alt="프로필" />
            </v-avatar>
          </v-col>

          <!-- 사용자 정보 -->
          <v-col cols="12" sm="6" class="user-info text-left">
            <h2 class="user-name">{{ userName }}</h2>
            <p class="user-email">{{ userEmail }}</p>
            <v-row class="stats mt-2" justify="left">
              <!-- 팔로워: 클릭 시 팔로워 목록 모달 오픈 -->
              <v-col cols="auto" class="stat-item text-center">
                <strong @click="openFollowersDialog" style="cursor:pointer;">팔로워</strong>
                <p @click="openFollowersDialog" style="cursor:pointer;">{{ followersCount }}</p>
              </v-col>
              <!-- 팔로잉: 클릭 시 팔로잉 목록 모달 오픈 -->
              <v-col cols="auto" class="stat-item text-center">
                <strong @click="openFollowingDialog" style="cursor:pointer;">팔로잉</strong>
                <p @click="openFollowingDialog" style="cursor:pointer;">{{ followingCount }}</p>
              </v-col>
              <v-col cols="auto" class="stat-item text-center">
                <strong>게시글</strong>
                <p>{{ postPhotos.length }}</p>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- 게시글 섹션 -->
        <div v-if="postPhotos.length === 0" class="no-posts text-center">
          <p>게시글이 없습니다</p>
        </div>
        <v-row v-else justify="start">
          <v-col
            v-for="(photo, index) in postPhotos"
            :key="index"
            cols="12"
            sm="3"
          >
            <!-- 클릭 시 게시글 상세페이지로 이동 -->
            <v-card class="clickable-card" @click="goToPostDetail(index)">
              <v-img :src="photo" aspect-ratio="1" cover class="post-image" />
            </v-card>
          </v-col>
        </v-row>

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
                    <!-- v-avatar를 사용해 원형 이미지 표시 -->
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

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      userName: "",
      userEmail: "",
      profilePhoto: localStorage.getItem("profilePhoto") || "https://via.placeholder.com/130",
      followersCount: 0,
      followingCount: 0,
      postPhotos: [], // 게시글 첫 사진 URL 배열
      // 모달 관련 데이터
      showFollowersDialog: false,
      showFollowingDialog: false,
      followersList: [],
      followingList: [],
      placeholderProfile: "https://via.placeholder.com/50"
    };
  },
  async created() {
    await this.fetchMyPage();
    await this.fetchFollowers();
    await this.fetchFollowing();
  },
  methods: {
    async fetchMyPage() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myPage`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        const data = response.data;
        this.userName = data.nickName;
        this.userEmail = data.email;
        this.profilePhoto = data.profilePhoto
          ? data.profilePhoto
          : localStorage.getItem("profilePhoto") || "https://via.placeholder.com/130";
        this.postPhotos = data.postPhotos || [];
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
      }
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
        console.log(response);
        this.followingList = response.data;
        this.followingCount = response.data.length;
      } catch (error) {
        console.error("팔로잉 목록 로드 실패:", error);
      }
    },
    goToPostDetail(index) {
      this.$router.push(`/post/detail/${index}`);
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
    async openFollowersDialog() {
      // 이미 fetchFollowers()로 followersList 업데이트됨.
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
.post-image {
  width: 100%;
  border-radius: 8px;
  transition: 0.3s;
  object-fit: cover;
}
.post-image:hover {
  opacity: 0.8;
}
.clickable-card {
  cursor: pointer;
}
</style>
