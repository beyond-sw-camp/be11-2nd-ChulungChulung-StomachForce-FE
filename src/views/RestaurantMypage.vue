<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5">마이페이지</v-card-title>
      <v-divider class="my-4"></v-divider>
      <v-list>
        <v-list-item @click="openDialog('personalInfo')">
          <v-list-item-title>개인정보 수정</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openDialog('businessHours')">
          <v-list-item-title>업장 시간 정보 수정</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openDialog('textInfo')">
          <v-list-item-title>업장 텍스트 정보 수정</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openDialog('photos')">
          <v-list-item-title>업장 사진 수정</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- 비밀번호 검증 다이얼로그 (필요시) -->
    <v-dialog v-model="dialogs.verifyPassword" persistent>
      <v-card>
        <v-card-title>비밀번호 확인</v-card-title>
        <v-card-text>
          <v-text-field v-model="password" label="현재 비밀번호" type="password" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="verifyPassword">확인</v-btn>
          <v-btn @click="closeDialog('verifyPassword')">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 개인정보 수정 다이얼로그 -->
    <v-dialog v-model="dialogs.personalInfo" max-width="600px">
      <v-card>
        <v-card-title>개인정보 수정</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="이름"></v-text-field>
          <v-text-field v-model="form.email" label="이메일"></v-text-field>
          <v-text-field v-model="form.phoneNumber" label="전화번호"></v-text-field>
          <v-text-field v-model="form.registrationNumber" label="사업자등록번호"></v-text-field>
          <v-text-field v-model="form.password" label="새 비밀번호" type="password"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updatePersonalInfo">저장</v-btn>
          <v-btn @click="closeDialog('personalInfo')">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 업장 시간 정보 수정 다이얼로그 -->
    <v-dialog v-model="dialogs.businessHours" max-width="600px">
      <v-card>
        <v-card-title>업장 시간 정보 수정</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.openingTime" label="오픈 시간" type="time"></v-text-field>
          <v-text-field v-model="form.closingTime" label="마감 시간" type="time"></v-text-field>

          <!-- 브레이크타임 없음 체크박스 -->
          <v-checkbox v-model="noBreakTime" label="브레이크타임 없음" @change="toggleBreakTime"></v-checkbox>

          <!-- 브레이크타임 (없을 경우 비활성화) -->
          <v-text-field v-model="form.breakTimeStart" label="브레이크 시작" type="time"
            :disabled="noBreakTime || !form.openingTime || !form.closingTime"
            :min="form.openingTime" :max="form.closingTime"></v-text-field>

          <v-text-field v-model="form.breakTimeEnd" label="브레이크 종료" type="time"
            :disabled="noBreakTime || !form.openingTime || !form.closingTime"
            :min="form.openingTime" :max="form.closingTime"></v-text-field>

          <v-text-field v-model="form.lastOrder" label="라스트 오더" type="time"
            :min="form.openingTime" :max="form.closingTime"></v-text-field>

          <!-- 휴무일은 오늘 이후 날짜만 선택 가능 -->
          <v-text-field v-model="form.holiday" label="휴무일" type="date"
            :min="new Date().toISOString().split('T')[0]"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updateBusinessHours">저장</v-btn>
          <v-btn @click="closeDialog('businessHours')">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 업장 텍스트 정보 수정 다이얼로그 -->
    <v-dialog v-model="dialogs.textInfo" max-width="600px">
      <v-card>
        <v-card-title>업장 텍스트 정보 수정</v-card-title>
        <v-card-text>
          <!-- 수용 인원 5명 단위 선택 -->
          <v-select v-model="form.capacity" :items="capacityOptions" label="수용 인원"></v-select>

          <!-- 도시/거리 필드 (비우면 경고) -->
          <v-text-field 
            v-model="form.addressCity" 
            label="도시" 
            :error="isAddressCityEmpty"
            :error-messages="isAddressCityEmpty ? '비울 수 없는 필드입니다' : ''"
          ></v-text-field>

          <v-text-field 
            v-model="form.addressStreet" 
            label="거리" 
            :error="isAddressStreetEmpty"
            :error-messages="isAddressStreetEmpty ? '비울 수 없는 필드입니다' : ''"
          ></v-text-field>

          <!-- 레스토랑 유형 선택 -->
          <v-select v-model="form.restaurantType" :items="restaurantTypeOptions" label="레스토랑 유형"></v-select>

          <!-- 예약금 가능 여부 체크 -->
          <v-checkbox v-model="form.depositAvailable" label="예약금이 있습니다." @change="toggleDeposit"></v-checkbox>

          <!-- 예약금 (체크가 해제되면 비활성화) -->
          <v-text-field v-model="form.deposit" label="예약금 금액" type="number"
            :disabled="!form.depositAvailable"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updateTextInfo">저장</v-btn>
          <v-btn @click="closeDialog('textInfo')">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 업장 사진 수정 다이얼로그 (삭제, 추가만 제공하고, 별도 저장 버튼은 없음) -->
    <v-dialog v-model="dialogs.photos" max-width="600px">
      <v-card>
        <v-card-title>업장 사진 수정</v-card-title>
        <v-card-text>
          <div v-for="(photo, index) in form.restaurantPhotos" :key="photo.photoId || index">
            <v-img :src="photo.photoUrl" height="100px"></v-img>
            <v-btn color="error" @click="removePhoto(photo.photoId)" 
              :disabled="form.restaurantPhotos.length <= 1">삭제</v-btn>
          </div>
          <v-file-input label="새 사진 추가" multiple @change="uploadNewPhotos"></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="finishPhotoUpdate">수정 완료</v-btn>
          <v-btn @click="closeDialog('photos')">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "RestaurantMypage",
  data() {
    return {
      dialogs: {
        verifyPassword: false,
        personalInfo: false,
        businessHours: false,
        textInfo: false,
        photos: false,
      },
      restaurantId: null,
      password: "",
      form: {
        name: "",
        email: "",
        phoneNumber: "",
        registrationNumber: "",
        password: "",
        openingTime: "",
        closingTime: "",
        breakTimeStart: "",
        breakTimeEnd: "",
        lastOrder: "",
        holiday: "",
        description: "",
        capacity: "",
        addressCity: "",
        addressStreet: "",
        restaurantType: "",
        infoText: "",
        depositAvailable: false,
        deposit: 0,
        // 기존 사진 목록 (서버에서 받아온 데이터, 각 항목: { photoId, photoUrl })
        restaurantPhotos: [],
        // 새로 추가할 사진 파일 배열
        newPhotos: []
      },
      noBreakTime: false,
      capacityOptions: Array.from({ length: 20 }, (_, i) => (i + 1) * 5), // 5~100명
      restaurantTypeOptions: ["KOREAN", "CHINESE", "WESTERN", "JAPANESE", "FUSION"]
    };
  },
  async created() {
    await this.getMyRestaurantId();
  },
  computed: {
    isAddressCityEmpty() {
      return this.form.addressCity.trim() === "";
    },
    isAddressStreetEmpty() {
      return this.form.addressStreet.trim() === "";
    }
  },
  methods: {
    async getMyRestaurantId() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/mypage`);
        this.restaurantId = res.data.id;
      } catch (error) {
        console.error("레스토랑 ID 불러오기 실패:", error);
      }
    },
    toggleBreakTime() { if (this.noBreakTime) this.form.breakTimeStart = this.form.breakTimeEnd = ""; },
    toggleDeposit() { if (!this.form.depositAvailable) this.form.deposit = ""; },
    
    async openDialog(dialog) {
      if (dialog === "photos") {
        await this.loadPhotos();
      } else {
        await this.loadData();
      }
      this.dialogs[dialog] = true;
    },
    closeDialog(dialog) {
      this.dialogs[dialog] = false;
    },
    async loadData() {
      if (!this.restaurantId) return;
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${this.restaurantId}`);
        this.form = { ...this.form, ...res.data };
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    },
    async loadPhotos() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/photos`);
        this.form.restaurantPhotos = res.data.map(item => ({
          photoId: item.photoId,
          photoUrl: item.photoUrl
        }));
        // 새 사진 배열 초기화
        this.form.newPhotos = [];
      } catch (error) {
        console.error("사진 불러오기 실패:", error);
      }
    },
    async removePhoto(photoId) {
      if (this.form.restaurantPhotos.length <= 1) {
        alert("최소 1개 이상의 사진이 필요합니다");
        return;
      }
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/restaurant/photoDelete`, { photoId });
        this.form.restaurantPhotos = this.form.restaurantPhotos.filter(photo => photo.photoId !== photoId);
      } catch (error) {
        console.error("사진 삭제 실패:", error);
      }
    },
    uploadNewPhotos(event) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.form.newPhotos.push(file);
        // 미리보기용: photoId는 null로 처리
        this.form.restaurantPhotos.push({ photoId: null, photoUrl: URL.createObjectURL(file) });
      }
    },
    async finishPhotoUpdate() {
      try {
        // 새 사진이 있다면 각각 추가 (서버 엔드포인트: /restaurant/photoAdd)
        if (this.form.newPhotos.length > 0) {
          for (const file of this.form.newPhotos) {
            const formData = new FormData();
            formData.append("additionalPhoto", file);
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/restaurant/photoAdd`, formData, {
              headers: { "Content-Type": "multipart/form-data" }
            });
          }
        }
        // 변경사항 반영을 위해 사진 목록 다시 불러오기
        await this.loadPhotos();
        // 새 사진 배열 초기화 및 다이얼로그 닫기
        this.form.newPhotos = [];
        this.closeDialog("photos");
      } catch (error) {
        console.error("사진 수정 실패:", error);
      }
    },
    async updatePersonalInfo() {
      try {
        console.log(this.form);
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/restaurant/update`, this.form);
        localStorage.setItem("restaurantName",this.form.name)
        window.location.reload();
        this.closeDialog("personalInfo");
      } catch (error) {
        console.error("개인정보 수정 실패:", error);
      }
    },
    async updateBusinessHours() {
      try {
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/restaurant/update`, this.form);
        this.closeDialog("businessHours");
      } catch (error) {
        console.error("업장 시간 수정 실패:", error);
      }
    },
    async updateTextInfo() {
      if (this.isAddressCityEmpty || this.isAddressStreetEmpty) {
        alert("도시와 거리 필드는 비울 수 없습니다.");
        return; // 🚨 필수 입력값이 없으면 저장 막기
      }

      try {
        console.log(this.form);
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/restaurant/update`, this.form);
        this.closeDialog("textInfo");
      } catch (error) {
        console.error("업장 텍스트 수정 실패:", error);
      }
    },
    verifyPassword() {
      this.closeDialog("verifyPassword");
    }
  }
};
</script>
