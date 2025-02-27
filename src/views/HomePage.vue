<template>
  <div>
    <!-- 이벤트 배너 섹션 -->
    <div class="banner-container">
      <v-slide-group
        v-if="ongoingEvents && ongoingEvents.length > 0"
        show-arrows="hover"
        class="pa-4"
        :continuous="true"
        center-active
        mandatory
      >
        <v-slide-group-item
          v-for="event in infiniteEvents"
          :key="`${event.eventId}-${event.index}`"
        >
          <v-card
            class="mx-4 event-card"
            @click="goToEventDetail(event.eventId)"
            width="500"
            elevation="0"
          >
            <v-img
              :src="event.eventImage"
              height="280"
              cover
              class="rounded-lg"
            ></v-img>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </div>

    <!-- 메인 컨텐츠 -->
    <v-container>
      <!-- 인기 레스토랑 섹션 -->
      <v-row>
        <v-col cols="12">
          <div class="section-header d-flex justify-space-between align-center mb-4">
            <h2 class="section-title">
              지금 <span class="highlight-text">인기많은</span> 레스토랑은?
            </h2>
            <router-link 
              :to="{ name: 'RestaurantListComponent' }" 
              class="view-all-link"
            >
              전체 보기
            </router-link>
          </div>
          
          <v-slide-group
            show-arrows
            class="restaurant-slider"
          >
            <v-slide-group-item
              v-for="restaurant in sortedRestaurants" 
              :key="restaurant.restaurantId"
            >
              <div 
                class="restaurant-item mx-2"
                @click="viewDetails(restaurant.restaurantId)"
              >
                <div class="restaurant-image-wrapper">
                  <v-img 
                    :src="restaurant.restaurantImage" 
                    width="200"
                    height="200"
                    cover
                    class="rounded-lg"
                  ></v-img>
                </div>
                <div class="restaurant-info">
                  <div class="restaurant-name">{{ restaurant.restaurantName }}</div>
                  <div class="restaurant-rating">⭐ {{ restaurant.rating }}</div>
                </div>
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>
      </v-row>

      <!-- 인플루언서 섹션 -->
      <v-row>
        <v-col cols="12">
          <div class="section-header d-flex justify-space-between align-center mb-4">
            <h2 class="section-title">
              지금 <span class="highlight-text">인기많은</span> 인플루언서는?
            </h2>
            <router-link 
              :to="{ name: 'InfluencerListPage' }" 
              class="view-all-link"
            >
              전체 보기
            </router-link>
          </div>
          
          <v-slide-group
            show-arrows
            class="influencer-slider"
          >
            <v-slide-group-item
              v-for="influencer in sortedInfluencers" 
              :key="influencer.userId"
            >
              <div 
                class="influencer-item mx-2"
                @click="goToUserPage(influencer.nickname)"
              >
                <div class="influencer-image-wrapper">
                  <v-img 
                    :src="influencer.profileImage" 
                    width="200"
                    height="200"
                    cover
                    class="rounded-lg"
                  ></v-img>
                </div>
                <div class="influencer-info">
                  <div class="influencer-name">{{ influencer.nickname }}</div>
                  <div class="influencer-followers">팔로워 {{ influencer.followersCount }}명</div>
                </div>
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>
      </v-row>

      <!-- 포스트 리스트 섹션 -->
      <v-row>
        <v-col cols="12">
          <div class="section-header d-flex justify-space-between align-center mb-4">
            <h2 class="section-title">
              뱃살력들의 <span class="highlight-text">먹방</span> 스토리
            </h2>
            <router-link 
              :to="{ name: 'PostList' }" 
              class="view-all-link"
            >
              전체 보기
            </router-link>
          </div>
          
          <v-slide-group
            show-arrows
            class="post-slider"
          >
            <v-slide-group-item
              v-for="post in sortedPosts" 
              :key="post.postId"
            >
              <div 
                class="post-item mx-2"
                @click="goToPostDetail(post.postId)"
              >
                <div class="post-image-wrapper">
                  <v-img 
                    :src="post.postPhotos[0]" 
                    width="200"
                    height="200"
                    cover
                    class="rounded-lg"
                  ></v-img>
                </div>
                <div class="post-info">
                  <div class="post-stats">
                    <span class="stat-item" :class="post.isLiked ? 'text-orange-darken-2' : 'text-grey'">
                      <v-icon small :color="post.isLiked ? 'orange-darken-2' : 'grey'">
                        {{ post.isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
                      </v-icon>
                      {{ post.likes }}
                    </span>
                  </div>
                </div>
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>
      </v-row>

      <!-- 뱃살력의 도움이 필요해요 섹션 -->
      <v-row class="mt-8">
        <v-col cols="12">
          <div class="section-header d-flex justify-space-between align-center mb-4">
            <h2 class="section-title">
              뱃살력의 <span class="highlight-text">도움</span>이 필요해요!
            </h2>
          </div>
          
          <v-row justify="center" align="center">
            <v-col cols="12" sm="4" class="text-center">
              <v-img
                :src="require('@/assets/등업이미지.png')"
                class="help-image mx-auto"
                max-width="400"
                @click="$router.push({ 
    path: '/service/post/create', 
    query: { category: 'REQUEST', title: '등업 신청합니다.', fromEvent2: 'true' } 
  })"
                style="cursor: pointer"
              >
                <template v-slot:placeholder>
                  <v-row align="center" justify="center">
                    <v-progress-circular indeterminate color="orange"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
            <v-col cols="12" sm="4" class="text-center">
              <v-img
                :src="require('@/assets/신청이미지.png')"
                class="help-image mx-auto"
                max-width="400"
                @click="$router.push({ 
    path: '/service/post/create', 
    query: { category: 'REQUEST', title: '이벤트 배너 신청합니다.', fromEvent: 'true' } 
  })"
                style="cursor: pointer"
              >
                <template v-slot:placeholder>
                  <v-row align="center" justify="center">
                    <v-progress-circular indeterminate color="orange"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
            
            <v-col cols="12" sm="4" class="text-center">
              <v-img
                :src="require('@/assets/신고이미지.png')"
                class="help-image mx-auto"
                max-width="400"
                @click="$router.push('/report/create')"
                style="cursor: pointer"
              >
                <template v-slot:placeholder>
                  <v-row align="center" justify="center">
                    <v-progress-circular indeterminate color="orange"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>

            
          </v-row>
        </v-col>
        
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.banner-container {
  background-color: #ffffff;
  padding: 20px 0 10px 0;
  margin-bottom: 0;
  width: 100%;
  position: relative;
}

