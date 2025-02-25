<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title>예약 상세 정보</v-card-title>
        <v-card-text>
          <!-- 🔹 예약자 정보 -->
          <v-table>
            <tbody>
              <tr>
                <td><strong>예약번호</strong></td>
                <td>{{ reservation.id }}</td>
                <td><strong>예약일자</strong></td>
                <td>{{ reservation.reservationDate }}</td>
              </tr>
              <tr>
                <td><strong>예약자</strong></td>
                <td>{{ reservation.userName }}</td>
                <td><strong>예약 입금현황</strong></td>
                <td>{{ reservation.reservationStatus }}</td>
              </tr>
              <tr>
                <td><strong>예약 시간</strong></td>
                <td>{{ formattedReservationTime }}</td>
                <td><strong>예약 인원</strong></td>
                <td>{{ reservation.reservationPeopleNumber }}명</td>
              </tr>
            </tbody>
          </v-table>
  
          <!-- 🔹 레스토랑 정보 -->
          <v-table>
            <tbody>
              <tr>
                <td><strong>가게이름</strong></td>
                <td>{{ reservation.restaurantName }}</td>
                <td><strong>연락처</strong></td>
                <td>{{ reservation.restaurantNumber }}</td>
              </tr>
              <tr>
                <td><strong>가게주소</strong></td>
                <td colspan="3">{{ reservation.restaurantAddress }}</td>
              </tr>
            </tbody>
          </v-table>
  
          <!-- 🔹 결제 정보 -->
          <v-table>
            <tbody>
              <tr>
                <td><strong>결제방법</strong></td>
                <td>{{ reservation.paymentMethod }}</td>
                <td><strong>사용한 마일리지</strong></td>
                <td>{{ reservation.useMilege || 0 }} P</td>
              </tr>
            </tbody>
          </v-table>
  
          <!-- 🔹 쿠폰/할인 정보 -->
          <v-table v-if="reservation.couponName" class="coupon-table">
            <tbody>
              <tr>
                <td><strong>쿠폰 이름</strong></td>
                <td><strong>할인 금액</strong></td>
              </tr>
              <tr>
                <td>{{ reservation.couponName }}</td>
                <td>{{ reservation.discountAmount }} 원</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        reservationId: this.$route.params.id, // URL에서 예약 ID 가져오기
        reservation: {}
      };
    },
    computed: {
      formattedReservationTime() {
        if (this.reservation.reservationTime) {
          return this.reservation.reservationTime.length === 5 
            ? this.reservation.reservationTime  // 이미 HH:mm 형식이라면 그대로 사용
            : this.reservation.reservationTime.substring(0, 5); // HH:mm:ss -> HH:mm 변환
        }
        return "-";
      }
    },
    methods: {
      async fetchReservationDetail() {
        try {
          const response = await axios.get(
            `http://localhost:8080/reservation/${this.reservationId}/detail`
          );
          this.reservation = response.data;
          console.log("📌 [DEBUG] 불러온 예약 데이터:", this.reservation);
        } catch (error) {
          console.error("예약 정보를 불러오는 중 오류 발생:", error);
        }
      }
    },
    created() {
      this.fetchReservationDetail();
    }
  };
  </script>
  
  <style scoped>
  .coupon-table {
  margin: 20px auto; /* 위아래 여백 추가 */
 /* 적절한 너비 설정 (조정 가능) */
  text-align: center;
}

.coupon-table td {
  text-align: center;
  padding: 15px; /* 간격 조정 */
}
  .v-table {
    margin-top: 10px;
    border: 1px solid #ddd;
  }
  
  .v-table td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  
  strong {
    color: #333;
  }
  </style>
