<template>
    <v-container v-if="restaurant">
      <v-img :src="restaurant.imagePath" height="300px" cover></v-img>
      <v-card>
        <v-card-title>{{ restaurant.name }}</v-card-title>
        <v-card-subtitle>{{ restaurant.address }}</v-card-subtitle>
        <v-card-text>
          <p>⭐ 평균 별점: {{ restaurant.averageRating }}</p>
          <p>📌 즐겨찾기 수: {{ restaurant.bookmarkCount }}</p>
          <p>💬 리뷰 수: {{ restaurant.reviewCount }}</p>
          <p>📞 연락처: {{ restaurant.phoneNumber }}</p>
          <p>📝 설명: {{ restaurant.description }}</p>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import { mapActions, mapState } from 'vuex';
  
  export default {
    computed: {
      ...mapState('restaurant', ['selectedRestaurant']),
      restaurant() {
        return this.selectedRestaurant;
      }
    },
    methods: {
      ...mapActions('restaurant', ['fetchRestaurantById'])
    },
    created() {
      const id = this.$route.params.id;
      this.fetchRestaurantById(id);
    }
  };
  </script>