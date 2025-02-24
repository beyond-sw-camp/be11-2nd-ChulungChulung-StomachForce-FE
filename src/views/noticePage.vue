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

          <!-- 관리자 버튼 -->
          <div v-if="isAdmin" class="admin-buttons mr-2">
            <v-btn
              small
              text
              color="primary"
              class="mr-2"
              @click="goToUpdatePage(announcement.id)"
            >
              수정
            </v-btn>
            <v-btn
              small
              text
              color="error"
              @click="confirmDelete(announcement.id)"
            >
              삭제
            </v-btn>
          </div>

          <span class="announcement-date">{{ formatDate(announcement.createdDate) }}</span>
        </div>
      </v-list-item>
    </v-list>

    <!-- 글쓰기 버튼과 페이지네이션 영역 -->
    <div class="bottom-container">
      <div class="d-flex justify-space-between align-center">
        <v-pagination 
          v-model="currentPage" 
          :length="totalPages"
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

    <!-- 검색창 -->
    <v-text-field
      v-model="searchQuery"
      append-icon="mdi-magnify"
      label="공지사항 검색"
      single-line
      hide-details
      class="mt-3"
    ></v-text-field>

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
    announcements: [], // 전체 공지사항 데이터
    selectedTab: "all", // 현재 선택된 탭 (전체, 공지, 이벤트)
    searchQuery: "", // 검색어
    currentPage: 1, // 현재 페이지
    itemsPerPage: 5, // 한 페이지에 표시할 항목 수
    userRole: null, // 현재 로그인한 유저의 역할 (admin인지 확인)
    deleteDialog: false, // 삭제 확인 다이얼로그 상태
    selectedAnnouncementId: null, // 선택된 공지사항 ID
  };
},
computed: {
  sortedAnnouncements() {
    // 날짜 기준 내림차순 정렬
    let sorted = [...this.announcements].sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate);
    });

    // 필터링 적용
    let filtered = this.filterAnnouncements(sorted);

    // 페이지네이션을 위한 시작과 끝 인덱스 계산
    let currentPage = this.currentPage;
    if (currentPage > this.totalPages && this.totalPages > 0) {
      currentPage = this.totalPages;
    }
    
    const start = (currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    return filtered.slice(start, end);
  },
  
  filteredAnnouncements() {
    let filtered = this.announcements;

    // 탭 필터링
    if (this.selectedTab === "notice") {
      filtered = filtered.filter(item => item.announcementType === "ANNOUNCE");
    } else if (this.selectedTab === "event") {
      filtered = filtered.filter(item => item.announcementType === "EVENT");
    }

    // 검색 필터링
    if (this.searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // 페이지네이션 적용
    return filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  },

  // 🔹 관리자 권한 여부 확인
  isAdmin() {
    return this.userRole === "ADMIN";
  },

  totalPages() {
    const filteredLength = this.filterAnnouncements(this.announcements).length;
    return Math.max(1, Math.ceil(filteredLength / this.itemsPerPage));
  },
},
watch: {
  // 페이지 수가 변경될 때 현재 페이지 조정
  totalPages: {
    handler(newTotalPages) {
      if (this.currentPage > newTotalPages) {
        this.currentPage = newTotalPages;
      }
    },
    immediate: true
  },

  // selectedTab이 변경될 때마다 페이지 초기화
  selectedTab() {
    this.currentPage = 1;
  },
  
  // 검색어가 변경될 때도 페이지 초기화
  searchQuery() {
    this.currentPage = 1;
  }
},
mounted() {
  this.fetchAnnouncements();
  this.fetchUserRole(); // 🔹 유저 권한 가져오기
},
methods: {
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

  // 🔹 공지사항 상세 페이지로 이동
  goToAnnouncementDetail(id) {
    if (id) {
      this.$router.push(`/notice/${id}`);
    } else {
      console.error("공지사항 ID가 존재하지 않습니다.");
    }
  },

  // 🔹 공지사항 글쓰기 페이지로 이동
  goToCreatePage() {
    this.$router.push("/noticeCreatePage");
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },

  filterAnnouncements(announcements) {
    let filtered = announcements;

    // 탭 필터링
    if (this.selectedTab === "notice") {
      filtered = filtered.filter(item => item.announcementType === "ANNOUNCE");
    } else if (this.selectedTab === "event") {
      filtered = filtered.filter(item => item.announcementType === "EVENT");
    }

    // 검색 필터링
    if (this.searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return filtered;
  },

  // 🔹 공지사항 수정 페이지로 이동
  goToUpdatePage(id) {
    if (id) {
      this.$router.push(`/notice/update/${id}`);
    } else {
      console.error("공지사항 ID가 존재하지 않습니다.");
    }
  },

  // 🔹 공지사항 삭제 확인
  confirmDelete(id) {
    this.selectedAnnouncementId = id;
    this.deleteDialog = true;
  },

  // 🔹 공지사항 삭제
  async deleteAnnouncement() {
    if (!this.selectedAnnouncementId) {
      console.error("❌ 선택된 공지사항 ID가 없습니다.");
      return;
    }

    try {
      // 🔥 DELETE 요청 보내기
      await axios.post(`${process.env.VUE_APP_API_BASE_URL}/announcement/delete/${this.selectedAnnouncementId}`);

      alert("공지사항이 성공적으로 삭제되었습니다.");
      this.deleteDialog = false;
      this.selectedAnnouncementId = null;

      // 🔹 공지사항 목록 새로고침
      this.fetchAnnouncements();
    } catch (error) {
      console.error("❌ 공지사항 삭제 중 오류 발생:", error);
      alert("공지사항 삭제에 실패했습니다.");
    }
  },
},
};
</script>

<style scoped>
.announcement-item {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.announcement-item:hover {
  background-color: #f5f5f5;
}

.d-flex {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-container {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.announcement-title {
  font-size: 16px;
  font-weight: 500;
}

.announcement-date {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}

.admin-buttons {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.w-100 {
  width: 100%;
}

.bottom-container {
  margin: 20px 0;
}

.justify-space-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.pagination {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.write-button {
  margin-left: 20px;
}
</style>
