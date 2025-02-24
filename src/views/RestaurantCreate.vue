<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8">
        <v-card>
          <v-card-title class="text-h5 text-center">회원가입</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="create">
              <v-row>
                <!-- 매장명 -->
                <v-col cols="12" md="6">
                  <v-text-field label="매장명" v-model="name" prepend-icon="mdi-store" required />
                </v-col>

                <!-- 사업자등록번호 -->
                <v-text-field
                label="사업자등록번호"
                v-model="registrationNumber"
                prepend-icon="mdi-card-account-details"
                required
                @input="formatRegistrationNumber"
                maxlength="12"
                />

                <!-- 비밀번호 -->
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="비밀번호" 
                    v-model="password" 
                    type="password" 
                    prepend-icon="mdi-lock" 
                    required 
                  />
                </v-col>

                <!-- 이메일 -->
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="이메일" 
                    v-model="email" 
                    type="email" 
                    prepend-icon="mdi-email" 
                    required 
                  />
                </v-col>

                <!-- 전화번호 -->
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="연락처 (대표번호)" 
                    v-model="phoneNumber" 
                    prepend-icon="mdi-phone" 
                    v-mask="'###-####-####'"
                    required 
                  />
                </v-col>

                <!-- 주류 판매 여부 -->
                <v-col cols="12" md="6">
                  <v-radio-group v-model="alcoholSelling" inline>
                    <div class="text-subtitle-1 font-weight-medium mb-2">주류 판매 여부</div>
                    <v-radio label="예" value="YES"></v-radio>
                    <v-radio label="아니오" value="NO"></v-radio>
                  </v-radio-group>
                </v-col>

                <!-- 가게 설명 -->
                <v-col cols="12">
                  <v-textarea 
                    label="매장 설명" 
                    v-model="description" 
                    rows="4"
                    counter 
                    maxlength="3000" 
                    prepend-icon="mdi-text" 
                    required 
                  />
                </v-col>

                <!-- 예약금 여부 -->
                <v-col cols="12" md="6">
                  <v-radio-group v-model="depositAvailable" row>
                    <div class="text-subtitle-1 font-weight-medium mb-2">예약금 여부</div>
                    <div> </div>
                    <v-radio label="예" value="YES"></v-radio>
                    <v-radio label="아니오" value="NO"></v-radio>
                  </v-radio-group>
                </v-col>

                <!-- 예약금 (조건부 활성화) -->
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="예약금" 
                    v-model="deposit" 
                    prepend-icon="mdi-cash" 
                    type="number" 
                    :disabled="depositAvailable === 'NO'" 
                    required 
                  />
                </v-col>

                <!-- 영업시간 -->
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="여는 시간" 
                    v-model="openingTime" 
                    type="time" 
                    prepend-icon="mdi-clock" 
                    required 
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="닫는 시간" 
                    v-model="closingTime" 
                    type="time" 
                    prepend-icon="mdi-clock-outline" 
                    required 
                  />
                </v-col>

                <!-- 브레이크 타임 -->
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="브레이크 타임 시작" 
                    v-model="breakTimeStart" 
                    type="time" 
                    prepend-icon="mdi-timer"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field 
                    label="브레이크 타임 종료" 
                    v-model="breakTimeEnd" 
                    type="time" 
                    prepend-icon="mdi-timer-off"
                  />
                </v-col>

                <!-- 라스트 오더 -->
                <v-col cols="12">
                  <v-text-field 
                    label="라스트 오더" 
                    v-model="lastOrder" 
                    type="time" 
                    prepend-icon="mdi-food" 
                    required 
                  />
                </v-col>

                <!-- 휴무일 -->
                <v-col cols="12">
                  <v-text-field 
                    label="휴무일 (월/일)" 
                    v-model="holiday" 
                    type="date" 
                    prepend-icon="mdi-calendar" 
                    required 
                  />
                </v-col>

                <!-- 최대 수용 인원 -->
                <v-col cols="12">
                  <v-select 
                    label="최대 수용 인원" 
                    v-model="capacity" 
                    :items="[10, 20, 30, 40, 50, 100]" 
                    prepend-icon="mdi-account-group"
                    required 
                  />
                </v-col>

                <!-- 레스토랑 타입 선택 -->
                <v-col cols="12">
                  <div class="text-h6 mb-2">매장 테마</div>
                  <v-btn-toggle v-model="restaurantType" mandatory class="d-flex flex-wrap">
                    <v-btn value="KOREAN">한식</v-btn>
                    <v-btn value="CHINESE">중식</v-btn>
                    <v-btn value="JAPANESE">일식</v-btn>
                    <v-btn value="WESTERN">양식</v-btn>
                    <v-btn value="FUSION">퓨전</v-btn>
                  </v-btn-toggle>
                </v-col>

                <!-- 주소 -->
                <v-col cols="12" md="6">
                  <v-text-field label="주소 - 시" v-model="addressCity" prepend-icon="mdi-map-marker" required />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="주소 - 세부 주소" v-model="addressStreet" prepend-icon="mdi-map-marker-outline" required />
                </v-col>

                <!-- 사진 업로드 및 미리보기 -->
                <v-col cols="12">
                  <v-file-input 
                    label="매장 이미지 업로드" 
                    accept="image/*" 
                    multiple 
                    @change="fileUpload"
                    prepend-icon="mdi-camera"
                  />
                </v-col>

                <v-col cols="12">
                  <v-row>
                    <v-col v-for="(image, index) in imagePreviews" :key="index" cols="4">
                      <v-img :src="image" aspect-ratio="1" class="rounded-lg" />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- 가입 버튼 -->
                <v-col cols="12">
                  <v-btn color="red" block @click="create">등록</v-btn>
                </v-col>
              </v-row>
            </v-form>
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
      name: "",
      registrationNumber: "",
      password: "",
      email: "",
      phoneNumber: "",
      alcoholSelling: "YES", // 기본값 "예"
      description: "",
      depositAvailable: "NO", // 기본값 "아니오"
      deposit: "",
      openingTime: "",
      closingTime: "",
      breakTimeStart: "",
      breakTimeEnd: "",
      lastOrder: "",
      holiday: "",
      capacity: 10,
      restaurantType: "KOREAN", // 기본값 "한식"
      addressCity: "",
      addressStreet: "",
      restaurantPhotos: [], // 업로드할 사진 파일 배열
      imagePreviews: [] // 이미지 미리보기 URL 배열
    };
  },
  methods: {
    async create() {
      try {
        const formData = new FormData();

        // 문자열 데이터 추가
        formData.append("name", this.name);
        formData.append("registrationNumber", this.registrationNumber);
        formData.append("password", this.password);
        formData.append("email", this.email);
        formData.append("phoneNumber", this.phoneNumber);
        formData.append("alcoholSelling", this.alcoholSelling);
        formData.append("description", this.description);
        formData.append("depositAvailable", this.depositAvailable);
        if (this.depositAvailable === "YES") {
          formData.append("deposit", this.deposit);
        }

        // 시간 관련 필드 변환 (YYYY-MM-DDTHH:mm:ss)
        formData.append("openingTime", this.formatTime(this.openingTime));
        formData.append("closingTime", this.formatTime(this.closingTime));
        formData.append("breakTimeStart", this.formatTime(this.breakTimeStart));
        formData.append("breakTimeEnd", this.formatTime(this.breakTimeEnd));
        formData.append("lastOrder", this.formatTime(this.lastOrder));

        formData.append("holiday", this.holiday);
        formData.append("capacity", this.capacity);
        formData.append("restaurantType", this.restaurantType);

        // 주소 데이터 (JSON이 아니라 개별 필드로 전송)
        formData.append("address.city", this.addressCity);
        formData.append("address.street", this.addressStreet);

        // 파일 데이터 추가
        this.restaurantPhotos.forEach((file) => {
          formData.append("restaurantPhotos", file);
        });

        // Axios를 이용한 API 요청
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/restaurant/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        alert("회원가입 성공!");
        this.$router.push("/");
      } catch (e) {
        alert(e.response?.data || "회원가입 실패");
      }
    },

    // 파일 업로드 처리 (미리보기 생성)
    fileUpload(event) {
      this.restaurantPhotos = Array.from(event.target.files); // 파일 저장
      this.imagePreviews = this.restaurantPhotos.map((file) => URL.createObjectURL(file)); // 미리보기 생성
    },

    // LocalDateTime 변환: YYYY-MM-DDTHH:mm:ss
    formatDateTime(time) {
      if (!time) return "";
      return `${new Date().toISOString().split("T")[0]}T${time}:00`; // 오늘 날짜 + 입력한 시간
    },
    formatTime(time) {
      if (!time) return "";
      return `${time}:00`;
    },
      //사업자등록증 숫자 자리 맞춰줌. 000-00-00000 이런 식으로

    formatRegistrationNumber() {
      let numbers = this.registrationNumber.replace(/\D/g, ""); // 숫자만 추출
      if (numbers.length > 10) numbers = numbers.slice(0, 10); // 최대 10자리

      if (numbers.length <= 3) {
        this.registrationNumber = numbers;
      } else if (numbers.length <= 5) {
        this.registrationNumber = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        this.registrationNumber = `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
      }
    }
  }
};
</script>