<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h2 class="text-center" >{{ restaurant.name }}</h2>
        <div class="carousel-container">
          <!-- 왼쪽 화살표 -->
          <v-btn class="arrow-left" icon @click="prev">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>

          <!-- 이미지 리스트 -->
          <div class="image-wrapper">
            <v-img
              v-for="(image, index) in visibleImages"
              :key="index"
              :src="image"
              class="restaurant-image"
            ></v-img>
          </div>

          <!-- 오른쪽 화살표 -->
          <v-btn class="arrow-right" icon @click="next">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        <p class="text-center">📍 주소: {{ restaurant.address }}</p>

        <p class="text-center">📞 전화번호: {{ restaurant.phoneNumber || '정보 없음' }}</p>
        <p class="text-center">⭐ 평점: {{ restaurant.averageRating }}</p>
        <p class="text-center">📌 즐겨찾기: {{ restaurant.bookmarkCount }}</p>
        <p class="text-center">{{ restaurant.description }}</p>
        <v-btn class="text-center" color="red" @click="goBack">레스토랑 홈으로 가기</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}

.image-wrapper {
  display: flex;
  gap: 10px;
  overflow: hidden;
  width: 80%;
}

.restaurant-image {
  width: calc(25% - 10px); /* 한 줄에 4개 배치 */
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

/* 화살표 스타일 */
.arrow-left, .arrow-right {
  position: absolute;
  background: rgba(0, 0, 0, 0.5); /* 반투명 */
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
}

.arrow-left {
  left: 10px;
}

.arrow-right {
  right: 10px;
}
</style>

<script>
import axios from 'axios';

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
      currentIndex: 0, // 현재 인덱스
    };
  },
  computed: {
    visibleImages() {
    const total = this.restaurant.imagePath.length;
    if (total === 0) return [];

    let images = [];
    for (let i = 0; i < Math.min(4, total); i++) {
      images.push(this.restaurant.imagePath[(this.currentIndex + i) % total]);
    }
    return images;
    }
  },
  created() {
    this.loadRestaurantDetail();
  },
  methods: {
    async loadRestaurantDetail() {
      const restaurantId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${restaurantId}`);
        console.log("API 응답 데이터:", response.data);
        this.restaurant = response.data;

        // 기본 이미지 처리
        if (!this.restaurant.imagePath || this.restaurant.imagePath.length === 0) {
          this.restaurant.imagePath = ['/assets/noImage.jpg'];
        }
      } catch (e) {
        console.error("레스토랑 상세 정보 로드 실패:", e);
      }
    },
    next() {
      this.currentIndex = (this.currentIndex + 1) % this.restaurant.imagePath.length;
    },
    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.restaurant.imagePath.length) % this.restaurant.imagePath.length;
    },
    goBack() {
      this.$router.push('/restaurant/list');
    }
  }
};
</script>