.event-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-5px);
}

.v-slide-group {
  display: flex;
  justify-content: center;
  scroll-behavior: smooth;
}

/* 화살표 스타일 조정 */
:deep(.v-slide-group__prev),
:deep(.v-slide-group__next) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  border-radius: 50%;
  margin: 0 10px;
}

.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  background: white;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 16px 0;
}
.restaurant-card, .influencer-card {
  max-width: 200px;
  text-align: center;
  margin: 0 10px;
  border: none;
  transition: transform 0.2s;
}
.restaurant-card:hover, .influencer-card:hover {
  transform: translateY(-5px);
}
.profile-img {
  border-radius: 50%;
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin: 10px auto;
}
.event-carousel {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.event-banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.banner-overlay {
  display: none;
}
.category-card {
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}
.category-card:hover {
  transform: translateY(-5px);
}
.category-name {
  font-size: 12px;
  color: #333;
}
.customer-service-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-top: 20px;
}
.phone-number {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
}
.service-time, .email {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}
.more-btn {
  font-size: 14px;
  color: #666;
}

.nav-icons-container {
  padding: 10px 0 20px 0;
  background-color: white;
  border-bottom: none;
  margin-top: 0px;
}

.nav-icon-btn {
  height: auto !important;
  padding: 8px !important;
  min-width: 80px !important;
}

.nav-icon-btn:hover {
  background: transparent !important;
}

.nav-icon {
  transition: transform 0.2s;
}

.nav-icon-btn:hover .nav-icon {
  transform: translateY(-2px);
}

.nav-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.section-header {
  margin-bottom: 20px;
}

