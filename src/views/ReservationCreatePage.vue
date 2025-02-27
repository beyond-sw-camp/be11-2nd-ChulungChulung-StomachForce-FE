<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title>레스토랑 예약</v-card-title>
        <v-card-text>
          <!-- 🔹 예약 날짜 & 시간 선택 -->
          <v-menu
            v-model="datePicker"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-model="formattedDateTime"
                label="예약 날짜 & 시간 선택"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="props"
              ></v-text-field>
            </template>
            <v-card>
              <v-date-picker
                v-model="tempDate"
                :min="minDate"
              ></v-date-picker>
              <v-divider></v-divider>
              <v-card-text class="px-4 pt-4">
                <v-select
                  v-model="tempTime"
                  :items="availableTimes"
                  label="예약 시간"
                  item-title="text"
                  item-value="value"
                  hide-details
                  class="mb-2"
                ></v-select>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  variant="text"
                  @click="cancelDateTime"
                >
                  취소
                </v-btn>
                <v-btn
                  color="primary"
                  variant="text"
                  @click="confirmDateTime"
                  :disabled="!tempDate || !tempTime"
                >
                  확인
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>

          <v-row>
            <v-col v-for="menu in menus" :key="menu.id" cols="12" sm="6" md="4">
              <v-card>
                <v-img :src="menu.menuPhoto" height="200px" cover></v-img>
                <v-card-title>{{ menu.name }}</v-card-title>
                <v-card-subtitle>{{ menu.price }}원</v-card-subtitle>
                <v-checkbox
                  v-model="selectedMenus"
                  :value="menu.id"
                  :label="menu.name"
                  @change="handleMenuSelection(menu.id)"
                ></v-checkbox>
                <v-text-field
                  v-model.number="menuQuantities[menu.id]"
                  label="수량"
                  type="number"
                  min="1"
                  :disabled="!selectedMenus.includes(menu.id)"
                ></v-text-field>
              </v-card>
            </v-col>
          </v-row>
  
          <!-- 🔹 인원 수 입력 -->
          <v-text-field
            v-model.number="reservation.peopleNumber"
            label="인원 수 입력"
            type="number"
            min="1"
            :rules="[validatePeopleNumber]"
            required
          ></v-text-field>
          <!-- 🔹 결제 방법 선택 -->
          <v-select
            v-model="reservation.paymentMethod"
            :items="paymentMethods"
            item-title="text"
            item-value="value"
            label="결제 방법 선택"
            required
          ></v-select>
          <!-- 🔹 예약하기 버튼 -->
          <v-btn color="primary" class="mt-3" :disabled="!isFormValid" @click="submitReservation">
            예약하기
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
        restaurantId: this.$route.params.id, // URL에서 레스토랑 ID 가져오기
        reservation: {
          date: null,
          time: null,
          peopleNumber: null, // ✅ 초기값 null (사용자가 입력하도록)
          paymentMethod: "CARD",
          couponCode: "",
          mileage: 0,
          reservationDateTime: null,

        },
        menus: [],  // 메뉴 리스트 API 호출 필요
        selectedMenus: [],
        menuQuantities: {},  // 선택된 메뉴 ID 목록
        datePicker: false,
        tempDate: null,
        tempTime: null,
        availableTimes: [
          { text: "7:00", value: "7" },
          { text: "8:00", value: "8" },
          { text: "9:00", value: "9" },
          { text: "10:00", value: "10" },
          { text: "11:00", value: "11" },
          { text: "12:00", value: "12" },
          { text: "13:00", value: "13" },
          { text: "14:00", value: "14" },
          { text: "15:00", value: "15" },
          { text: "16:00", value: "16" },
          { text: "17:00", value: "17" },
          { text: "18:00", value: "18" },
          { text: "19:00", value: "19" },
          { text: "20:00", value: "20" },
          { text: "21:00", value: "21" },
          { text: "22:00", value: "22" },
          { text: "23:00", value: "23" }
        ],
        paymentMethods: [
          { text: "카드 결제", value: "CARD" },
          { text: "현금 결제", value: "CASH" },
        ],
      };
    },
    created() {
    this.fetchMenus();
    },
    computed: {
      minDate() {
        return new Date().toISOString().split('T')[0];
      },
      
      formattedDateTime() {
        if (this.reservation.date && this.reservation.time) {
          const date = new Date(this.reservation.date);
          const formattedDate = date.toLocaleDateString();
          return `${formattedDate} ${this.reservation.time}:00`;
        }
        return '';
      },
      isFormValid() {
        return this.reservation.date && this.reservation.time && this.reservation.peopleNumber > 0;
      }
    },
    methods: {
      handleMenuSelection(menuId) {
    // 메뉴를 선택 해제하면 수량도 삭제
    if (!this.selectedMenus.includes(menuId)) {
      delete this.menuQuantities[menuId]; // ✅ Vue 3에서는 delete 사용
    } else {
      this.menuQuantities[menuId] = 1; // ✅ Vue 3에서는 직접 할당 가능
    }
  },
      async fetchMenus() {
    try {
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/${this.restaurantId}/menus`);
      this.menus = response.data;
    } catch (error) {
      console.error("메뉴 로드 실패:", error);
    }
  },
        confirmDateTime() {
    if (this.tempDate && this.tempTime) {
        // ✅ 날짜 변환: "YYYY-MM-DD" 형식으로 저장
        const dateObj = new Date(this.tempDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // 1월이 0부터 시작
        const day = String(dateObj.getDate()).padStart(2, "0");

        // ✅ 시간 변환: "HH:mm" 형식으로 저장
        const formattedDate = `${year}-${month}-${day}`;
        const formattedTime = `${String(this.tempTime).padStart(2, "0")}:00`;

        // ✅ 변환된 값을 reservation 객체에 저장
        this.reservation.date = formattedDate;
        this.reservation.time = formattedTime;
        this.reservation.reservationDateTime = `${formattedDate}T${formattedTime}`;

        console.log("📌 [DEBUG] 변환된 예약 날짜:", this.reservation.date);
        console.log("📌 [DEBUG] 변환된 예약 시간:", this.reservation.time);

        this.datePicker = false;
    }
},
      cancelDateTime() {
        this.datePicker = false;
        this.tempDate = null;
        this.tempTime = null;
      },
      validatePeopleNumber(value) {
        return value > 0 ? true : "인원 수는 1명 이상이어야 합니다.";
      },
      async submitReservation() {
  try {
    if (!this.reservation.reservationDateTime) {
      alert("예약 날짜 및 시간을 선택해주세요.");
      return;
    }
    if (!this.reservation.peopleNumber || this.reservation.peopleNumber < 1) {
      alert("인원 수를 1명 이상 입력해주세요.");
      return;
    }

    // ✅ 메뉴 ID와 수량을 객체로 변환
    const selectedMenuData = this.selectedMenus.map(id => ({
      menuId: id,
      quantity: this.menuQuantities[id] || 1 // 수량 기본값 1
    }));

    // ✅ JSON 데이터
    const requestData = {
      reservationDate: this.reservation.date,
      reservationTime: this.reservation.time,
      peopleNumber: this.reservation.peopleNumber,
      paymentMethod: this.reservation.paymentMethod,
      couponCode: this.reservation.couponCode,
      mileage: this.reservation.mileage,
      menus: selectedMenuData // ✅ 변경된 부분
    };
    console.log(requestData)
    await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/reservation/${this.restaurantId}/create`,
      requestData
    );

    alert("예약이 완료되었습니다.");
    this.$router.push(`/user/reservation`);
  } catch (error) {
    console.error("예약 실패:", error);
    alert("예약에 실패했습니다.");
  }
}
    }
  };
  </script>