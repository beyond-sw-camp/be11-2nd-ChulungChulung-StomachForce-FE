<template>
  <v-container>
    <!-- 네비게이션 바 -->
    <v-tabs v-model="tab">
      <v-tab :to="`/restaurant/detail/${restaurantId}`">레스토랑 홈</v-tab>
      <v-tab @click="reload()">상세정보</v-tab>
      <v-tab :to="`/menu/list/${restaurantId}`">메뉴</v-tab>
      <v-tab :to="`/restaurant/detail/${restaurantId}/reviews`">리뷰</v-tab>
    </v-tabs>

    <h2 class="text-center title-box">{{ restaurant.name || "로딩 중..." }}</h2>

    <!-- 기본 정보 -->
    <div class="info-container">
      <p>📍 주소: 
        <span v-if="isOwner">
          <input v-model="restaurant.addressCity"/> 
          <input v-model="restaurant.addressStreet"/>
        </span>
        <span v-else>{{ restaurant.addressCity || "주소 없음" }} {{ restaurant.addressStreet || "" }}</span>
      </p>
      <p>📞 전화번호: 
        <span v-if="isOwner">
          <input v-model="restaurant.phoneNumber"/>
        </span>
        <span v-else>{{ restaurant.phoneNumber || '정보 없음' }}</span>
      </p>
      <p>⭐ 평점: {{ restaurant.averageRating || "0" }}</p>
      <p>📌 즐겨찾기: {{ restaurant.bookmarkCount || 0 }}</p>

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
        <li v-for="(info, index) in restaurantInfos" :key="info.id">
          <span v-if="isOwner">
            <input v-model="restaurantInfos[index].informationText" />
            <v-btn @click="updateNotice(info.id, index)">수정</v-btn>
            <v-btn @click="deleteNotice(info.id)">삭제</v-btn>
          </span>
          <span v-else>{{ info.informationText }}</span>
        </li>
      </ul>
      <div v-if="isOwner">
        <input v-model="newNoticeText" placeholder="새 공지사항 입력" />
        <v-btn @click="addNotice">추가</v-btn>
      </div>
    </div>

    <!-- 레스토랑 설명 -->
    <div class="description-box">
      <p v-if="!isOwner">{{ restaurant.description || "설명 없음" }}</p>
      <textarea v-else v-model="restaurant.description"></textarea>
    </div>

    <!-- 현재 비밀번호 입력 -->
    <div v-if="isOwner" class="password-box">
      <label>현재 비밀번호 입력 (정보 변경 시 필요)</label>
      <input v-model="currentPassword" type="password" />
    </div>
    <v-btn v-if="isOwner" block color="black" @click="updateRestaurant">저장하기</v-btn>
    <v-btn block color="black" class="reserve-button">예약하기</v-btn>

    <!-- 매장 사진 (한 줄에 4장 & 한 장씩 넘기기 & 무한 루프) -->
    <v-container v-if="restaurant.imagePath.length"> 
      <div class="info-container">
        매장 사진
      </div><br>
      <v-row class="image-slider" justify="center" align="center">
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
  width: 200px;
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
        addressCity: '',
        addressStreet: '',
        phoneNumber: '',
        averageRating: '',
        bookmarkCount: '',
        description: '',
        imagePath: [], // 이미지 배열
      },
      restaurantInfos: [],
      newNoticeText: "",
      isOwner: false,
      currentPassword: "", // 사용자가 입력한 현재 비밀번호
      restaurantId: this.$route.params.id,
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
