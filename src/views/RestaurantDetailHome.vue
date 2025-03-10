<template>
  <v-container class="pa-0" fluid>
    <!-- 네비게이션 바 -->
    <div class="navigation-wrapper">
      <v-container>
        <v-tabs v-model="tab" background-color="transparent" color="#FF5722">
          <v-tab @click="reload" class="custom-tab">레스토랑 홈</v-tab>
          <v-tab :to="`/restaurant/detail/${restaurantId}/main`" class="custom-tab">상세정보</v-tab>
          <v-tab :to="`/menu/list/${restaurantId}`" class="custom-tab">메뉴</v-tab>
          <v-tab :to="`/restaurant/detail/${restaurantId}/reviews`" class="custom-tab">리뷰</v-tab>
        </v-tabs>
      </v-container>
    </div>

    <v-container class="main-content">
      <!-- 레스토랑 헤더 섹션 -->
      <v-card class="restaurant-header mb-6" elevation="0">
        <v-row align="center" no-gutters>
          <v-col cols="12" md="8">
            <h1 class="restaurant-title">{{ restaurant.name }}</h1>
            <div class="restaurant-stats">
              <span class="stat-item">
                <v-icon color="amber">mdi-star</v-icon>
                {{ restaurant.averageRating ? restaurant.averageRating.toFixed(1) : '0.0' }}
              </span>
              <span class="stat-divider">|</span>
              <span class="stat-item">
                <v-icon>mdi-bookmark</v-icon>
                {{ restaurant.bookmarkCount }}
              </span>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-end">
            <v-btn
              color="primary"
              class="action-btn mr-2"
              @click="reviewDialog = true"
            >
              <v-icon left>mdi-pencil</v-icon>
              리뷰작성
            </v-btn>
            <v-btn
              :color="isBookMarked ? 'red' : 'grey'"
              class="action-btn"
              @click="toggleBookmark"
            >
              <v-icon>{{ isBookMarked ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- 이미지 갤러리를 단일 이미지로 변경 -->
      <v-card class="image-container mb-6" v-if="restaurant.imagePath.length">
        <v-img
          :src="restaurant.imagePath[0]"
          height="400"
          cover
          class="main-image"
        ></v-img>
      </v-card>

      <!-- 정보 그리드 -->
      <v-row class="info-grid">
        <v-col cols="12" md="4">
          <v-card class="info-card">
            <v-card-text>
              <h3 class="info-title">
                <v-icon color="var(--primary-orange)">mdi-map-marker</v-icon>
                위치
              </h3>
              <p class="info-content">{{ restaurant.addressCity }} {{ restaurant.addressStreet }}</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="info-card">
            <v-card-text>
              <h3 class="info-title">
                <v-icon color="var(--primary-orange)">mdi-phone</v-icon>
                연락처
              </h3>
              <p class="info-content">{{ restaurant.phoneNumber || "정보 없음" }}</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="info-card">
            <v-card-text>
              <h3 class="info-title">
                <v-icon color="var(--primary-orange)">mdi-clock-outline</v-icon>
                영업시간
              </h3>
              <div class="time-info">
                <p>영업: {{ restaurant.openingTime }} - {{ formatTime(restaurant.closingTime) }}</p>
                <p>브레이크타임: {{ formatTime(restaurant.breakTimeStart) }} - {{ formatTime(restaurant.breakTimeEnd) }}</p>
                <p>라스트오더: {{ formatTime(restaurant.lastOrder) }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 대표 메뉴 섹션 -->
      <v-card class="menu-section mt-6">
        <v-card-title class="section-title d-flex align-center">
          <div class="d-flex align-center">
            <v-icon large color="var(--primary-orange)" class="mr-2">mdi-food</v-icon>
            대표 메뉴
          </div>
          <v-spacer></v-spacer>
          <router-link :to="`/menu/list/${restaurantId}`" class="view-all-link">
            전체 메뉴 보기 <v-icon small>mdi-chevron-right</v-icon>
          </router-link>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-for="menu in topMenus" :key="menu.id" cols="12" sm="6" md="3">
              <v-card class="menu-item" elevation="2">
                <v-img
                  :src="menu.menuPhoto || '/assets/noImage.jpg'"
                  height="200"
                  class="menu-image"
                ></v-img>
                <v-card-text>
                  <h3 class="menu-name">{{ menu.name }}</h3>
                  <p class="menu-price">{{ numberWithCommas(menu.price) }}원</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 예약하기 버튼 -->
      <v-btn
        block
        x-large
        elevation="0"
        class="reservation-button mt-6"
        @click="goToReservation"
      >
        예약하기
      </v-btn>
    </v-container>

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
          <v-btn color="orange lighten-1" text @click="reviewDialog = false">취소</v-btn>
          <v-btn color="orange darken-1" text @click="submitReview" :loading="reviewLoading">등록하기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* 색상 변수 정의 */
:root {
  --primary-orange: #FF6B00;
  --light-orange: #FFF0E6;
  --dark-orange: #E65100;
  --white: #FFFFFF;
  --text-dark: #333333;
}

.navigation-wrapper {
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
}

.custom-tab {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  min-width: 120px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--white);
}

.restaurant-header {
  background-color: transparent;
}

.restaurant-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.restaurant-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-orange);
}

