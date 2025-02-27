<template>
    <v-container class="mb-12">
      <!-- 상단 탭 메뉴 -->
      <div class="tab-wrapper">
        <div class="tab-container">
          <div class="tab-section left-section">
            <div 
              class="tab"
              :class="{ 'active': selectedTab === 'ongoing' }"
              @click="selectedTab = 'ongoing'"
            >
              진행중 이벤트
            </div>
          </div>
          <div class="tab-section right-section">
            <div 
              class="tab"
              :class="{ 'active': selectedTab === 'ended' }"
              @click="selectedTab = 'ended'"
            >
              종료된 이벤트
            </div>
          </div>
        </div>
      </div>
  
      <!-- 이벤트 리스트 -->
      <v-row class="mt-6">
        <v-col
          v-for="event in filteredEvents"
          :key="event.id"
          cols="12"
          sm="6"
        >
          <v-card class="event-card" @click="goToNoticeDetail(event.id)">
            <v-img 
              :src="event.images.length ? event.images[0].imagePath : defaultImage" 
              height="200" 
              class="event-image"
              cover
            ></v-img>
            <v-card-text class="event-info pa-4">
              <h3 class="event-title mb-2">{{ event.title }}</h3>
              <div class="event-date">
                {{ formatDate(event.createdDate) }} ~ {{ formatDate(event.endDate) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        events: [], // 전체 이벤트 목록
        selectedTab: "ongoing", // 기본 선택된 탭
        defaultImage: "https://via.placeholder.com/300x180?text=No+Image", // 기본 이미지
      };
    },
    computed: {
      // 🔹 진행 중 또는 종료된 이벤트 필터링
      filteredEvents() {
        const now = new Date();
        return this.events.filter(event =>
          this.selectedTab === "ongoing"
            ? new Date(event.endDate) >= now
            : new Date(event.endDate) < now
        );
      },
    },
    mounted() {
      this.fetchEvents();
    },
    methods: {
        async fetchEvents() {
        try {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/announcement/list`);
            this.events = response.data.filter(event => event.announcementType === "EVENT");
        } catch (error) {
            console.error("이벤트 데이터를 가져오는 중 오류 발생", error);
        }
        },
        goToNoticeDetail(id) {
        if (id) {
          this.$router.push(`/notice/${id}`);
        } else {
          console.error("이벤트 ID가 존재하지 않습니다.");
        }
      },
      formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // YYYY-MM-DD 형식 변환
      },
    },
  };
  </script>
  
  <style scoped>
  .event-card {
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
  }
  
  .event-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .event-image {
    width: 100%;
    object-fit: cover;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .event-info {
    background: white;
    text-align: center;
  }
  
  .event-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .event-date {
    font-size: 0.9rem;
    color: #666;
    margin-top: 8px;
  }
  
  .tab-wrapper {
    position: relative;
    margin: 20px 0;
  }
  
  .tab-container {
    display: flex;
    position: relative;
    border-bottom: 3px solid #000;
  }
  
  .tab-section {
    flex: 1;
    display: flex;
    justify-content: center;
    position: relative;
  }
  
  .left-section {
    border-right: 1px solid transparent;
  }
  
  .right-section {
    border-left: 1px solid transparent;
  }
  
  .tab {
    padding: 20px 30px;
    font-size: 1.1rem;
    cursor: pointer;
    text-align: center;
    position: relative;
    background: white;
    width: 100%;
    color: #999;
  }
  
  .tab.active {
    font-weight: bold;
    position: relative;
    background: white;
    margin-bottom: -3px;
    color: #000;
  }
  
  /* 진행중 이벤트 탭 */
  .tab-section:first-child .tab.active {
    border-top: 3px solid #000;
    border-left: 3px solid #000;
    border-right: 3px solid #000;
    border-bottom: 3px solid white;
  }
  
  /* 종료된 이벤트 탭 */
  .tab-section:last-child .tab.active {
    border-top: 3px solid #000;
    border-left: 3px solid #000;
    border-right: 3px solid #000;
    border-bottom: 3px solid white;
  }
  </style>