<template>
  <v-container>
    <v-card class="pa-5">
      <!-- 헤더: 타입, 제목, 날짜 한 줄에 -->
      <div class="header-container d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-chip
            :color="announcement.announcementType === 'EVENT' ? 'primary' : 'grey'"
            outlined
            class="mr-4"
            small
          >
            {{ announcement.announcementType === 'EVENT' ? '이벤트' : '공지' }}
          </v-chip>
          <h2 class="title mb-0">{{ announcement.title }}</h2>
        </div>
        <span class="date">{{ formatDate(announcement.createdDate) }}</span>
      </div>

      <!-- 구분선 -->
      <v-divider class="my-4"></v-divider>

      <!-- 본문 내용 -->
      <div class="content-container">
        <p class="content-text">{{ announcement.contents }}</p>
      </div>

      <!-- 이미지가 있는 경우에만 표시 -->
      <div v-if="announcement.images && announcement.images.length > 0" class="mt-4">
        <v-row>
          <v-col
            v-for="(image, index) in announcement.images"
            :key="index"
            cols="12"
            :sm="announcement.announcementType === 'EVENT' ? 12 : 6"
            :md="announcement.announcementType === 'EVENT' ? 8 : 4"
          >
            <v-img 
              :src="image.imagePath" 
              aspect-ratio="1"
              cover
              :class="{ 'event-image': announcement.announcementType === 'EVENT' }"
            ></v-img>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.header-container {
  margin-bottom: 20px;
  width: 100%;
}

.title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  margin-right: 16px;
}

.date {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.content-container {
  margin-top: 20px;
}

.content-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
}

/* 🔹 이벤트 이미지 크기 조절 */
.event-image {
  width: 100%;
  height: auto;
  max-height: 500px; /* 최대 높이 설정 */
  object-fit: cover;
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      announcement: {},
    };
  },
  mounted() {
    this.fetchAnnouncementDetail();
  },
  methods: {
    async fetchAnnouncementDetail() {
      try {
        const announcementId = this.$route.params.id;
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/announcement/detail/${announcementId}`);
        this.announcement = response.data;
      } catch (error) {
        console.error("공지사항 상세 데이터를 불러오는 중 오류 발생", error);
      }
    },
    formatDate(date) {
      if (!date) return '';
      try {
        return new Date(date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (error) {
        console.error('날짜 형식 변환 오류:', error);
        return '';
      }
    }
  }
};
</script>
