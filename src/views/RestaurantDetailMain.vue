<template>
  <v-container>
    <!-- 네비게이션 바 -->
    <v-tabs v-model="tab">
      <v-tab @click="reload()">레스토랑 홈</v-tab>
      <v-tab :to="`/restaurant/detail/${restaurantId}/main`">상세정보</v-tab>
      <v-tab :to="`/menu/list/${restaurantId}`">메뉴</v-tab>
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

    <!-- 매장 사진 (한 줄에 4장 & 한 장씩 넘기기 & 무한 루프) -->
    <v-container v-if="restaurant.imagePath.length"> 
      <div class="info-container">
        매장 사진
      </div><br>
      <v-row class="image-slider" justify="center" align="center">
        <!-- 5장 이상일 때만 버튼 활성화 -->
        <v-btn icon @click="prevImage" :disabled="restaurant.imagePath.length <= 4">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <div class="image-wrapper">
          <v-img
            v-for="(image, index) in paginatedImages"
            :key="index"
            :src="image"
            class="store-image"
          ></v-img>
        </div>

        <v-btn icon @click="nextImage" :disabled="restaurant.imagePath.length <= 4">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-row>
    </v-container>

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

/* 슬라이더를 위한 스타일 */
.image-slider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper {
  display: flex;
  gap: 10px;
}

.store-image {
  width: 200px; /* 4개가 한 줄에 표시되도록 크기 조정 */
  height: 200px;
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
      tab: null,
      restaurant: {
        name: '',
        address: '',
        phoneNumber: '',
        averageRating: '',
        bookmarkCount: '',
        description: '',
        imagePath: [], // 이미지 배열
      },
      restaurantId: this.$route.params.id,
      restaurantInfos: [], // 공지사항 데이터
      currentIndex: 0, // 현재 표시되는 첫 번째 이미지 인덱스
      imagesPerPage: 4, // 한 번에 보여줄 이미지 개수
    };
  },
  computed: {
    // 현재 화면에 표시할 4개의 이미지 가져오기 (무한 루프 적용)
    paginatedImages() {
      let totalImages = this.restaurant.imagePath.length;

      // 사진이 4장 이하이면 그대로 출력
      if (totalImages <= 4) {
        return this.restaurant.imagePath;
      }

      let images = [];
      for (let i = 0; i < this.imagesPerPage; i++) {
        images.push(this.restaurant.imagePath[(this.currentIndex + i) % totalImages]);
      }
      return images;
    }
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
    openNaverMap() {
      const query = encodeURIComponent(this.restaurant.name);
      const url = `https://map.naver.com/p/search/${query}`;
      window.open(url, "_blank");
    },
    openKakaoMap() {
      const query = encodeURIComponent(this.restaurant.name);
      const url = `https://map.kakao.com/?q=${query}`;
      window.open(url, "_blank");
    },
    reload() {
      window.location.reload();
    },
    // 이전 이미지로 이동 (한 장씩, 5장 이상일 때만)
    prevImage() {
      if (this.restaurant.imagePath.length > 4) {
        let totalImages = this.restaurant.imagePath.length;
        this.currentIndex = (this.currentIndex - 1 + totalImages) % totalImages;
      }
    },
    // 다음 이미지로 이동 (한 장씩, 5장 이상일 때만)
    nextImage() {
      if (this.restaurant.imagePath.length > 4) {
        let totalImages = this.restaurant.imagePath.length;
        this.currentIndex = (this.currentIndex + 1) % totalImages;
      }
    }
  }
};
</script>