<template>
    <v-container>
        <v-row class="d-flex justify-content-between mt-5">
            <v-col>
                <v-form>
                    <v-row>
                        <v-col cols="auto">
                            <v-select v-model="searchType" :items="searchOptions" item-title="text" item-value="value" label="검색 기준" />
                        </v-col>
                        <v-col>
                            <v-text-field v-model="searchValue" label="검색어 입력" @keydown.enter="searchRestaurants"/>
                        </v-col>
                        <v-col cols="auto"> 
                            <v-btn @click="searchRestaurants()" color="primary" >검색</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
            <v-col cols="auto" v-if="isAdmin">
                <v-btn :to="{ path: '/restaurant/create' }">레스토랑 등록</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col v-for="restaurant in restaurantList" :key="restaurant.id" cols="12" sm="6" md="4" lg="3">
                <v-card @click="goToDetail(restaurant.id)" class="clickable">
                    <v-img :src="restaurant.imagePath || '/noImage.jpg'" class="restaurant-image"></v-img>
                    <v-card-title>{{ restaurant.name }}</v-card-title>
                    <v-card-subtitle>{{ restaurant.address }}</v-card-subtitle>
                    <v-card-text>
                        <p>⭐ 평균 별점: {{ restaurant.averageRating }}</p>
                        <p>📌 즐겨찾기 수: {{ restaurant.bookmarkCount }}</p>
                        <p>💬 리뷰 수: {{ restaurant.reviewCount }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.restaurant-image {
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    object-fit: cover;
}
.clickable {
    cursor: pointer;
    transition: transform 0.2s;
}
.clickable:hover {
    transform: scale(1.05);
}
</style>

<script>
import axios from 'axios';

export default {
    props: ['isAdmin'],
    data() {
        return {
            restaurantList: [],
            searchType: "name",
            searchValue: "",
            searchOptions: [
                { text: "레스토랑명", value: "name" },
                { text: "주소", value: "address" }
            ]
        };
    },
    created() {
        this.loadData();
    },
    methods: {
        async loadData() {
            try {
                let params = { size: 10, page: 0 };
                if (this.searchValue) {
                    params[this.searchType] = this.searchValue;
                }
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/list`, { params });
                this.restaurantList = response.data.content;
            } catch (e) {
                console.error("데이터 로드 실패:", e);
            }
        },
        goToDetail(id) {
            this.$router.push(`/restaurant/detail/${id}`);
        },
        searchRestaurants() {
            this.restaurantList = [];
            this.loadData();
        }
    }
};
</script>