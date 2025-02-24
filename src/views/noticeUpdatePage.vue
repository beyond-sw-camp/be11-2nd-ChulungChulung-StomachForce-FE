<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title>공지사항 수정</v-card-title>
        <v-card-text>
          <!-- 🔹 제목 입력 -->
          <v-text-field v-model="announcement.title" label="제목" required></v-text-field>
  
          <!-- 🔹 타입 선택 (공지 / 이벤트) -->
          <v-select
            v-model="announcement.type"
            :items="[
              { text: '공지사항', value: 'ANNOUNCE' },
              { text: '이벤트', value: 'EVENT' }
            ]"
            item-title="text"
            item-value="value"
            label="유형 선택"
            required
          ></v-select>
  
          <!-- 🔹 이벤트 선택 시 End Date 입력 필드 표시 -->
          <v-menu
            v-if="announcement.type === 'EVENT'"
            v-model="datePicker"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-model="displayDate"
                label="종료 날짜"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="props"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="date"
              no-title
              scrollable
              :min="minDate"
            >
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="datePicker = false">취소</v-btn>
              <v-btn text color="primary" @click="saveDate">확인</v-btn>
            </v-date-picker>
          </v-menu>
  
          <!-- 🔹 내용 입력 -->
          <v-textarea v-model="announcement.contents" label="내용" rows="5" required></v-textarea>
  
          <!-- 🔹 기존 이미지 표시 -->
          <div v-if="announcement.existingImages.length">
            <p>현재 이미지</p>
            <div class="image-preview">
              <v-img
                v-for="(image, index) in announcement.existingImages"
                :key="index"
                :src="image"
                class="preview-img"
                contain
              ></v-img>
            </div>
          </div>
  
          <!-- 🔹 새 이미지 업로드 -->
          <v-file-input v-model="announcement.imagePaths" label="새 이미지 업로드" multiple accept="image/*"></v-file-input>
  
          <!-- 🔹 수정 완료 버튼 -->
          <v-btn
            color="primary"
            class="mt-3"
            :disabled="!isFormValid"
            @click="updateAnnouncement"
          >
            수정 완료
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        announcement: {
          id: null,
          title: "",
          contents: "",
          type: "ANNOUNCE", // 기본값: 공지사항
          endDate: null, // 이벤트일 때만 입력
          existingImages: [], // 기존 이미지 URL 리스트
          imagePaths: [] // 새로 업로드할 이미지 파일들
        },
        datePicker: false, // 종료 날짜 입력 창 상태
        date: null,
        minDate: null,
        displayDate: null,
      };
    },
    computed: {
      // 🔹 종료 날짜 포맷 변환
      formattedEndDate() {
        return this.announcement.endDate ? new Date(this.announcement.endDate).toLocaleDateString() : "";
      },
  
      // 🔹 입력 값 유효성 체크
      isFormValid() {
        return this.announcement.title.trim() !== "" && this.announcement.contents.trim() !== "";
      },
    },
    mounted() {
      this.fetchAnnouncement();
    },
    methods: {
      // 🔹 기존 공지사항 데이터 가져오기
      async fetchAnnouncement() {
        const announcementId = this.$route.params.id;
        if (!announcementId) {
          alert("잘못된 접근입니다.");
          this.$router.push("/notice");
          return;
        }
  
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/announcement/detail/${announcementId}`);
          const data = response.data;
  
          this.announcement.id = data.id;
          this.announcement.title = data.title;
          this.announcement.contents = data.contents;
          this.announcement.type = data.type;
          this.announcement.endDate = data.endTime ? new Date(data.endTime).toISOString() : null;
          this.announcement.existingImages = data.images.map(img => img.imagePath);
        } catch (error) {
          console.error("공지사항 정보를 가져오는 중 오류 발생", error);
          alert("공지사항을 불러올 수 없습니다.");
          this.$router.push("/notice");
        }
      },
  
      // 🔹 종료 날짜 포맷 변환
      formatEndDate(value) {
        this.announcement.endDate = new Date(value).toISOString();
      },
  
      // 🔹 공지사항 업데이트 요청
      async updateAnnouncement() {
        try {
          const formData = new FormData();
          formData.append("title", this.announcement.title);
          formData.append("contents", this.announcement.contents);
          formData.append("status", "ON"); // 상태는 기본적으로 유지
          formData.append("type", this.announcement.type);
          
          // 🔹 이벤트 타입일 경우 종료 날짜 추가
          if (this.announcement.type === "EVENT" && this.announcement.endDate) {
            formData.append("endDate", this.announcement.endDate);
          }
  
          // 🔹 이미지 업로드
          if (this.announcement.imagePaths.length) {
            this.announcement.imagePaths.forEach(file => {
              formData.append("images", file);
            });
          }
  
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/announcement/update/${this.announcement.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
  
          alert("공지사항이 성공적으로 수정되었습니다.");
          this.$router.push("/notice");
        } catch (error) {
          console.error("공지사항 수정 중 오류 발생", error);
          alert("공지사항 수정에 실패했습니다.");
        }
      },
      saveDate() {
        this.datePicker = false;
        this.announcement.endDate = this.date ? new Date(this.date).toISOString() : null;
        this.displayDate = this.date ? new Date(this.date).toLocaleDateString() : "";
      }
    }
  };
  </script>
  
  <style scoped>
  .v-card {
    max-width: 600px;
    margin: auto;
  }
  
  .image-preview {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .preview-img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }
  </style>  
