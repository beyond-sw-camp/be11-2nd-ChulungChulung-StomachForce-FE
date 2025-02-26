<template>
    <v-container>
        <v-row class="d-flex justify-content-between mt-5">
            <v-col>
                <v-form>
                    <v-row>
                        <!-- 검색 기준 선택 -->
                        <v-col cols="auto">
                            <v-select 
                                v-model="searchType" 
                                :items="searchOptions" 
                                item-title="text" 
                                item-value="value" 
                                label="검색 기준" 
                            />
                        </v-col>
                        <!-- 레스토랑명 또는 주소 검색어 입력 -->
                        <v-col v-if="searchType !== 'restaurantType'">
                            <v-text-field 
                                v-model="searchValue" 
                                label="검색어 입력" 
                                @keydown.enter="searchRestaurants"
                            />
                        </v-col>
                        <!-- 레스토랑 종류 선택 (검색 기준이 레스토랑 종류일 때만 보이게) -->
                        <v-col v-if="searchType === 'restaurantType'">
                            <v-select 
                                v-model="selectedType" 
                                :items="restaurantTypeOptions" 
                                item-title="text" 
                                item-value="value" 
                                label="레스토랑 종류"
                            />
                        </v-col>
                        <!-- 검색 버튼 -->
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
                <v-card @click="goToDetail(restaurant.id)" class="clickable">
                    <v-img :src="restaurant.imagePath || '/noImage.jpg'" class="restaurant-image"></v-img>
                    <v-card-title>{{ restaurant.name }}</v-card-title>
                    <v-card-subtitle>{{ restaurant.address }}</v-card-subtitle>
                    <v-card-text>
                        <p>⭐ 평균 별점: {{ restaurant.averageRating }}</p>
                        <p>📌 즐겨찾기 수: {{ restaurant.bookmarkCount }}</p>
                        <p>💬 리뷰 수: {{ restaurant.reviewCount }}</p>
                        <p>🍽️ 유형: {{ restaurant.restaurantType }}</p>
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
        searchType: "name", // 기본 검색 기준
        searchValue: "", // 검색어 입력
        selectedType: null, // ✅ 추가
        searchOptions: [
            { text: "레스토랑명", value: "name" },
            { text: "주소", value: "address" },
            { text: "레스토랑 종류", value: "restaurantType" } // 레스토랑 종류 추가
        ],
        restaurantTypeOptions: [
            { text: "한식", value: "KOREAN" },
            { text: "중식", value: "CHINESE" },
            { text: "양식", value: "WESTERN" },
            { text: "일식", value: "JAPANESE" },
            { text: "퓨전", value: "FUSION" }
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

                if (this.searchType === "restaurantType" && this.selectedType) {
                    params["restaurantType"] = this.selectedType; // ✅ restaurantType 추가
                } else if (this.searchValue) {
                    params[this.searchType] = this.searchValue;
                }

                // 🔍 API 요청 확인
                console.log("API 요청 파라미터:", params);

                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/list`, { params });

                // 🔍 응답 확인
                console.log("API 응답 데이터:", response.data);

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