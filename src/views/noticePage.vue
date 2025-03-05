<template>
  <v-container>
    <!-- 상단 탭 메뉴 -->
    <v-tabs v-model="selectedTab" background-color="white" class="mt-3">
      <v-tab value="all">전체</v-tab>
      <v-tab value="notice">공지</v-tab>
      <v-tab value="event">이벤트</v-tab>
    </v-tabs>

    <!-- 공지사항 리스트 -->
    <v-list>
      <v-list-item
        v-for="announcement in sortedAnnouncements"
        :key="announcement.id"
        class="announcement-item"
      >
        <div class="d-flex align-center w-100">
          <!-- 왼쪽: 타입 칩과 제목 -->
          <div class="d-flex align-center flex-grow-1">
            <v-chip
              class="mr-2"
              :color="announcement.announcementType === 'EVENT' ? 'blue' : 'grey'"
              outlined
              small
            >
              {{ announcement.announcementType === 'EVENT' ? '이벤트' : '공지' }}
            </v-chip>
            
            <div class="title-container" @click="goToAnnouncementDetail(announcement.id)">
              <span class="announcement-title">{{ announcement.title }}</span>
            </div>
          </div>

          <!-- 오른쪽: 관리자 버튼과 날짜 -->
          <div class="d-flex align-center">
            <div v-if="isAdmin" class="admin-buttons mr-4">
              <v-btn small text color="primary" class="mr-2" @click="goToUpdatePage(announcement.id)">
                수정
              </v-btn>
              <v-btn small text color="error" @click="confirmDelete(announcement.id)">
                삭제
              </v-btn>
            </div>
            <span class="announcement-date grey--text text--darken-1">
              {{ formatDate(announcement.createdDate) }}
            </span>
          </div>
        </div>
      </v-list-item>
    </v-list>

    <!-- 글쓰기 버튼과 페이지네이션 영역 -->
    <div class="bottom-container mt-6 mb-8">
      <div class="pagination-container">
        <v-pagination 
          v-model="currentPage" 
          :length="totalPages"
          :total-visible="5"
          class="pagination"
        ></v-pagination>
        <v-btn
          v-if="isAdmin"
          color="primary"
          @click="goToCreatePage"
          class="write-button"
        >
          글쓰기
        </v-btn>
      </div>
    </div>

    <!-- 🔹 검색창 -->
    <div class="search-container my-6">
      <div class="search-bar">
        <img 
          src="@/assets/stomach.png" 
          alt="뱃살력 로고" 
          class="search-logo"
        />
        <input 
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="공지사항 검색"
          @keyup.enter="search"
        />
        <v-icon class="search-icon">mdi-magnify</v-icon>
      </div>
    </div>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="300">
      <v-card>
        <v-card-title class="headline">삭제 확인</v-card-title>
        <v-card-text>정말로 이 공지사항을 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">취소</v-btn>
          <v-btn color="error" text @click="deleteAnnouncement">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
data() {
  return {
    announcements: [],
    selectedTab: "all",
    searchQuery: "",
    currentPage: 1,
    itemsPerPage: 5,
    userRole: null,
    deleteDialog: false,
    selectedAnnouncementId: null,
  };
},
computed: {
  sortedAnnouncements() {
    let sorted = [...this.announcements].sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate);
    });

    let filtered = this.filterAnnouncements(sorted);
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    return filtered.slice(start, end);
  },
  
  isAdmin() {
    return this.userRole === "ADMIN";
  },

  totalPages() {
    const filteredLength = this.filterAnnouncements(this.announcements).length;
    return Math.max(1, Math.ceil(filteredLength / this.itemsPerPage));
  },
},
mounted() {
  this.fetchAnnouncements();
  this.fetchUserRole();
},
methods: {
  goToUpdatePage(id) {
    if(id) {
      this.$router.push(`/notice/update/${id}`);
    }
  },
  async confirmDelete(id) {
    if(id) {
      await axios.post(`${process.env.VUE_APP_API_BASE_URL}/announcement/delete/${id}`);
      alert("삭제되었습니다.")
      window.location.reload();
    }
  },
  async fetchAnnouncements() {
    try {
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/announcement/list`);
      this.announcements = response.data;
    } catch (error) {
      console.error("공지사항 데이터를 가져오는 중 오류 발생", error);
    }
  },
  
  async fetchUserRole() {
    try {
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/me`);
      this.userRole = response.data.role;
    } catch (error) {
      console.error("유저 정보를 가져오는 중 오류 발생", error);
    }
  },

  goToAnnouncementDetail(id) {
    if (id) {
      this.$router.push(`/notice/${id}`);
    }
  },

  goToCreatePage() {
    this.$router.push("/noticeCreatePage");
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },

  filterAnnouncements(announcements) {
    let filtered = announcements;

    if (this.selectedTab === "notice") {
      filtered = filtered.filter(item => item.announcementType === "ANNOUNCE");
    } else if (this.selectedTab === "event") {
      filtered = filtered.filter(item => item.announcementType === "EVENT");
    }

    if (this.searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return filtered;
  },
},
};
</script>

<style scoped>
/* 🔹 검색창 스타일 */
.search-container {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  height: 44px;
  padding: 4px 10px;
  gap: 6px;
  max-width: 500px;
  width: 100%;
  border: 2px solid #F04E23;
}

.search-logo {
  height: 37px; /* 🔥 기존보다 살짝 줄임 */
  margin-left: 1px; /* 🔥 테두리에 더 가깝게 */
  margin-right: 8px; /* 🔥 기존보다 살짝 더 붙임 */
}

.search-input {
  flex: 1;
  height: 100%;
  background: white;
  border-radius: 50px;
  padding: 0 12px;
  font-size: 14px;
  color: black;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.search-icon {
  color: #F04E23;
  margin-right: 10px; /* 🔥 기존보다 살짝 붙임 */
  cursor: pointer;
}

/* 🔹 공지사항 스타일 */
.announcement-item {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.title-container {
  flex-grow: 1;
  cursor: pointer;
}

.announcement-title {
  font-size: 16px;
  color: #333;
}

.announcement-date {
  font-size: 14px;
  white-space: nowrap;
}

.admin-buttons {
  white-space: nowrap;
}

/* 🔹 페이지네이션 컨테이너 스타일 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  width: 100%;
}

.write-button {
  align-self: flex-end;
}

/* 하단 여백 */
.bottom-container {
  margin-bottom: 60px;
}
</style>
