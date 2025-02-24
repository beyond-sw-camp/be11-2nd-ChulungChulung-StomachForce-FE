<template>
    <v-container>
      <v-row>
        <!-- 왼쪽 섹션 -->
        <v-col cols="12" md="8">
          <!-- 이달의 레스토랑 -->
          <v-row>
            <v-col cols="12">
              <v-card class="section-card">
                <v-col cols="12" class="d-flex justify-space-between align-center">
                  <h2 class="section-title">최고의 레스토랑</h2>
                  <v-btn 
                    text 
                    color="grey" 
                    :to="{ name: 'RestaurantListComponent' }"
                    class="more-btn"
                  >
                    더보기
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-slide-group show-arrows>
                    <v-slide-group-item v-for="restaurant in topRestaurants" :key="restaurant.restaurantId">
                      <v-card 
                        class="restaurant-card"
                        @click="viewDetails(restaurant.restaurantId)"
                        style="cursor: pointer"
                      >
                        <v-img 
                          :src="restaurant.restaurantImage" 
                          height="150"
                        ></v-img>
                        <v-card-title>{{ restaurant.restaurantName }}</v-card-title>
                        <v-card-subtitle>⭐ {{ restaurant.rating }}</v-card-subtitle>
                      </v-card>
                    </v-slide-group-item>
                  </v-slide-group>
                </v-col>
              </v-card>
            </v-col>
          </v-row>
  
          <!-- 이달의 인플루언서 -->
          <v-row>
            <v-col cols="12">
              <v-card class="section-card">
                <v-col cols="12" class="d-flex justify-space-between align-center">
                  <h2 class="section-title">최고의 인플루언서</h2>
                  <v-btn text color="grey">더보기</v-btn>
                </v-col>
                <v-col cols="12">
                  <v-slide-group show-arrows>
                    <v-slide-group-item v-for="influencer in topInfluencers" :key="influencer.userId">
                      <v-card class="influencer-card">
                        <v-img :src="influencer.profileImage" class="profile-img"></v-img>
                        <v-card-title>{{ influencer.nickname }}</v-card-title>
                        <v-card-subtitle>팔로워 {{ influencer.followersCount }}명</v-card-subtitle>
                      </v-card>
                    </v-slide-group-item>
                  </v-slide-group>
                </v-col>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
  
        <!-- 오른쪽 섹션 -->
        <v-col cols="12" md="4">
          <!-- 이벤트 배너 -->
          <v-row>
            <v-col cols="12">
              <v-carousel 
                v-if="ongoingEvents && ongoingEvents.length > 0"
                hide-delimiters 
                height="200"
                show-arrows="hover"
                :continuous="true"
                :cycle="true"
                interval="4000"
                class="event-carousel"
              >
                <v-carousel-item 
                  v-for="event in ongoingEvents" 
                  :key="event.eventId"
                  eager
                  @click="goToEventDetail(event.eventId)"
                  style="cursor: pointer"
                >
                  <v-img 
                    :src="event.eventImage" 
                    class="event-banner"
                    cover
                    eager
                  ></v-img>
                </v-carousel-item>
              </v-carousel>
            </v-col>
          </v-row>
  
          <!-- 카테고리 바로가기 -->
          <v-row>
            <v-col cols="12">
              <v-card class="section-card">
                <h2 class="section-title px-4 pt-4">카테고리로 바로가기</h2>
                <v-slide-group 
                  show-arrows
                  class="pa-2"
                >
                  <v-slide-group-item
                    v-for="category in categories" 
                    :key="category.categoryId"
                  >
                    <v-card flat class="category-card text-center mx-2">
                      <v-img 
                        :src="category.categoryImage" 
                        height="40" 
                        contain
                      ></v-img>
                      <div class="category-name mt-1">{{ category.categoryName }}</div>
                    </v-card>
                  </v-slide-group-item>
                </v-slide-group>
              </v-card>
            </v-col>
          </v-row>
  
          <!-- 고객센터 정보 -->
          <v-row>
            <v-col cols="12">
              <v-card class="customer-service-card">
                <div class="d-flex align-center">
                  <v-icon large color="primary" class="mr-2">mdi-headphones</v-icon>
                  <h3 class="mb-0">고객센터 이용안내</h3>
                </div>
                <div class="mt-4">
                  <h2 class="phone-number">1800-8314</h2>
                  <div class="service-time">평일 09:00 - 18:00</div>
                  <div class="email">kit114@nate.com</div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        topRestaurants: [],
        topInfluencers: [],
        ongoingEvents: [],
        categories: [],
      };
    },
    async beforeMount() {
      await this.fetchTopRestaurants();
      await this.fetchTopInfluencers();
      await this.fetchOngoingEvents();
      await this.fetchCategories();
    },
    methods: {
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

async fetchCategories() {
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/categories`);
    this.categories = response.data;
  } catch (error) {
    console.error("카테고리 데이터를 가져오는 중 오류 발생", error);
  }
},

viewDetails(id) {
  this.$router.push(`/restaurant/${id}`);
},

goToEventDetail(eventId) {
  this.$router.push({
    name: 'NoticeDetailPage',
    params: { id: eventId }
  });
}
    },
  };
  </script>
  
  <style scoped>
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
    max-width: 180px;
    text-align: center;
    margin: 0 10px;
    border: none;
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
  .restaurant-card {
    max-width: 180px;
    text-align: center;
    margin: 0 10px;
    border: none;
    transition: transform 0.2s;
  }
  .restaurant-card:hover {
    transform: translateY(-5px);
  }
  </style>