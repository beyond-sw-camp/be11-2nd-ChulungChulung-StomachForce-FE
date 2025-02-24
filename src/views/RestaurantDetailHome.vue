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

    <!-- 매장명 -->
    <v-card class="title-card">
      <v-card-title class="text-h4 text-center">{{ restaurant.name }}</v-card-title>
    </v-card>

    <!-- 매장 사진 (v-carousel 적용) -->
    <v-carousel cycle hide-delimiters>
      <v-carousel-item
        v-for="(image, index) in restaurant.imagePath"
        :key="index"
        :src="image"
        lazy-src="/assets/loading-placeholder.jpg"
      ></v-carousel-item>
    </v-carousel>

    <!-- 매장 기본 정보 -->
    <v-row class="info-section">
      <v-col cols="12" md="6">
        <v-card class="info-card">
          <v-card-title>📍 주소</v-card-title>
          <v-card-text>{{ restaurant.address }}</v-card-text>
        </v-card>
        <v-card class="info-card">
          <v-card-title>📞 전화번호</v-card-title>
          <v-card-text>{{ restaurant.phoneNumber || "정보 없음" }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="info-card">
          <v-card-title>⭐ 평점</v-card-title>
          <v-card-text>{{ restaurant.averageRating }} / 5.0</v-card-text>
        </v-card>
        <v-card class="info-card">
          <v-card-title>📌 즐겨찾기</v-card-title>
          <v-card-text>{{ restaurant.bookmarkCount }}명</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 대표 메뉴 -->
    <v-card class="menu-section">
      <v-card-title class="text-h5">🍔 대표 메뉴</v-card-title>
      <v-row>
        <v-col
          v-for="(menu, index) in restaurant.menus"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card>
            <v-img :src="menu.image" height="150px"></v-img>
            <v-card-title>{{ menu.name }}</v-card-title>
            <v-card-subtitle>{{ menu.price }}원</v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- 영업시간 -->
    <v-card class="time-section">
      <v-card-title class="text-h5">⏰ 영업시간</v-card-title>
      <v-card-text>
        <p>🕒 운영 시간: {{ formatTime(restaurant.openingTime) }} ~ {{ formatTime(restaurant.closingTime) }}</p>
        <p>🍽️ 라스트 오더: {{ formatTime(restaurant.lastOrder) }}</p>
        <p>☕ 브레이크 타임: {{ formatTime(restaurant.breakTimeStart) }} ~ {{ formatTime(restaurant.breakTimeEnd) }}</p>
      </v-card-text>
    </v-card>

    <!-- 예약 버튼 -->
    <v-btn class="reservation-btn" color="red" block @click="goToReservation">
      예약하기
    </v-btn>
  </v-container>
</template>

<style scoped>
.title-card {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
}

.info-section {
  margin-top: 20px;
}

.info-card {
  margin-bottom: 10px;
  padding: 15px;
}

.menu-section {
  margin-top: 20px;
  padding: 15px;
}

.time-section {
  margin-top: 20px;
  padding: 15px;
}

.reservation-btn {
  margin-top: 20px;
  font-size: 20px;
  padding: 15px;
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      tab: null,
      restaurant: {
        name: "",
        address: "",
        phoneNumber: "",
        averageRating: "",
        bookmarkCount: "",
        openingTime: String,
        closingTime: String,
        lastOrder: String,
        breakTimeStart: String,
        breakTimeEnd: String,
        imagePath: [],
        menus: [],
      },
      restaurantId: this.$route.params.id, // URL에서 id 가져오기

    };
  },
  created() {
    this.loadRestaurantDetail();
  },
  methods: {
formatTime(dateTime) {
      if (!dateTime) return "없음"; // 값이 없을 경우 대비
      return new Date(dateTime).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // 24시간 형식
      });
    },

    async loadRestaurantDetail() {
      const restaurantId = this.$route.params.id;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${restaurantId}`
        );
        console.log("API 응답 데이터:", response.data);
        this.restaurant = response.data;

        // 기본 이미지 처리
        if (!this.restaurant.imagePath || this.restaurant.imagePath.length === 0) {
          this.restaurant.imagePath = ["/assets/noImage.jpg"];
        }
        this.preloadImages(this.restaurant.imagePath);
      } catch (e) {
        console.error("레스토랑 상세 정보 로드 실패:", e);
      }
      

    },
    preloadImages(images) {
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    },
    goToReservation() {
      // 해당 위치는 라우팅 변경 필요합니다.
      this.$router.push(`/restaurant/reservation/${this.restaurant.id}`);
    },
    reload(){
      window.location.reload();
    }
  },
};
</script>