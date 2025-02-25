<template>
    <v-container>
      <v-card class="pa-4">
        <v-card-title class="text-h5">마이페이지</v-card-title>
        <v-divider class="my-4"></v-divider>
  
        <v-list>
          <v-list-item @click="openDialog('verifyPassword')">
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
  
      <!--  비밀번호 검증 다이얼로그 -->
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
  
      <!--  개인정보 수정 다이얼로그 -->
      <v-dialog v-model="dialogs.personalInfo">
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
  
      <!--  업장 시간 정보 수정 -->
      <v-dialog v-model="dialogs.businessHours">
        <v-card>
          <v-card-title>업장 시간 정보 수정</v-card-title>
          <v-card-text>
            <v-text-field v-model="form.openingTime" label="오픈 시간" type="time"></v-text-field>
            <v-text-field v-model="form.closingTime" label="마감 시간" type="time"></v-text-field>
            <v-text-field v-model="form.breakTimeStart" label="브레이크 시작" type="time"></v-text-field>
            <v-text-field v-model="form.breakTimeEnd" label="브레이크 종료" type="time"></v-text-field>
            <v-text-field v-model="form.lastOrder" label="라스트 오더" type="time"></v-text-field>
            <v-text-field v-model="form.holiday" label="휴무일" type="date"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="updateBusinessHours">저장</v-btn>
            <v-btn @click="closeDialog('businessHours')">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!--  업장 텍스트 정보 수정 -->
      <v-dialog v-model="dialogs.textInfo">
        <v-card>
          <v-card-title>업장 텍스트 정보 수정</v-card-title>
          <v-card-text>
            <v-text-field v-model="form.description" label="업장 설명"></v-text-field>
            <v-text-field v-model="form.capacity" label="수용 인원"></v-text-field>
            <v-text-field v-model="form.address.city" label="도시"></v-text-field>
            <v-text-field v-model="form.address.street" label="거리"></v-text-field>
            <v-text-field v-model="form.restaurantType" label="레스토랑 유형"></v-text-field>
            <v-text-field v-model="form.infoText" label="추가 정보"></v-text-field>
            <v-checkbox v-model="form.depositAvailable" label="예약금 가능 여부"></v-checkbox>
            <v-text-field v-model="form.deposit" label="예약금 금액"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="updateTextInfo">저장</v-btn>
            <v-btn @click="closeDialog('textInfo')">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!--  업장 사진 수정 -->
      <v-dialog v-model="dialogs.photos">
        <v-card>
          <v-card-title>업장 사진 수정</v-card-title>
          <v-card-text>
            <div v-for="(photo, index) in form.restaurantPhotos" :key="index" class="mb-3">
              <v-img :src="photo" height="100px"></v-img>
              <v-btn color="error" @click="removePhoto(index)">삭제</v-btn>
            </div>
            <v-file-input label="사진 추가" multiple @change="uploadPhotos"></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="updatePhotos">저장</v-btn>
            <v-btn @click="closeDialog('photos')">취소</v-btn>
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
        dialogs: {
          verifyPassword: false,
          personalInfo: false,
          businessHours: false,
          textInfo: false,
          photos: false,
        },
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
          address: { city: "", street: "" },
          restaurantType: "",
          infoText: "",
          depositAvailable: false,
          deposit: 0,
          restaurantPhotos: [],
        },
      };
    },
    methods: {
      openDialog(dialog) {
        this.dialogs[dialog] = true;
        this.loadData();
      },
      closeDialog(dialog) {
        this.dialogs[dialog] = false;
      },
      async loadData() {
        const res = await axios.get("/restaurant/detail/1");
        this.form = res.data;
      },
      async verifyPassword() {
        this.dialogs.verifyPassword = false;
        this.dialogs.personalInfo = true;
      },
      async updatePersonalInfo() {
        await axios.patch(`/restaurant/update/1`, this.form);
        this.closeDialog("personalInfo");
      },
      async updateBusinessHours() {
        await axios.patch(`/restaurant/update/1`, this.form);
        this.closeDialog("businessHours");
      },
      async updateTextInfo() {
        await axios.patch(`/restaurant/info/update/1`, this.form);
        this.closeDialog("textInfo");
      },
      async updatePhotos() {
        await axios.patch(`/restaurant/update/1`, this.form);
        this.closeDialog("photos");
      },
      removePhoto(index) {
        this.form.restaurantPhotos.splice(index, 1);
      },
      uploadPhotos(event) {
        this.form.restaurantPhotos.push(...event.target.files);
      },
    },
  };
  </script>