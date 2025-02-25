<template>
    <v-container>
      <v-card class="pa-5">
        <v-card-title class="title">내 예약 내역</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">예약번호</th>
                <th class="text-left">식당명</th>
                <th class="text-left">예약 상세</th>
                <th class="text-left">리뷰쓰러가기</th>
                <th class="text-left">예약 취소</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reservation in reservations" :key="reservation.id">
                <td>{{ reservation.id }}</td>
                <td>{{ reservation.restaurantName }}</td>
                <td>
                  <v-btn color="primary" @click="goToReservationDetail(reservation.id)">
                    상세보기
                  </v-btn>
                </td>
                <td>
                  <v-btn color="success" @click="loadRestaurantDetail(reservation.restaurantId)">
                    리뷰 작성
                  </v-btn>
                </td>
                <td>
                  <v-btn color="error" @click="cancelReservation(reservation.id)">
                    취소하기
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
  
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            @update:modelValue="fetchReservations"
            class="mt-4"
          ></v-pagination>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        reservations: [],
        currentPage: 1,
        totalPages: 1
      };
    },
    mounted() {
      this.fetchReservations();
    },
    methods: {
      async loadRestaurantDetail(restaurantId) {
      try {
        this.$router.push(`/restaurant/detail/${restaurantId}`);
      } catch (e) {
        console.error("레스토랑 상세 정보 로드 실패:", e);
      }
    },
      async fetchReservations() {
        try {
          const userId = localStorage.getItem("userId"); // 유저 ID 가져오기
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/reservation/${userId}/list?page=${this.currentPage}`
          );
  
          this.reservations = response.data;
          this.totalPages = Math.ceil(response.data.length / 10); // 페이지 수 계산 (한 페이지에 10개)
        } catch (error) {
          console.error("예약 내역을 불러오는 중 오류 발생:", error);
        }
      },
      goToReservationDetail(reservationId) {
        this.$router.push(`/user/reservation/detail/${reservationId}`);
      },
      async cancelReservation(reservationId) {
        // 확인창 띄우기
        if (!confirm("정말로 이 예약을 취소하시겠습니까?")) return;
  
        try {
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/reservation/${reservationId}/delete`);
  
          alert("예약이 취소되었습니다.");
          this.fetchReservations(); // 리스트 다시 불러오기
        } catch (error) {
          console.error("예약 취소 중 오류 발생:", error);
          alert("예약 취소에 실패했습니다.");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
  }
  </style>