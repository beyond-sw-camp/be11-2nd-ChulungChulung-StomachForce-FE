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
                            <v-text-field v-model="searchValue" label="검색어 입력" />
                        </v-col>
                        <v-col cols="auto">
                            <v-btn @click="searchRestaurants()" color="primary">검색</v-btn>
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
                <v-card>
                    <v-img :src="restaurant.imagePath || '/default-image.jpg'" class="restaurant-image"></v-img>
                    <v-card-title>{{ restaurant.name }}</v-card-title>
                    <v-card-subtitle>{{ restaurant.address }}</v-card-subtitle>
                    <v-card-text>
                        <p>⭐ 평균 별점: {{ restaurant.averageRating }}</p>
                        <p>📌 즐겨찾기 수: {{ restaurant.bookmarkCount }}</p>
                        <p>💬 리뷰 수: {{ restaurant.reviewCount }}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click="viewDetails(restaurant.id)">자세히 보기</v-btn>
                        <v-btn v-if="isAdmin" color="red" @click="deleteRestaurant(restaurant.id)">삭제</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style>
.restaurant-image {
    width: 100%;
    height: 0;
    padding-bottom: 100%; /* 정사각형 비율 유지 */
    object-fit: cover;
}
</style>

<script>
import axios from 'axios';

export default {
    props: ['isAdmin', 'pageTitle'],
    data() {
        return {
            restaurantList: [],
            pageSize: 10,
            currentPage: 0,
            isLoading: false,
            isLastPage: false,
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
        window.addEventListener('scroll', this.scrollPagination);
    },
    methods: {
        async loadData() {
            if (this.isLoading || this.isLastPage) return;
            this.isLoading = true;
            try {
                let params = { size: this.pageSize, page: this.currentPage };
                if (this.searchValue) {
                    params[this.searchType] = this.searchValue;
                }
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/list`, { params });
                console.log("API 응답 데이터:", response.data);
                if (!response.data.content || response.data.content.length === 0) {
                    this.isLastPage = true;
                    return;
                }
                this.restaurantList = [...this.restaurantList, ...response.data.content.map(r => ({
                    ...r,
                    imagePath: r.imagePath || '/default-image.jpg' // 기본 이미지 처리
                }))];
                this.currentPage++;
                this.isLoading = false;

                console.log("🔍 API 요청 URL:", `${process.env.VUE_APP_API_BASE_URL}/restaurant/list`);
                console.log("🔍 API 요청 params:", params);
                
            } catch (e) {
                console.error("데이터 로드 실패:", e);
            }
        },
        async deleteRestaurant(id) {
            try {
                await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/restaurant/delete/${id}`);
                this.restaurantList = this.restaurantList.filter(r => r.id !== id);
            } catch (e) {
                console.error("삭제 실패:", e);
            }
        },
        viewDetails(id) {
            this.$router.push(`/restaurant/${id}`);
        },
        scrollPagination() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                this.loadData();
            }
        },
        searchRestaurants() {
            
            this.currentPage = 0; // 검색 시 페이지를 초기화
            this.restaurantList = []; // 기존 목록 초기화
            this.isLastPage = false;
            this.isLoading = false;
            this.loadData(); // 검색어를 포함하여 데이터 로드
        }

        
        
    }
};
</script>