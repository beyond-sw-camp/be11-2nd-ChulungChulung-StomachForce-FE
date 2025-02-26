<template>
  <v-container>
        <!-- 네비게이션 바 -->
        <v-tabs v-model="tab">
      <v-tab :to="`/restaurant/detail/${restaurantId}`">레스토랑 홈</v-tab>
      <v-tab :to="`/restaurant/detail/${restaurantId}/main`">상세정보</v-tab>
      <v-tab :to="`/menu/list/${restaurantId}`">메뉴</v-tab>
      <v-tab @click="reload()">리뷰</v-tab>
    </v-tabs>
    <h2 class="text-center title-box">리뷰</h2>

    <v-row>
      <v-col v-for="review in reviews" :key="review.id" cols="12" md="6">
        <v-card class="review-card" elevation="3">
          <!-- 리뷰 헤더 (별점 왼쪽, 유저 ID 오른쪽) -->
          <v-card-title class="d-flex justify-space-between align-center">
            <v-rating
              v-model="review.rating"
              readonly
              color="amber"
              background-color="grey lighten-3"
              dense
              half-increments
              size="20"
            ></v-rating>
            <span class="reviewer-id">작성자 : {{ review.userIdentify }}</span>
          </v-card-title>

          <!-- 프로필 이미지 (가운데 정렬) -->
          <div class="profile-section d-flex justify-center">
            <v-avatar size="60">
              <v-img :src="review.userProfileImage || '/assets/default-profile.jpg'"></v-img>
            </v-avatar>
          </div>

          <!-- 리뷰 사진 (별점 바로 밑) -->
          <v-sheet class="image-box" v-if="review.reviewPhotos.length">
            <v-row>
              <v-col v-for="(image, index) in review.reviewPhotos" :key="index" cols="4">
                <v-img :src="image" class="review-image" @click="openImage(image)"></v-img>
              </v-col>
            </v-row>
          </v-sheet>

          <!-- 리뷰 내용 (테두리 감싸기) -->
          <v-sheet class="review-content-box">
            <v-card-text class="review-content">
              <p>{{ review.contents }}</p>
            </v-card-text>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>

    <!-- 이미지 확대 보기 모달 -->
    <v-dialog v-model="imageDialog" max-width="80%">
      <v-card>
        <v-img :src="selectedImage" class="expanded-image"></v-img>
        <v-card-actions>
          <v-btn color="primary" block @click="imageDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn block color="black" class="reserve-button">예약하기</v-btn>
  </v-container>
</template>

---

### **💄 스타일 (SCSS)**
```vue
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

/* 유저 ID (오른쪽 정렬) */
.reviewer-id {
  font-size: 14px;
  font-weight: bold;
  color: #666;
}

/* 프로필 이미지 */
.profile-section {
  margin-top: 10px;
}

/* 사진 박스 (별점 바로 밑) */
.image-box {
  background: #f8f8f8;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

/* 리뷰 이미지 */
.review-image {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}
.review-image:hover {
  transform: scale(1.05);
}

/* 확대된 이미지 */
.expanded-image {
  width: 100%;
  border-radius: 10px;
}

/* 리뷰 텍스트 박스 */
.review-content-box {
  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
}

/* 리뷰 텍스트 */
.review-content {
  font-size: 14px;
  line-height: 1.5;
  color: #444;
}

/* 예약 버튼 */
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
      imageDialog: false, // 모달 상태
      selectedImage: "", // 선택된 이미지
      restaurantId: this.$route.params.id,
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
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/${restaurantId}/review/list`
        );

        console.log("📢 리뷰 응답 데이터:", response.data);
        this.reviews = response.data;
      } catch (e) {
        console.error("❌ 리뷰 데이터 로드 실패:", e);
      }
    },
    reload() {
      window.location.reload();
    },
    // 이미지 클릭 시 확대 모달 열기
    openImage(imageUrl) {
      this.selectedImage = imageUrl;
      this.imageDialog = true;
    },
  },
};
</script>