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
    <v-container class="main-content">
      <!-- 레스토랑 이름 -->
      <h1 class="restaurant-title">{{ restaurant.name || "로딩 중..." }}</h1>

      <!-- 매장 사진 섹션 -->
      <div class="photo-gallery" v-if="restaurant.imagePath.length">
        <div class="gallery-container">
          <v-btn 
            icon 
            class="nav-btn prev-btn" 
            @click="prevImage" 
            :disabled="currentIndex === 0"
            elevation="0"
            :ripple="false"
          >
            <div class="btn-hover-effect"></div>
            <v-icon size="42" color="grey-darken-3">mdi-chevron-left</v-icon>
          </v-btn>
          
          <div class="images-container">
            <transition-group name="slide">
              <div v-for="image in paginatedImages" 
                   :key="image" 
                   class="image-card">
                <v-img
                  :src="image"
                  aspect-ratio="1"
                  cover
                  class="gallery-image"
                ></v-img>
              </div>
            </transition-group>
          </div>

          <v-btn 
            icon 
            class="nav-btn next-btn" 
            @click="nextImage" 
            :disabled="currentIndex + imagesPerPage >= restaurant.imagePath.length"
            elevation="0"
            :ripple="false"
          >
            <div class="btn-hover-effect"></div>
            <v-icon size="42" color="grey-darken-3">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- 레스토랑 소개 -->
      <div class="description-section">
        <h2 class="section-title">레스토랑 소개</h2>
        <div class="description-content">
          <p v-if="!isOwner" class="description-text">{{ restaurant.description || "설명이 없습니다." }}</p>
          <textarea v-else v-model="restaurant.description" class="description-input" placeholder="레스토랑 소개를 입력해주세요."></textarea>
        </div>
      </div>

      <!-- 공지사항 섹션 -->
      <div class="notice-section">
        <h2 class="section-title">공지사항</h2>
        <div class="notice-content">
          <div v-if="isOwner" class="add-notice">
            <input v-model="newNoticeText" placeholder="새 공지사항 입력" class="notice-input"/>
            <v-btn color="#FF5722" class="add-btn" @click="addNotice">
              <v-icon left>mdi-plus</v-icon> 추가
            </v-btn>
          </div>
          
          <div class="notice-list">
            <div v-for="(info, index) in restaurantInfos" :key="info.id" class="notice-item">
              <template v-if="isOwner">
                <div class="notice-edit">
                  <input v-model="restaurantInfos[index].informationText" class="notice-input"/>
                  <div class="notice-actions">
                    <v-btn text small @click="updateNotice(info.id, index)" class="action-btn">
                      <v-icon small>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn text small @click="deleteNotice(info.id)" class="action-btn">
                      <v-icon small>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
              <p v-else class="notice-text">{{ info.informationText }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 관리자 섹션 -->
      <div v-if="isOwner" class="admin-section">
        <input 
          v-model="currentPassword" 
          type="password" 
          placeholder="현재 비밀번호 입력"
          class="password-input"
        />
        <v-btn block color="#FF5722" dark class="save-btn" @click="updateRestaurant">
          <v-icon left>mdi-content-save</v-icon> 변경사항 저장
        </v-btn>
      </div>
    </v-container>
  </v-container>
</template>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.restaurant-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 40px;
}

.photo-gallery {
  margin: 40px 0;
}

.gallery-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 60px;
  margin: 0 -40px;
}

.images-container {
  position: relative;
  display: flex;
  gap: 20px;
  overflow: hidden;
  width: 100%;
  justify-content: center;
  min-height: 300px;
}

.image-card {
  flex: 0 0 auto;
  width: calc(25% - 15px);
  max-width: 300px;
  height: 300px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.gallery-image {
  height: 100%;
  width: 100%;
}

.nav-btn {
  position: absolute;
  width: 48px !important;
  height: 48px !important;
  background: transparent !important;
  transition: all 0.2s ease;
  opacity: 0.7;
  overflow: visible !important;
  border-radius: 50% !important;
}

.btn-hover-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: transparent;
  transition: background-color 0.2s ease;
}

.nav-btn:hover .btn-hover-effect {
  background-color: rgba(0, 0, 0, 0.1);
}

.prev-btn {
  left: 0;
}

.next-btn {
  right: 0;
}

.nav-btn.v-btn--disabled {
  opacity: 0 !important;
  pointer-events: none;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 15px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #FF5722;
}

