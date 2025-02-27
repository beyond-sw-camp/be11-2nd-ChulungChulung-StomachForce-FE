<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="my-page-card elevation-3">
          <div class="header-section pa-6">
            <h1 class="text-h4 font-weight-bold mb-2" style="color: #FF5722;">마이페이지</h1>
            <p class="text-subtitle-1 text-medium-emphasis">레스토랑 정보를 관리할 수 있습니다.</p>
          </div>
          
          <v-divider></v-divider>

          <v-container class="pa-6">
            <v-row>
              <v-col cols="12" sm="6">
                <v-card class="menu-card" elevation="2" @click="openDialog('personalInfo')">
                  <v-card-text class="d-flex align-center">
                    <v-icon size="32" color="#FF5722" class="mr-4">mdi-account-edit</v-icon>
                    <div>
                      <div class="text-h6 mb-1">개인정보 수정</div>
                      <div class="text-body-2 text-medium-emphasis">기본 정보를 수정합니다</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6">
                <v-card class="menu-card" elevation="2" @click="openDialog('businessHours')">
                  <v-card-text class="d-flex align-center">
                    <v-icon size="32" color="#FF5722" class="mr-4">mdi-clock-outline</v-icon>
                    <div>
                      <div class="text-h6 mb-1">영업시간 관리</div>
                      <div class="text-body-2 text-medium-emphasis">영업시간을 설정합니다</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6">
                <v-card class="menu-card" elevation="2" @click="openDialog('textInfo')">
                  <v-card-text class="d-flex align-center">
                    <v-icon size="32" color="#FF5722" class="mr-4">mdi-text-box-edit</v-icon>
                    <div>
                      <div class="text-h6 mb-1">업장 정보 수정</div>
                      <div class="text-body-2 text-medium-emphasis">상세 정보를 수정합니다</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6">
                <v-card class="menu-card" elevation="2" @click="openDialog('photos')">
                  <v-card-text class="d-flex align-center">
                    <v-icon size="32" color="#FF5722" class="mr-4">mdi-image-edit</v-icon>
                    <div>
                      <div class="text-h6 mb-1">사진 관리</div>
                      <div class="text-body-2 text-medium-emphasis">업장 사진을 관리합니다</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <!-- 비밀번호 검증 다이얼로그 -->
    <v-dialog v-model="dialogs.verifyPassword" persistent max-width="400px">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon left color="#FF5722" class="mr-2">mdi-shield-lock</v-icon>
          비밀번호 확인
        </v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="password"
            label="현재 비밀번호"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog('verifyPassword')">취소</v-btn>
          <v-btn color="#FF5722" @click="verifyPassword">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 개인정보 수정 다이얼로그 -->
    <v-dialog v-model="dialogs.personalInfo" max-width="500px">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon left color="#FF5722" class="mr-2">mdi-account-edit</v-icon>
          개인정보 수정
        </v-card-title>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="이름"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                class="mb-2"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.email"
                label="이메일"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-2"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.phoneNumber"
                label="전화번호"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog('personalInfo')">취소</v-btn>
          <v-btn color="#FF5722" @click="updatePersonalInfo">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 업장 시간 정보 수정 다이얼로그 -->
    <v-dialog v-model="dialogs.businessHours" max-width="600px">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon left color="#FF5722" class="mr-2">mdi-clock-edit</v-icon>
          영업시간 관리
        </v-card-title>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.openingTime"
                label="오픈 시간"
                type="time"
                variant="outlined"
                prepend-inner-icon="mdi-clock-start"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.closingTime"
                label="마감 시간"
                type="time"
                variant="outlined"
                prepend-inner-icon="mdi-clock-end"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.breakTimeStart"
                label="브레이크 시작"
                type="time"
                variant="outlined"
                prepend-inner-icon="mdi-clock-pause"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.breakTimeEnd"
                label="브레이크 종료"
                type="time"
                variant="outlined"
                prepend-inner-icon="mdi-clock-pause"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.lastOrder"
                label="라스트 오더"
                type="time"
                variant="outlined"
                prepend-inner-icon="mdi-clock-alert"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.holiday"
                label="휴무일"
                type="date"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog('businessHours')">취소</v-btn>
          <v-btn color="#FF5722" @click="updateBusinessHours">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 업장 텍스트 정보 수정 다이얼로그 -->
    <v-dialog v-model="dialogs.textInfo" max-width="600px">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon left color="#FF5722" class="mr-2">mdi-text-box-edit</v-icon>
          업장 정보 수정
        </v-card-title>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="업장 설명"
                variant="outlined"
                rows="3"
                prepend-inner-icon="mdi-text-box"
              ></v-textarea>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.capacity"
                label="수용 인원"
                variant="outlined"
                prepend-inner-icon="mdi-account-group"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.restaurantType"
                label="레스토랑 유형"
                variant="outlined"
                prepend-inner-icon="mdi-store"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.addressCity"
                label="도시"
                variant="outlined"
                prepend-inner-icon="mdi-city"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.addressStreet"
                label="거리"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
              ></v-text-field>
            </v-col>
            <!-- 기존 추가 정보 칸: infos 배열을 개행 문자로 결합한 문자열이 이미 할당되어 있음 -->
            <v-col cols="12">
              <v-textarea
                v-model="form.infoText"
                label="추가 정보"
                variant="outlined"
                rows="2"
                prepend-inner-icon="mdi-information"
              ></v-textarea>
            </v-col>
            <v-col cols="12" sm="6">
              <!-- computed property depositAvailableBool 사용 -->
              <v-checkbox
                v-model="depositAvailableBool"
                label="예약금 가능 여부"
                color="#FF5722"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.deposit"
                label="예약금 금액"
                variant="outlined"
                prepend-inner-icon="mdi-cash"
                :disabled="!depositAvailableBool"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog('textInfo')">취소</v-btn>
          <v-btn color="#FF5722" @click="updateTextInfo">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 업장 사진 수정 다이얼로그 -->
    <v-dialog v-model="dialogs.photos" max-width="800px">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon left color="#FF5722" class="mr-2">mdi-image-edit</v-icon>
          사진 관리
        </v-card-title>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12">
              <v-file-input
                v-model="form.newPhotos"
                label="새 사진 추가"
                multiple
                prepend-icon="mdi-camera"
                variant="outlined"
                @change="uploadNewPhotos"
                accept="image/*"
                show-size
              ></v-file-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col v-for="(photo, index) in form.restaurantPhotos" :key="photo.photoId || index" cols="12" sm="6" md="4">
              <v-card class="photo-card">
                <v-img :src="photo.photoUrl" height="200" cover></v-img>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="error"
                    icon
                    variant="text"
                    @click="removePhoto(photo.photoId)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog('photos')">취소</v-btn>
          <v-btn color="#FF5722" @click="finishPhotoUpdate">완료</v-btn>
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
        // 서버에서는 "yes"/"no" 문자열로 전달됨
        depositAvailable: "no",
        deposit: 0,
        infos: [],
        restaurantPhotos: [],
        newPhotos: []
      },
      noBreakTime: false,
      capacityOptions: Array.from({ length: 20 }, (_, i) => (i + 1) * 5), // 5~100명
      restaurantTypeOptions: ["KOREAN", "CHINESE", "WESTERN", "JAPANESE", "FUSION"]
    };
  },
  computed: {
    depositAvailableBool: {
      get() {
        return this.form.depositAvailable === "yes";
      },
      set(val) {
        this.form.depositAvailable = val ? "yes" : "no";
        if (!val) {
          this.form.deposit = 0;
        }
      }
    }
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
        console.log(res.data);
        // 응답 데이터를 form에 병합하고, infos 배열이 있다면 infoText에 개행문자로 결합하여 할당
        this.form = { ...this.form, ...res.data };
        if (res.data.infos) {
          this.form.infoText = res.data.infos.join("\n");
        }
        // depositAvailable 처리: 서버에서 대문자로 "YES"/"NO"로 오므로, 소문자로 변환
        if (res.data.depositAvailable && res.data.depositAvailable.toUpperCase() === "NO") {
          this.form.depositAvailable = "no";
          this.form.deposit = 0;
        } else if (res.data.depositAvailable && res.data.depositAvailable.toUpperCase() === "YES") {
          this.form.depositAvailable = "yes";
          // deposit 값은 res.data.deposit에 있음
        }
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
        this.form.restaurantPhotos.push({ photoId: null, photoUrl: URL.createObjectURL(file) });
      }
    },
    async finishPhotoUpdate() {
      try {
        if (this.form.newPhotos.length > 0) {
          for (const file of this.form.newPhotos) {
            const formData = new FormData();
            formData.append("additionalPhoto", file);
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/restaurant/photoAdd`, formData, {
              headers: { "Content-Type": "multipart/form-data" }
            });
          }
        }
        await this.loadPhotos();
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
        localStorage.setItem("restaurantName", this.form.name);
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
        const payload = {
          ...this.form,
          depositAvailable: this.form.depositAvailable // 이미 computed setter에서 관리됨
        };
        console.log(payload);
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/restaurant/update`, payload);
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

<style scoped>
.my-page-card {
  border-radius: 16px;
  overflow: hidden;
}
.header-section {
  background: linear-gradient(to right, #FFF3E0, #ffffff);
  border-bottom: 2px solid #FFE0B2;
}
.menu-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #FFE0B2;
}
.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(255, 87, 34, 0.1) !important;
  border-color: #FF5722;
}
.v-card-text {
  height: 100%;
  padding: 24px;
}
.text-medium-emphasis {
  color: rgba(0, 0, 0, 0.6);
}
::v-deep .v-btn.primary {
  background-color: #FF5722 !important;
}
.dialog-card {
  border-radius: 16px;
  overflow: hidden;
}
.dialog-title {
  background: linear-gradient(to right, #FFF3E0, #ffffff);
  padding: 20px;
  font-size: 1.5rem;
  font-weight: 500;
  border-bottom: 2px solid #FFE0B2;
}
.dialog-actions {
  padding: 16px;
  border-top: 1px solid #FFE0B2;
}
.photo-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
::v-deep .v-text-field .v-input__prepend-inner {
  margin-right: 8px;
  color: #FF5722;
}
::v-deep .v-text-field--outlined fieldset {
  border-color: #FFE0B2;
}
::v-deep .v-text-field--outlined:hover fieldset {
  border-color: #FF5722;
}
</style>
