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

    <!-- 매장명과 즐겨찾기 버튼 (상대 위치를 주어 리뷰작성 버튼 배치) -->
    <v-card class="title-card" style="position: relative;">
      <v-btn
        class="review-button"
        color="primary"
        small
        style="position: absolute; top: 10px; right: 10px;"
        @click="reviewDialog = true"
      >
        리뷰작성
      </v-btn>
      <v-card-title class="text-h4 text-center" style="position: relative;">
        {{ restaurant.name }}
        <!-- 즐겨찾기 버튼: 즐겨찾기 상태에 따라 아이콘 변경 -->
        <v-btn icon @click="toggleBookmark" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%);">
          <v-icon size="32">
            {{ isBookMark ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}
          </v-icon>
        </v-btn>
      </v-card-title>
    </v-card>
    
    <!-- 매장 사진 (수동 무한 넘기기) -->
    <v-row justify="center" v-if="restaurant.imagePath.length">
      <v-col cols="12" md="8">
        <v-card>
          <v-img
            :src="restaurant.imagePath[currentIndex]"
            lazy-src="/assets/loading-placeholder.jpg"
            height="300px"
            contain
          />
          <v-card-actions class="d-flex justify-center">
            <v-btn icon @click="prevImage">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span>{{ currentIndex + 1 }} / {{ restaurant.imagePath.length }}</span>
            <v-btn icon @click="nextImage">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 대표 메뉴 -->
    <v-card class="menu-section">
      <v-card-title class="text-h5">🍔 대표 메뉴</v-card-title>
      <v-row>
        <v-col v-for="(menu, index) in restaurant.menus" :key="index" cols="12" sm="6" md="4">
          <v-card>
            <v-img :src="menu.image" height="150px"></v-img>
            <v-card-title>{{ menu.name }}</v-card-title>
            <v-card-subtitle>{{ menu.price }}원</v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
    
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

    <!-- 영업시간 -->
    <v-card class="time-section">
      <v-card-title class="text-h5">⏰ 영업시간</v-card-title>
      <v-card-text>
        <p>🕒 운영 시간: {{ restaurant.openingTime }} ~ {{ formatTime(restaurant.closingTime) }}</p>
        <p>🍽️ 라스트 오더: {{ formatTime(restaurant.lastOrder) }}</p>
        <p>☕ 브레이크 타임: {{ formatTime(restaurant.breakTimeStart) }} ~ {{ formatTime(restaurant.breakTimeEnd) }}</p>
      </v-card-text>
    </v-card>

    <!-- 예약 버튼 -->
    <v-btn class="reservation-btn" color="red" block @click="goToReservation">
      예약하기
    </v-btn>

    <!-- 리뷰 작성 다이얼로그 -->
    <v-dialog v-model="reviewDialog" max-width="600">
      <v-card>
        <v-card-title class="headline">리뷰 작성</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="reviewFormRef" @submit.prevent="submitReview">
            <v-row align="center">
              <v-col cols="12">
                <v-rating
                  v-model="reviewForm.rating"
                  length="5"
                  color="amber"
                  background-color="grey lighten-3"
                  large
                ></v-rating>
              </v-col>
            </v-row>
            <v-textarea
              v-model="reviewForm.contents"
              label="리뷰 내용"
              required
              rows="5"
              class="mt-4"
            ></v-textarea>
            <v-file-input
              v-model="reviewForm.reviewImages"
              label="리뷰 이미지 첨부"
              multiple
              accept="image/*"
              prepend-icon="mdi-camera"
              class="mt-4"
              :rules="[v => !v || v.length <= 5 || '최대 5장까지만 첨부할 수 있습니다']"
              hint="최대 5장까지 첨부 가능합니다"
              show-size
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="reviewDialog = false">취소</v-btn>
          <v-btn color="blue darken-1" text @click="submitReview" :loading="reviewLoading">등록하기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        bookmarkCount: 0,
        openingTime: "",
        closingTime: "",
        lastOrder: "",
        breakTimeStart: "",
        breakTimeEnd: "",
        imagePath: [],
        menus: [],
      },
      restaurantId: this.$route.params.id,
      currentIndex: 0,
      isBookMark: false, // 즐겨찾기 여부
      // 리뷰 작성 다이얼로그 관련 데이터
      reviewDialog: false,
      reviewForm: {
        contents: "",
        rating: 5,
        reviewImages: [],
      },
      reviewLoading: false,
    };
  },
  created() {
    this.loadRestaurantDetail();
  },
  methods: {
    formatTime(timeString) {
      if (!timeString) return "없음";
      const timeParts = timeString.split(":");
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      return "없음";
    },
    async loadRestaurantDetail() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${this.restaurantId}`
        );
        console.log("API 응답 데이터:", response.data);
        this.restaurant = response.data;
        if (!this.restaurant.imagePath || this.restaurant.imagePath.length === 0) {
          this.restaurant.imagePath = ["/assets/noImage.jpg"];
        }
        this.preloadImages(this.restaurant.imagePath);
        // 레스토랑 정보를 로드한 후 즐겨찾기 상태 확인
        this.checkBookmark();
      } catch (e) {
        console.error("레스토랑 상세 정보 로드 실패:", e);
      }
    },
    preloadImages(images) {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    },
    prevImage() {
      this.currentIndex =
        this.currentIndex === 0
          ? this.restaurant.imagePath.length - 1
          : this.currentIndex - 1;
    },
    nextImage() {
      this.currentIndex =
        this.currentIndex === this.restaurant.imagePath.length - 1
          ? 0
          : this.currentIndex + 1;
    },
    goToReservation() {
      this.$router.push(`/restaurant/reservation/${this.restaurant.id}`);
    },
    reload() {
      window.location.reload();
    },
    async submitReview() {
      if (!this.reviewForm.contents) {
        alert("리뷰 내용을 입력해주세요.");
        return;
      }
      this.reviewLoading = true;
      try {
        const formData = new FormData();
        formData.append("contents", this.reviewForm.contents);
        formData.append("rating", this.reviewForm.rating);
        if (this.reviewForm.reviewImages && this.reviewForm.reviewImages.length > 0) {
          this.reviewForm.reviewImages.forEach((file) => {
            formData.append("reviewImage", file);
          });
        }
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/${this.restaurantId}/review/create`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        this.reviewDialog = false;
        this.reviewForm = { contents: "", rating: 5, reviewImages: [] };
        alert("리뷰 등록 완료");
      } catch (error) {
        console.error("리뷰 작성 실패:", error);
        alert("리뷰 작성에 실패했습니다. 다시 시도해주세요.");
      } finally {
        this.reviewLoading = false;
      }
    },
    // 즐겨찾기 상태 확인 (isBookMark API 호출)
    async checkBookmark() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/isBookMark`,
          { restaurantId: this.restaurant.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        this.isBookMark = response.data;
      } catch (error) {
        console.error("즐겨찾기 상태 확인 실패:", error);
      }
    },
    // 즐겨찾기 토글: 상태에 따라 추가 또는 삭제 API 호출
    async toggleBookmark() {
      try {
        if (this.isBookMark) {
          // 즐겨찾기 취소
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/restaurant/deleteBookMark`,
            { restaurantId: this.restaurant.id },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          this.isBookMark = false;
          if (this.restaurant.bookmarkCount > 0) {
            this.restaurant.bookmarkCount--;
          }
        } else {
          // 즐겨찾기 추가
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/restaurant/addBookMark`,
            { restaurantId: this.restaurant.id },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          this.isBookMark = true;
          this.restaurant.bookmarkCount++;
        }
      } catch (error) {
        console.error("즐겨찾기 토글 실패:", error);
      }
    },
  },
};
</script>