.stat-divider {
  color: #ddd;
}

.action-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 8px;
  background-color: var(--primary-orange) !important;
  color: var(--white) !important;
}

.image-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.1);
}

.main-image {
  transition: transform 0.3s ease;
}

.main-image:hover {
  transform: scale(1.02);
}

.info-card {
  height: 100%;
  border-radius: 12px;
  transition: transform 0.2s;
  background-color: var(--light-orange);
  border: 1px solid rgba(255, 107, 0, 0.1);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.15);
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--text-dark);
}

.info-content {
  color: #666;
  line-height: 1.6;
}

.time-info p {
  margin: 8px 0;
  color: #666;
}

.menu-section {
  border-radius: 12px;
  background-color: var(--white);
  border: 1px solid rgba(255, 107, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-orange);
}

.menu-item {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  border: 1px solid rgba(255, 107, 0, 0.1);
}

.menu-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.15);
}

.menu-image {
  background-color: #f5f5f5;
}

.menu-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.menu-price {
  color: #666;
  font-weight: 500;
}

.reservation-button {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  background-color: var(--primary-orange) !important;
  color: var(--white) !important;
}

.reservation-button:hover {
  background-color: #FF8533 !important;
}

/* 리뷰 작성 버튼 스타일 */
.action-btn.primary {
  background-color: var(--primary-orange) !important;
}

/* 북마크 버튼 스타일 */
.action-btn.red {
  background-color: #FF4444 !important;
}

@media (max-width: 600px) {
  .restaurant-title {
    font-size: 1.8rem;
  }

  .main-content {
    padding: 16px;
  }

  .info-card {
    margin-bottom: 16px;
  }

  .image-container {
    height: 250px;
  }
}

/* v-btn 색상 오버라이드 */
::v-deep .v-btn--text {
  color: var(--primary-orange) !important;
}

/* 전체 메뉴 보기 버튼 색상 */
.v-btn.v-btn--text {
  color: var(--primary-orange) !important;
}

/* 리뷰 다이얼로그 스타일 */
.v-dialog .headline {
  color: var(--primary-orange);
}

.v-dialog .v-btn {
  color: var(--primary-orange) !important;
}

/* 파일 입력 컴포넌트 색상 */
::v-deep .v-file-input .v-input__icon--prepend .v-icon {
  color: var(--primary-orange) !important;
}

/* 텍스트 영역 포커스 색상 */
::v-deep .v-input--is-focused .v-input__slot {
  border-color: var(--primary-orange) !important;
}

