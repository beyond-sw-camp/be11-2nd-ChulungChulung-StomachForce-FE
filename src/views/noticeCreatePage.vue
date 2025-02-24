<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title>공지사항 작성</v-card-title>
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
                v-model="formattedEndDate"
                label="종료 날짜"
                readonly
                v-bind="props"
              ></v-text-field>
            </template>
            <v-date-picker v-model="announcement.endDate"></v-date-picker>
          </v-menu>
  
          <!-- 🔹 내용 입력 (빈 값 허용) -->
          <v-textarea v-model="announcement.contents" label="내용" rows="5"></v-textarea>
  
          <!-- 🔹 이미지 업로드 -->
          <v-file-input v-model="announcement.imagePaths" label="첨부파일" multiple accept="image/*"></v-file-input>
  
          <!-- 🔹 작성 완료 버튼 -->
          <v-btn
            color="primary"
            class="mt-3"
            :disabled="!isFormValid"
            @click="submitAnnouncement"
          >
            작성 완료
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
        title: "",
        contents: "", // 🔹 빈 값 허용
        type: "ANNOUNCE", // 기본값: 공지
        imagePaths: [],
        endDate: null, // 이벤트일 때만 입력
      },
      datePicker: false, // 종료 날짜 입력 창 상태
    };
  },
  computed: {
    // 🔹 종료 날짜 포맷 변환
    formattedEndDate() {
      return this.announcement.endDate ? new Date(this.announcement.endDate).toLocaleDateString() : "";
    },

    // 🔹 제목만 필수 입력 (내용 공백 가능)
    isFormValid() {
      return this.announcement.title.trim() !== "";
    },
  },
  methods: {
    async submitAnnouncement() {
      try {
        const formData = new FormData();
        formData.append("title", this.announcement.title);
        formData.append("contents", this.announcement.contents || ""); // 🔹 공백도 허용
        formData.append("type", this.announcement.type);

        // 🔹 이벤트 타입일 경우 종료 날짜 추가
        if (this.announcement.type === "EVENT" && this.announcement.endDate) {
          formData.append("endDate", this.announcement.endDate.toISOString());
          console.log("✅ 전송할 endDate (ISO 8601):", this.announcement.endDate.toISOString()); // ✅ 디버깅 추가
        } else {
          console.warn("⚠️ `endDate`가 설정되지 않았습니다!");
        }

        // 🔹 이미지 업로드
        if (this.announcement.imagePaths.length) {
          this.announcement.imagePaths.forEach(file => {
            formData.append("imagePaths", file);
          });
        }

        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/announcement/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("공지사항이 등록되었습니다.");
        this.$router.push("/notice");
      } catch (error) {
        console.error("공지사항 등록 중 오류 발생", error);
        alert("공지사항 등록에 실패했습니다.");
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  max-width: 600px;
  margin: auto;
}
</style>
