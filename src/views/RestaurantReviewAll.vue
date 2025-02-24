<template>
    <v-container>
      <h2 class="text-center title-box">리뷰</h2>
      
      <div v-for="review in reviews" :key="review.id" class="review-box">
        <div class="review-header">
          <v-img :src="review.userProfileImage" class="profile-image"></v-img>
          <strong>{{ review.userName }}</strong>
        </div>
  
        <div class="review-content">
          <v-img v-for="(image, index) in review.images" 
                 :key="index" :src="image" class="review-image"></v-img>
          <p class="review-text">{{ review.comment }}</p>
        </div>
      </div>
  
      <v-btn block color="black" class="reserve-button">예약하기</v-btn>
    </v-container>
  </template>
  
  <style scoped>
  .title-box {
    background-color: #f8e4c3;
    padding: 15px;
    border-radius: 10px;
  }
  
  .review-box {
    background: #fff;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
  }
  
  .review-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .profile-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  
  .review-content {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
  
  .review-image {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    object-fit: cover;
  }
  
  .review-text {
    flex-grow: 1;
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
        reviews: []
      };
    },
    created() {
      this.loadReviews();
    },
    methods: {
      async loadReviews() {
        const restaurantId = this.$route.params.id;
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/reviews/${restaurantId}`);
          this.reviews = response.data;
        } catch (e) {
          console.error("리뷰 데이터 로드 실패:", e);
        }
      }
    }
  };
  </script>