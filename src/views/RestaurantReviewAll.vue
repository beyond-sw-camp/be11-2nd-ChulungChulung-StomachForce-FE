<template>
  <v-container class="pa-0" fluid>
    <!-- 네비게이션 바 -->
    <div class="navigation-wrapper">
      <v-container>
        <v-tabs v-model="tab" background-color="transparent" color="#FF5722">
          <v-tab :to="`/restaurant/detail/${restaurantId}`" class="custom-tab">레스토랑 홈</v-tab>
          <v-tab @click="reload()" class="custom-tab">상세정보</v-tab>
          <v-tab :to="`/menu/list/${restaurantId}`" class="custom-tab">메뉴</v-tab>
          <v-tab :to="`/restaurant/detail/${restaurantId}/reviews`" class="custom-tab">리뷰</v-tab>
        </v-tabs>
      </v-container>
    </div>

    <!-- 메인 컨텐츠 -->
    <v-container class="pa-0" fluid>
      <v-container >
        <div class="review-header">
          <h2>리뷰</h2>
          <div class="review-stats">
            <v-rating
              :model-value="averageRating"
              color="amber"
              half-increments
              readonly
              size="24"
            ></v-rating>
            <span class="review-count">
              평균 {{ averageRating.toFixed(1) }} · 총 {{ reviews.length }}개의 리뷰
            </span>
          </div>
        </div>

        <v-row>
          <v-col v-for="review in reviews" :key="review.id" cols="12">
            <v-card class="review-card">
              <div class="review-card-header">
                <div class="user-info">
                  <v-avatar size="40">
                    <v-img :src="review.userProfileImage || '/assets/default-profile.jpg'" />
                  </v-avatar>
                  <div class="user-details">
                    <div class="user-name">{{ review.userIdentify }}</div>
                    <v-rating
                      v-model="review.rating"
                      readonly
                      color="amber"
                      dense
                      half-increments
                      size="16"
                    ></v-rating>
                  </div>
                </div>
                <div class="review-date">{{ formatDate(review.createdTime) }}</div>
                <div class="review-actions">
                  <v-btn
                  v-if="isMyReview(review)"
                  icon
                  size="small"
                  class="action-btn edit-btn"
                  @click="editReview(review)"
                >
                  <v-icon size="18">mdi-pencil-outline</v-icon>
                </v-btn>

                <v-btn
                  v-if="isMyReview(review)"
                  icon
                  size="small"
                  class="action-btn delete-btn"
                  @click="deleteReview(review.id)"
                >
                  <v-icon size="18">mdi-trash-can-outline</v-icon>
                </v-btn>
                </div>
              </div>

              <div class="review-content" v-if="review.contents">
                {{ review.contents }}
              </div>

              <v-row class="review-photos" v-if="review.reviewPhotos.length">
                <v-col v-for="(image, index) in review.reviewPhotos" 
                      :key="index" 
                      cols="4" 
                      sm="3" 
                      md="2">
                  <v-img
                    :src="image"
                    aspect-ratio="1"
                    cover
                    class="review-photo"
                    @click="openImage(image)"
                  ></v-img>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <!-- 무한 스크롤 트리거 -->
        <div ref="scrollTrigger" class="scroll-trigger"></div>
        <v-dialog v-model="editDialog" max-width="600px">
          <v-card>
            <v-card-title>리뷰 수정</v-card-title>
            <v-card-text>
              <v-textarea v-model="editReviewData.contents" label="리뷰 내용"></v-textarea>
              <v-rating v-model="editReviewData.rating" color="amber"></v-rating>
              <v-file-input multiple v-model="editReviewData.newPhotos" label="새로운 사진 추가"></v-file-input>
              <div v-if="editReviewData.reviewPhotos.length">
                <p>기존 사진</p>
                <v-row>
                  <v-col v-for="(photo, index) in editReviewData.reviewPhotos" :key="index" cols="3">
                    <v-img :src="photo" class="review-photo"></v-img>
                    <v-btn small color="red" @click="removePhoto(photo)">삭제</v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="updateReview">수정</v-btn>
              <v-btn @click="editDialog = false">취소</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="imageDialog" max-width="90vw">
          <v-card>
            <v-img :src="selectedImage" max-height="90vh" contain></v-img>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn icon @click="imageDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-container>
  </v-container>
</template>

---