.description-section,
.notice-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.description-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
}

.description-input {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1.1rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.description-input:focus {
  border-color: #FF5722;
  outline: none;
}

.notice-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notice-item {
  padding: 20px;
  border-radius: 10px;
  background-color: #f8f8f8;
  transition: background-color 0.3s ease;
}

.notice-item:hover {
  background-color: #f0f0f0;
}

.notice-edit {
  display: flex;
  gap: 15px;
  align-items: center;
}

.notice-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.notice-input:focus {
  border-color: #FF5722;
  outline: none;
}

.notice-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  color: #FF5722 !important;
}

.add-notice {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.add-btn {
  white-space: nowrap;
  text-transform: none;
  font-weight: 500;
}

.admin-section {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.password-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: border-color 0.3s ease;
}

.password-input:focus {
  border-color: #FF5722;
  outline: none;
}

.save-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  height: 48px;
}

@media (max-width: 960px) {
  .gallery-container {
    padding: 20px 40px;
    margin: 0 -20px;
  }
  
  .nav-btn {
    width: 40px !important;
    height: 40px !important;
  }
  
  .nav-btn .v-icon {
    font-size: 28px;
  }
}

@media (max-width: 600px) {
  .gallery-container {
    padding: 20px 30px;
    margin: 0 -10px;
  }
  
  .nav-btn {
    width: 36px !important;
    height: 36px !important;
  }
  
  .nav-btn .v-icon {
    font-size: 24px;
  }
  
  .restaurant-title {
    font-size: 1.8rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .description-section,
  .notice-section {
    padding: 25px;
  }
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

::v-deep .v-tabs-slider-wrapper {
  display: none;
}

/* 페이드 애니메이션 */
.fade-move {
  transition: transform 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
  position: absolute;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 슬라이드 애니메이션 */
.slide-move {
  transition: transform 0.3s ease;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
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
        description: '',
        imagePath: [], // 이미지 배열
      },
      restaurantInfos: [],
      newNoticeText: "",
      isOwner: false,
      currentPassword: "",
      restaurantId: this.$route.params.id,
      currentIndex: 0,
      imagesPerPage: 4,
    };
  },
  computed: {
    paginatedImages() {
      const start = this.currentIndex;
      const end = Math.min(start + this.imagesPerPage, this.restaurant.imagePath.length);
      return this.restaurant.imagePath.slice(start, end);
    }
  },
  created() {
    this.loadRestaurantDetail();
    this.loadRestaurantInfo();
    this.checkOwnership();
  },
  methods: {
    async loadRestaurantDetail() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${this.restaurantId}`);
        this.restaurant = response.data;
      } catch (e) {
        console.error("레스토랑 상세 정보 로드 실패:", e);
      }
    },
    async loadRestaurantInfo() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/info/list/${this.restaurantId}`);
        this.restaurantInfos = response.data;
      } catch (e) {
        console.error("공지사항 로드 실패:", e);
      }
    },
    async checkOwnership() {
      const token = localStorage.getItem("token");

      // ✅ 토큰이 없으면 API 요청을 보내지 않음
      if (!token) {
        console.warn("🚨 로그인 안 됨 - 소유자 확인 건너뜀");
        return;
      }

      try {
        const userResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.isOwner = userResponse.data.userId === this.restaurant.id;
      } catch (e) {
        console.error("❌ 사용자 정보 로드 실패:", e);
        this.isOwner = false; // 요청 실패 시 기본값 설정
      }
    },
    async updateRestaurant() {
      if (!this.currentPassword) {
        alert("현재 비밀번호를 입력하세요.");
        return;
      }

      try {
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/restaurant/update/${this.restaurantId}`, {
          ...this.restaurant,
          currentPassword: this.currentPassword, // 현재 비밀번호 추가
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("수정이 완료되었습니다.");
      } catch (e) {
        console.error("레스토랑 정보 업데이트 실패:", e);
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
    prevImage() {
      if (this.currentIndex > 0) {
        this.currentIndex = Math.max(0, this.currentIndex - this.imagesPerPage);
      }
    },
    nextImage() {
      if (this.currentIndex + this.imagesPerPage < this.restaurant.imagePath.length) {
        this.currentIndex = Math.min(
          this.currentIndex + this.imagesPerPage,
          this.restaurant.imagePath.length - this.imagesPerPage
        );
      }
    }
  }
};
</script>
