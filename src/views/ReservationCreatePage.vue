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
  
          <!-- 🔹 쿠폰 코드 입력 -->
          <v-text-field v-model="reservation.couponCode" label="쿠폰 코드 (선택 사항)"></v-text-field>
  
          <!-- 🔹 마일리지 사용 입력 -->
          <v-text-field
            v-model.number="reservation.mileage"
            label="사용할 마일리지 (선택 사항)"
            type="number"
            min="0"
          ></v-text-field>
  
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
          reservationDateTime: null
        },
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

            // 날짜와 시간 분리

            const reservationDate = this.reservation.date;
            const reservationTime = this.reservation.time;

            // ✅ 전송할 JSON 데이터 확인
            console.log("📌 [DEBUG] 전송할 예약 데이터:", {
                reservationDate: this.reservation.date,  // "YYYY-MM-DD"
            reservationTime: this.reservation.time,  // "HH:mm"
                peopleNumber: this.reservation.peopleNumber,
                paymentMethod: this.reservation.paymentMethod,
                couponCode: this.reservation.couponCode,
                mileage: this.reservation.mileage
            });

            const requestData = {
                reservationDate: reservationDate,
                reservationTime: reservationTime,
                peopleNumber: this.reservation.peopleNumber,
                paymentMethod: this.reservation.paymentMethod,
                couponCode: this.reservation.couponCode,
                mileage: this.reservation.mileage
            };

            await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/reservation/${this.restaurantId}/create`,
            requestData
            );

            alert("예약이 완료되었습니다.");
            this.$router.push(`/restaurant/detail/${this.restaurantId}/reservation`);
        } catch (error) {
            console.error("예약 실패:", error);
            alert("예약에 실패했습니다.");
        }
        }
    }
  };
  </script>