/* 입력 필드 포커스 색상 */
::v-deep .v-input--is-focused .v-input__slot:before,
::v-deep .v-input--is-focused .v-input__slot:after {
  border-color: var(--primary-orange) !important;
}

/* 탭 인디케이터 색상 */
::v-deep .v-tabs-slider {
  background-color: var(--primary-orange) !important;
}

/* 링크 색상 */
a {
  color: var(--primary-orange);
}

a:hover {
  color: var(--dark-orange);
}

/* 전체 메뉴 보기 버튼 스타일 추가 */
.menu-view-all-btn {
  color: var(--primary-orange) !important;
}

.menu-view-all-btn .v-icon {
  color: var(--primary-orange) !important;
}

.view-all-link {
  color: var(--primary-orange);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
}

.view-all-link:hover {
  color: var(--dark-orange);
}

.fixed-reservation-button {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 100 !important;
  height: 56px !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  border-radius: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  background-color: var(--primary-orange) !important;
  color: var(--white) !important;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.fixed-reservation-button:hover {
  background-color: var(--dark-orange) !important;
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
        addressCity: "",
        addressStreet: "",
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
      reviewDialog: false,
      reviewForm: {
        contents: "",
        rating: 5,
        reviewImages: [],
      },
      reviewLoading: false,

      // 즐겨찾기 상태 (true면 즐겨찾기한 상태)
      isBookMarked: false,

      topMenus: [],

      showFixedButton: false,
    };
  },
  created() {
    this.loadRestaurantDetail();
    this.loadTopMenus();
    window.addEventListener('scroll', this.handleScroll);
  },
  mounted() {
    // 식당 상세정보 로드 후 즐겨찾기 상태 확인
    this.checkBookmark();
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
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
        this.restaurant = response.data;
        if (!this.restaurant.imagePath || this.restaurant.imagePath.length === 0) {
          this.restaurant.imagePath = ["/assets/noImage.jpg"];
        }
        this.preloadImages(this.restaurant.imagePath);
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
        const errorMessage = error.response?.data?.status_message || "리뷰 작성에 실패했습니다. 다시 시도해주세요.";
        alert(errorMessage);
      } finally {
        this.reviewLoading = false;
      }
    },
    // 즐겨찾기 상태 확인 API 호출 (isBookMark)
    async checkBookmark() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/isBookMark`,
          { restaurantId: this.restaurantId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        // 서버에서 boolean(true/false)을 리턴한다고 가정
        this.isBookMarked = response.data;
      } catch (error) {
        console.error("즐겨찾기 상태 확인 실패:", error);
      }
    },
    // 즐겨찾기 토글: 현재 상태에 따라 추가 또는 삭제
    async toggleBookmark() {
      try {
        if (this.isBookMarked) {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/restaurant/deleteBookMark`,
            { restaurantId: this.restaurantId },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          this.isBookMarked = false;
          // 즐겨찾기 수치 업데이트 (음수 방지)
          if (this.restaurant.bookmarkCount > 0) {
            this.restaurant.bookmarkCount--;
          }
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/restaurant/addBookMark`,
            { restaurantId: this.restaurantId },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          this.isBookMarked = true;
          this.restaurant.bookmarkCount++;
        }
      } catch (error) {
        console.error("즐겨찾기 토글 실패:", error);
        alert("즐겨찾기 처리에 실패했습니다. 다시 시도해주세요.");
      }
    },

    async loadTopMenus() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/menu/list/${this.restaurantId}`
        );
        // 메뉴 ID 순으로 정렬하고 처음 4개만 선택
        this.topMenus = response.data
          .sort((a, b) => a.id - b.id)
          .slice(0, 4);
      } catch (error) {
        console.error("메뉴 로드 실패:", error);
      }
    },

    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    goToMenuList() {
      this.$router.push(`/menu/list/${this.restaurantId}`);
    },

    handleScroll() {
      this.showFixedButton = window.scrollY > 500;
    },
  },
};
</script>