### **💄 스타일 (SCSS)**
```vue
<style scoped>
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

::v-deep .v-tabs-slider-wrapper {
  display: none;
}

.review-header {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.review-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.review-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-count {
  color: #666;
  font-size: 14px;
}

.review-card {
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease;
  background: linear-gradient(to right bottom, #ffffff, #fafafa);
  position: relative;
  overflow: hidden;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-color: #e0e0e0;
}

.review-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #FFA000, #FFD54F);
}

.review-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
  color: #424242;
  letter-spacing: 0.3px;
}

.review-date {
  color: #666;
  font-size: 13px;
}

.review-content {
  margin: 16px 0;
  line-height: 1.6;
  color: #424242;
  font-size: 15px;
  padding: 0 4px;
}

.review-photos {
  margin-top: 16px;
}

.review-photo {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.review-photo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.reserve-button {
  font-size: 16px;
  padding: 12px !important;
  letter-spacing: 1px;
}

.review-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background-color: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.edit-btn {
  color: #4caf50; /* 연한 녹색 */
}

.edit-btn:hover {
  background-color: rgba(76, 175, 80, 0.2); /* 연한 녹색 배경 */
}

.delete-btn {
  color: #f44336; /* 연한 빨강 */
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.2); /* 연한 빨강 배경 */
}

/* 태블릿 & 모바일 반응형 */
@media (max-width: 960px) {
  .review-card {
    padding: 16px;
  }
  
  .review-header {
    padding: 16px;
  }
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      reviews: [],
      totalReviews: 0,
      page: 0,
      pageSize: 5,
      isLoading: false,
      isLastPage: false,
      editDialog: false,
      editReviewData: {},
      imageDialog: false,
      selectedImage: "",
      restaurantId: this.$route.params.id,
      observer: null,
    };
  },
  computed: {
    averageRating() {
      if (this.reviews.length === 0) return 0;
      const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
      return sum / this.reviews.length;
    }
  },
  async created() {
    this.loadReviews();
    window.addEventListener('scroll', this.scrollPagination);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.scrollPagination);
  },
  methods: {
    async loadReviews() {
      if (this.isLoading || this.isLastPage) return;

      this.isLoading = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/${this.restaurantId}/review/list`,
          { params: { page: this.page, size: this.pageSize } }
        );

        // 응답 데이터를 검증 후 reviews에 저장
        const newReviews = response.data?.content || response.data || [];

        if (!Array.isArray(newReviews)) {
          console.error("❌ 리뷰 데이터가 배열이 아닙니다:", newReviews);
          return;
        }

        if (newReviews.length === 0) {
          console.log("📌 더 이상 불러올 리뷰가 없습니다.");
          this.isLastPage = true; // ✅ 마지막 페이지 표시
          return;
        }

        // 기존 리뷰 ID 저장
        const existingIds = new Set(this.reviews.map(r => r.id));

        // 새로운 리뷰 중 기존 ID가 없는 것만 필터링
        const uniqueNewReviews = newReviews.filter(r => !existingIds.has(r.id));

        if (uniqueNewReviews.length === 0) {
          console.log("📌 중복된 데이터가 감지되어 추가하지 않음");
          this.isLastPage = true;
          return;
        }

        this.reviews.splice(this.reviews.length, 0, ...uniqueNewReviews); // ✅ 중복 없는 데이터만 추가
        console.log("📌 최종 reviews 상태:", this.reviews);

        this.page++; // ✅ 다음 페이지 증가
      } catch (e) {
        console.error("❌ 리뷰 데이터 로드 실패:", e);
      } finally {
        this.isLoading = false;
      }
    },
    scrollPagination() {
      if (this.isLoading || this.isLastPage) return; // ✅ 마지막 페이지면 실행 중단

      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (isBottom && !this.isLoading && !this.isLastPage) {
        this.loadReviews();
      }
    },
    editReview(review) {
      this.editReviewData = { ...review, newPhotos: [] };
      this.editDialog = true;
    },
    async updateReview() {
      try {
        const formData = new FormData();
        formData.append("contents", this.editReviewData.contents);
        formData.append("rating", this.editReviewData.rating);
        this.editReviewData.newPhotos.forEach(photo => formData.append("reviewPhotos", photo));

        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/${this.restaurantId}/review/${this.editReviewData.id}/update`,
          formData
        );

        this.editDialog = false;
        this.reloadReviews();
      } catch (e) {
        console.error("❌ 리뷰 수정 실패:", e);
      }
    },
    async deleteReview(reviewId) {
      if (!confirm("리뷰를 삭제하시겠습니까?")) return;
      try {
        await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/${this.restaurantId}/review/${reviewId}/delete`
        );
        this.reloadReviews();
      } catch (e) {
        console.error("❌ 리뷰 삭제 실패:", e);
      }
    },
    reloadReviews() {
      this.page = 0;
      this.reviews = [];
      this.isLastPage = false;
      this.loadReviews();
    },
    isMyReview(review) {
      const storedUserName = localStorage.getItem("userName"); 
      if (!storedUserName) return false;
      return storedUserName === review.userIdentify;
    },
    removePhoto(photoUrl) {
      this.editReviewData.reviewPhotos = this.editReviewData.reviewPhotos.filter(p => p !== photoUrl);
    },
    reload() {
      window.location.reload();
    },
    // 이미지 클릭 시 확대 모달 열기
    openImage(imageUrl) {
      this.selectedImage = imageUrl;
      this.imageDialog = true;
    },
    formatDate(createdTime) {
      if (!createdTime) return '';
      const date = new Date(createdTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    },
  },
};
</script>