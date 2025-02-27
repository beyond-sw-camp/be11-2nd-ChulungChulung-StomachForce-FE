<template>
    <v-container>
        <!-- 🔹 검색 헤더 -->
        <div class="search-container mb-40">
            <div class="search-bar">
                <v-select 
                    v-model="searchType" 
                    :items="searchOptions" 
                    item-title="text" 
                    item-value="value" 
                    hide-details
                    density="compact"
                    class="category-select"
                />
                
                <div class="search-input-wrapper">
                    <input 
                        v-if="searchType !== 'restaurantType'"
                        v-model="searchValue" 
                        type="text"
                        class="search-input"
                        placeholder="검색어 입력"
                        @keyup.enter="searchRestaurants"
                    />
                    <v-select 
                        v-if="searchType === 'restaurantType'"
                        v-model="selectedType" 
                        :items="restaurantTypeOptions" 
                        item-title="text" 
                        item-value="value" 
                        hide-details
                        density="compact"
                        class="restaurant-type-select"
                    />
                </div>

                <v-btn class="search-icon-btn" @click="searchRestaurants">
                    <v-icon size="22">mdi-magnify</v-icon>
                </v-btn>
            </div>
        </div>

        <!-- 🔹 네비게이션 아이콘 -->
        <div class="navigation-icons">
            <v-btn
                v-for="item in navigationIcons"
                :key="item.value"
                variant="text"
                class="navigation-btn"
                @click="setCategoryAndSearch(item.value)"
            >
                <div class="d-flex flex-column align-center">
                    <img 
                        :src="require(`@/assets/${item.image}`)" 
                        :alt="item.text"
                        class="navigation-icon mb-2"
                    />
                    <span class="navigation-text">{{ item.text }}</span>
                </div>
            </v-btn>
        </div>

        <!-- 🔹 레스토랑 리스트 -->
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
/* 🔹 검색창 스타일 */
.search-container {
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 20px;
}

.search-bar {
    display: flex;
    align-items: center;
    background: #F04E23;
    border-radius: 50px;
    height: 44px;
    padding: 4px 10px;
    gap: 6px;
    margin-top: 20px;
    margin-bottom: 40px;
}

/* 🔹 카테고리 스타일 */
.category-select {
    flex: 1;
    max-width: 220px;
    background: transparent;
    color: white;
    font-size: 14px;
}

:deep(.category-select .v-field__input),
:deep(.category-select .v-field__append-inner),
:deep(.category-select .v-select__selection-text) {
    color: white !important;
}

:deep(.category-select .v-field) {
    border: none !important;
    box-shadow: none !important;
}

/* 🔹 검색어 입력 필드 스타일 */
.search-input-wrapper {
    flex: 2;
    height: 100%;
}

.search-input {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 6px;
    padding: 0 12px;
    font-size: 14px;
    color: black;
    border: none;
    outline: none;

}

.search-input::placeholder {
    color: #999;
    opacity: 1;
}

.restaurant-type-select {
    background: white;
    border-radius: 6px;
    height: 100%;
}

/* 🔹 돋보기 버튼 */
.search-icon-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: transparent;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    min-width: 38px;
    box-shadow: none !important;
}

/* 🔹 네비게이션 아이콘 */
.navigation-icons {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    padding: 16px 0;
    margin-bottom: 40px;
}

.navigation-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
}

.navigation-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.navigation-text {
    font-size: 0.9rem;
    margin-top: 4px;
    color: #424242;
}
</style>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            restaurantList: [],
            searchType: "name",
            searchValue: "",
            selectedType: null,
            searchOptions: [
                { text: "레스토랑명", value: "name" },
                { text: "주소", value: "address" },
                { text: "레스토랑 종류", value: "restaurantType" }
            ],
            restaurantTypeOptions: [
                { text: "한식", value: "KOREAN" },
                { text: "중식", value: "CHINESE" },
                { text: "양식", value: "WESTERN" },
                { text: "일식", value: "JAPANESE" },
                { text: "퓨전", value: "FUSION" }
            ],
            navigationIcons: [
                { text: '한식', value: 'KOREAN', image: '한식.png' },
                { text: '일식', value: 'JAPANESE', image: '일식.png' },
                { text: '퓨전', value: 'FUSION', image: '퓨전.png' },
                { text: '중식', value: 'CHINESE', image: '중식.png' },
                { text: '양식', value: 'WESTERN', image: '양식.png' }
            ]
        };
    },
    created() {
        this.loadData();
    },
    methods: {
        async searchRestaurants() {
            this.loadData();
        },
        async loadData() {
            try {
                let params = { size: 10, page: 0 };
                if (this.searchType === "restaurantType" && this.selectedType) {
                    params["restaurantType"] = this.selectedType;
                } else if (this.searchValue) {
                    params[this.searchType] = this.searchValue;
                }
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/list`, { params });
                this.restaurantList = response.data.content;
            } catch (e) {
                console.error("데이터 로드 실패:", e);
            }
        },
        setCategoryAndSearch(categoryValue) {
            this.searchType = "restaurantType";
            this.selectedType = categoryValue;
            this.searchRestaurants();
        },goToDetail(id) {
            this.$router.push(`/restaurant/detail/${id}`);
        }
    }
};
</script>