.highlight-text {
  color: #FF4081;  /* 뱃살력 로고 색상으로 변경해주세요 */
}

.restaurant-slider {
  position: relative;
  padding: 0 40px;  /* 화살표를 위한 여백 추가 */
}

.restaurant-slider :deep(.v-slide-group__prev),
.restaurant-slider :deep(.v-slide-group__next) {
  position: absolute;
  top: 35%;
  transform: translateY(-50%);
  background: none !important;
  box-shadow: none !important;
  z-index: 1;
}

.restaurant-slider :deep(.v-slide-group__prev) {
  left: 0;
}

.restaurant-slider :deep(.v-slide-group__next) {
  right: 0;
}

.restaurant-slider :deep(.v-icon) {
  color: #666;
  font-size: 32px;
}

.restaurant-item {
  width: 200px;
  display: inline-block;
  vertical-align: top;
  margin: 0 8px;
}

.restaurant-image-wrapper {
  margin-bottom: 12px;
}

.restaurant-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.restaurant-rating {
  font-size: 14px;
  color: #666;
}

.view-all-link {
  color: #FF4081;  /* 인기많은과 같은 색상 */
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.view-all-link:hover {
  opacity: 0.8;
}

.influencer-slider {
  position: relative;
  padding: 0 40px;
}

.influencer-slider :deep(.v-slide-group__prev),
.influencer-slider :deep(.v-slide-group__next) {
  position: absolute;
  top: 35%;
  transform: translateY(-50%);
  background: none !important;
  box-shadow: none !important;
  z-index: 1;
}

.influencer-slider :deep(.v-slide-group__prev) {
  left: 0;
}

.influencer-slider :deep(.v-slide-group__next) {
  right: 0;
}

.influencer-slider :deep(.v-icon) {
  color: #666;
  font-size: 32px;
}

.influencer-item {
  width: 200px;
  display: inline-block;
  vertical-align: top;
  margin: 0 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.influencer-item:hover {
  transform: translateY(-5px);
}

.influencer-image-wrapper {
  margin-bottom: 12px;
}

.influencer-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.influencer-followers {
  font-size: 14px;
  color: #666;
}

.post-tags {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
}

.post-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.stat-item .v-icon {
  font-size: 16px;
}

.post-slider {
  position: relative;
  padding: 0 40px;  /* 화살표를 위한 여백 */
  white-space: nowrap;  /* 한 줄로 표시 */
  overflow: hidden;
}

.post-slider :deep(.v-slide-group__prev),
.post-slider :deep(.v-slide-group__next) {
  position: absolute;
  top: 35%;
  transform: translateY(-50%);
  background: none !important;
  box-shadow: none !important;
  z-index: 1;
}

.post-slider :deep(.v-slide-group__prev) {
  left: 0;
}

.post-slider :deep(.v-slide-group__next) {
  right: 0;
}

.post-slider :deep(.v-icon) {
  color: #666;
  font-size: 32px;
}

.post-item {
  width: 200px;
  display: inline-block;
  vertical-align: top;
  margin: 0 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.help-image {
  max-width: 400px;
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s;
}

.help-image:hover {
  transform: translateY(-5px);
}
</style>

<script>
import axios from "axios";
  
export default {
  data() {
    return {
      topRestaurants: [],
      topInfluencers: [],
      ongoingEvents: [],
      categories: [],
      autoSlideInterval: null,
      currentIndex: 0,
      navigationIcons: [
        { text: 'sns', image: 'sns.png', route:'/post/postList'  },
        { text: '이벤트', image: '이벤트.png', route:'/event'  },
        { text: '한식', image: '한식.png', route:'/restaurant/list/korean'  },
        { text: '일식', image: '일식.png', route:'/restaurant/list/japanese'  },
        { text: '퓨전', image: '퓨전.png' , route:'/restaurant/list/fusion' },
        { text: '중식', image: '중식.png' , route:'/restaurant/list/chinese' },
        { text: '양식', image: '양식.png' , route:'/restaurant/list/western' }
      ],
      posts: [],
      loginUserNickName: ""
    };
  },
  computed: {
    infiniteEvents() {
      return Array(5).fill(this.ongoingEvents).flat().map((event, index) => ({
        ...event,
        index: index
      }));
    },
    sortedRestaurants() {
      return [...this.topRestaurants].sort((a, b) => b.rating - a.rating);
    },
    sortedInfluencers() {
      return [...this.topInfluencers].sort((a, b) => b.followersCount - a.followersCount);
    },
    sortedPosts() {
      return [...this.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  async beforeMount() {
    await this.fetchTopRestaurants();
    await this.fetchTopInfluencers();
    await this.fetchOngoingEvents();
    await this.fetchCategories();
    await this.fetchPosts();
    await this.fetchUserInfo();
  },
  methods: {
    goToUserPage(nickname) {
    const loginUserNickName = this.loginUserNickName;  // 로그인한 사용자 닉네임
    if (loginUserNickName === nickname) {
      this.$router.push({ path: "/user/mypage" });
    } else {
      this.$router.push({ path: "/user/yourpage", query: { nickName: nickname } });
    }
  },
    async fetchTopRestaurants() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/top-favorites`);
        this.topRestaurants = response.data;
      } catch (error) {
        console.error("레스토랑 데이터를 가져오는 중 오류 발생", error);
      }
    },

    async fetchTopInfluencers() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/top-influencers`);
        this.topInfluencers = response.data;
      } catch (error) {
        console.error("인플루언서 데이터를 가져오는 중 오류 발생", error);
      }
    },

    async fetchOngoingEvents() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/announcement/event/ongoing`);
        this.ongoingEvents = response.data;
      } catch (error) {
        console.error("이벤트 데이터를 가져오는 중 오류 발생", error);
      }
    },
    async fetchUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) {
    return; // 토큰 없으면 호출하지 않음
  }

  try {
    const response = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/user/userInfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    this.loginUserNickName = response.data.userNickName;
  } catch (error) {
    console.error("로그인 유저 정보 조회 실패:", error);
  }
},
    async fetchCategories() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/categories`);
        this.categories = response.data;
      } catch (error) {
        console.error("카테고리 데이터를 가져오는 중 오류 발생", error);
      }
    },

    viewDetails(id) {
      this.$router.push(`/restaurant/detail/${id}`);
    },

    goToEventDetail(eventId) {
      this.$router.push({
        name: 'NoticeDetailPage',
        params: { id: eventId }
      });
    },

    startAutoSlide() {
      this.autoSlideInterval = setInterval(() => {
        if (this.ongoingEvents && this.ongoingEvents.length > 0) {
          const slideGroup = this.$el.querySelector('.v-slide-group');
          if (slideGroup && slideGroup.__vue__) {
            slideGroup.__vue__.next();
          }
        }
      }, 4000);
    },
    stopAutoSlide() {
      if (this.autoSlideInterval) {
        clearInterval(this.autoSlideInterval);
      }
    },
    navigateTo(route) {
      this.$router.push(route);
    },
    viewInfluencerProfile(userId) {
      this.$router.push(`/influencer/${userId}`);
    },
    async fetchPosts() {
  try {
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/postList`, {
      params: { page: 0, size: 10 },
      headers
    });

    this.posts = response.data.content;

    // 각 포스트의 좋아요 상태 가져오기 (로그인한 경우만 실행)
    if (token) {
      await Promise.all(this.posts.map(post => this.fetchLikeData(post)));
    }
  } catch (error) {
    console.error("포스트 데이터를 가져오는 중 오류 발생", error);
  }
},

    async fetchLikeData(post) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return; // 로그인하지 않았으면 실행하지 않음

    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/post/getLike/${post.postId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    post.isLiked = response.data.liked;
    post.likes = response.data.likes;
  } catch (error) {
    console.error(`좋아요 상태 가져오기 실패 (postId: ${post.postId})`, error);
  }
},

    goToPostDetail(postId) {
      this.$router.push({ name: "UserPostDetail", params: { postId } });
    }
  },
  mounted() {
    this.startAutoSlide();
  },
  beforeUnmount() {
    this.stopAutoSlide();
  },
  
};
</script>