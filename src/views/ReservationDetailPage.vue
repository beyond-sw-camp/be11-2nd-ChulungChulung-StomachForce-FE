<template>
  <v-container>
    <v-card class="pa-5">
      <v-card-title>예약 상세 정보</v-card-title>
      <v-card-text>
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

        <!-- 🔹 주문한 메뉴 목록 -->
        <v-card-title class="mt-5">주문한 메뉴</v-card-title>
        <v-table>
          <thead>
            <tr>
              <th>이미지</th>
              <th>메뉴 이름</th>
              <th>수량</th>
              <th>가격</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in reservation.orderedMenus" :key="menu.name">
              <td><v-img :src="menu.imageUrl" width="80px" height="80px"></v-img></td>
              <td>{{ menu.name }}</td>
              <td>{{ menu.quantity }}개</td>
              <td>{{ menu.price * menu.quantity }}원</td>
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
    reservationId: this.$route.params.id,
    reservation: {}
  };
},
computed: {
  formattedReservationTime() {
    if (this.reservation.reservationTime) {
      return this.reservation.reservationTime.length === 5 
        ? this.reservation.reservationTime  
        : this.reservation.reservationTime.substring(0, 5); 
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
      console.log(response.data)
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
