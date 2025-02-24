<template>
    <v-container>
            <!-- 네비게이션 바 -->
        <v-tabs v-model="tab">
      <v-tab @click="reload()">레스토랑 홈</v-tab>
      <v-tab :to="`/restaurant/detail/${restaurantId}/main`">상세정보</v-tab>
      <v-tab :to="`/restaurant/detail/${restaurantId}/menu`">메뉴</v-tab>
      <v-tab :to="`/restaurant/detail/${restaurantId}/reviews`">리뷰</v-tab>
      <v-tab :to="`/restaurant/detail/${restaurantId}/reservation`">예약하기</v-tab>
        </v-tabs>
      <h2 class="text-center title-box">{{ restaurant.name }}</h2>
  
      <!-- 기본 정보 -->
      <div class="info-container">
        <p>📍 주소: {{ restaurant.address }}</p>
        <p>📞 전화번호: {{ restaurant.phoneNumber || '정보 없음' }}</p>
        <p>⭐ 평점: {{ restaurant.averageRating }}</p>
        <p>📌 즐겨찾기: {{ restaurant.bookmarkCount }}</p>
        
        <!-- 지도 버튼 -->
        <div class="map-buttons">
          <v-btn color="blue" outlined @click="openNaverMap">네이버지도 바로가기</v-btn>
          <v-btn color="green" outlined @click="openKakaoMap">카카오지도 바로가기</v-btn>
        </div>
      </div>
  
      <!-- 공지사항 -->
      <div class="notice-container">
        <h3>공지사항</h3>
        <ul>
          <li v-for="info in restaurantInfos" :key="info.id">{{ info.informationText }}</li>
        </ul>
      </div>
  
      <!-- 레스토랑 설명 -->
      <div class="description-box">
        <p>{{ restaurant.description }}</p>
      </div>
  
      <!-- 매장 사진 -->
      <div class="photo-container">
        <v-img v-for="(image, index) in restaurant.imagePath.slice(0, 4)" 
               :key="index" :src="image" class="store-image"></v-img>
      </div>
  
      <v-btn block color="black" class="reserve-button">예약하기</v-btn>
    </v-container>
  </template>
  
  <style scoped>
  .title-box {
    background-color: #f8e4c3;
    padding: 15px;
    border-radius: 10px;
  }
  
  .info-container {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .map-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
  
  .notice-container {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  .description-box {
    background: #fff7e6;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 15px;
  }
  
  .photo-container {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .store-image {
    width: 22%;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
  }
  
  .reserve-button {
    font-size: 18px;
    padding: 12px;
  }
  </style>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        restaurant: {
          name: '',
          address: '',
          phoneNumber: '',
          averageRating: '',
          bookmarkCount: '',
          description: '',
          imagePath: [],
        },
        restaurantInfos: []  // 공지사항 데이터
      };
    },
    created() {
      this.loadRestaurantDetail();
      this.loadRestaurantInfo();
    },
    methods: {
      async loadRestaurantDetail() {
        const restaurantId = this.$route.params.id;
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${restaurantId}`);
          this.restaurant = response.data;
        } catch (e) {
          console.error("레스토랑 상세 정보 로드 실패:", e);
        }
      },
      async loadRestaurantInfo() {
        const restaurantId = this.$route.params.id;
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/info/${restaurantId}`);
          this.restaurantInfos = response.data;
        } catch (e) {
          console.error("공지사항 로드 실패:", e);
        }
      },
    // 네이버 지도 검색
      openNaverMap() {
      const query = encodeURIComponent(this.restaurant.name);
      const url = `https://map.naver.com/p/search/${query}`;
      window.open(url, "_blank");
      },

    // 카카오 지도 검색
      openKakaoMap() {
      const query = encodeURIComponent(this.restaurant.name);
      const url = `https://map.kakao.com/?q=${query}`;
      window.open(url, "_blank");
      },
      reload(){
      window.location.reload();
      }
    }
  };
  </script>