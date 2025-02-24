<template>
    <v-container fluid class="vip-container pa-0">
      <!-- Header Section -->
      <div class="header-section mb-8">
        <div class="header-content text-center pa-12">
          <h1 class="text-h3 font-weight-bold mb-6">VIP MEMBERSHIP</h1>
          <div class="vip-grade-container mb-4">
            <div class="vip-grade-wrapper">
              <span class="vip-label">내 VIP 등급 : </span>
              <span class="vip-grade">{{ vipBenefits[0]?.vipGrade }}</span>
            </div>
          </div>
          <p class="text-subtitle-1 mt-4">특별한 혜택과 함께 프리미엄 서비스를 경험하세요</p>
        </div>
        <div class="header-wave"></div>
      </div>
  
      <!-- Benefits Section -->
      <v-row justify="center" class="benefits-section">
        <v-col cols="12" md="10">
          <v-row>
            <v-col 
              v-for="(benefit, index) in vipBenefits" 
              :key="index" 
              cols="12" sm="6" md="4"
              class="benefit-col"
            >
              <v-card class="benefit-card" elevation="0" rounded="lg">
                <v-img
                  :src="benefit.benefitPhoto"
                  height="200"
                  cover
                  class="benefit-image"
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-2"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
                
                <v-card-text class="pa-6">
                  <h3 class="text-h6 font-weight-bold mb-2">{{ benefit.title }}</h3>
                  <p class="text-body-2 text-grey-darken-1">
                    {{ benefit.contents || '프리미엄 서비스를 경험해보세요' }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
  
      <!-- Loading Indicator -->
      <v-row justify="center" class="my-4" v-if="isLoading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'UserVipBenefit',
    data() {
      return {
        vipBenefits: [],
        currentPage: 0,
        totalPages: 0,
        isLoading: false
      }
    },
    created() {
      this.loadVipBenefits();
      window.addEventListener("scroll", this.scrollPagination);
    },
    beforeUnmount() {
      window.removeEventListener("scroll", this.scrollPagination);
    },
    methods: {
      async loadVipBenefits() {
        if (this.isLoading) return;
        this.isLoading = true;
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myVip`, {
            params: {
              page: this.currentPage,
              size: 6
            }
          });
          // 서버가 Page 객체 형식으로 반환한다고 가정 (예: { content: [...], totalPages: N, ... })
          const data = response.data;
          if (this.currentPage === 0) {
            this.vipBenefits = data.content;
          } else {
            this.vipBenefits = [...this.vipBenefits, ...data.content];
          }
          this.totalPages = data.totalPages;
          this.currentPage++;
        } catch (error) {
          console.error("VIP 혜택 데이터를 불러오는 데 실패했습니다.", error);
        }
        this.isLoading = false;
      },
      scrollPagination() {
        const threshold = 200;
        if (
          window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold &&
          !this.isLoading &&
          this.currentPage < this.totalPages
        ) {
          this.loadVipBenefits();
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .vip-container {
    background-color: #fafafa;
    min-height: 100vh;
  }
  
  .header-section {
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    color: white;
    position: relative;
    overflow: hidden;
  }
  
  .header-content {
    position: relative;
    z-index: 2;
  }
  
  .header-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
    z-index: -1;
  }
  
  .vip-grade-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
  }
  
  .vip-grade-wrapper {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .vip-label {
    font-size: 1.1rem;
    font-weight: 500;
    margin-right: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .vip-grade {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: #fafafa;
    clip-path: polygon(0 50%, 100% 0, 100% 100%, 0% 100%);
  }
  
  .text-h3 {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    letter-spacing: 1px;
  }
  
  .text-subtitle-1 {
    font-weight: 400;
    opacity: 0.9;
  }
  
  @media (max-width: 600px) {
    .header-content {
      padding: 2rem 1rem !important;
    }
    .text-h3 {
      font-size: 2rem !important;
    }
    .vip-grade-wrapper {
      padding: 0.75rem 1.5rem;
    }
    .vip-label {
      font-size: 1rem;
    }
    .vip-grade {
      font-size: 1.25rem;
    }
  }
  
  .benefits-section {
    position: relative;
    z-index: 1;
  }
  
  .benefit-col {
    padding: 16px;
  }
  
  .benefit-card {
    background-color: white;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    height: 100%;
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .image-container {
    background-color: #f5f5f5;
    width: 100%;
  }
  
  .benefit-image {
    width: 100%;
    object-fit: cover;
  }
  
  .card-content {
    background-color: white;
  }
  
  .benefit-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 600px) {
    .benefit-col {
      padding: 8px;
    }
  }
  </style>
  