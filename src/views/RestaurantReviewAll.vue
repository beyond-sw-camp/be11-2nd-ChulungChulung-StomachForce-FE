<template>
  <v-container>
    <h2 class="text-center title-box">리뷰</h2>

    <v-row>
      <v-col v-for="review in reviews" :key="review.id" cols="12" md="6">
        <v-card class="review-card" elevation="3">
          <!-- 리뷰 헤더 (등록자 + 프로필 이미지) -->
          <v-card-title class="d-flex align-center">
            <v-avatar size="50">
              <v-img :src="review.userProfileImage || '/assets/default-profile.jpg'"></v-img>
            </v-avatar>
            <div class="ml-3">
              <strong class="reviewer-name">{{ review.userIdentify }}</strong>
              <v-rating
                v-model="review.rating"
                readonly
                color="amber"
                background-color="grey lighten-3"
                dense
                half-increments
                size="20"
              ></v-rating>
            </div>
          </v-card-title>

          <!-- 리뷰 내용 -->
          <v-card-text class="review-content">
            <p>{{ review.contents }}</p>

            <!-- 리뷰 사진 -->
            <v-row v-if="review.reviewPhotos.length">
              <v-col v-for="(image, index) in review.reviewPhotos" :key="index" cols="4">
                <v-img :src="image" class="review-image"></v-img>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-btn block color="black" class="reserve-button">예약하기</v-btn>
  </v-container>
</template>

<style scoped>
.title-box {
  background-color: #f8e4c3;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.review-card {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 12px;
  transition: transform 0.3s ease-in-out;
}
.review-card:hover {
  transform: scale(1.02);
}

.reviewer-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.review-content {
  font-size: 14px;
  line-height: 1.5;
  color: #444;
}

.review-image {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
}

.reserve-button {
  font-size: 18px;
  padding: 12px;
  margin-top: 20px;
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      reviews: [],
    };
  },
  created() {
    this.loadReviews();
  },
  methods: {
    async loadReviews() {
      const restaurantId = this.$route.params.id;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/${restaurantId}/review/list`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("📢 리뷰 응답 데이터:", response.data);
        this.reviews = response.data;
      } catch (e) {
        console.error("리뷰 데이터 로드 실패:", e);
      }
    },
  },
};
</script>