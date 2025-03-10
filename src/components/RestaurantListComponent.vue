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
        <v-row v-show="restaurantList.length > 0">
            <v-col v-for="(restaurant, index) in restaurantList" :key="restaurant.id || index" cols="12" sm="6" md="4" lg="3">
                <v-card @click="goToDetail(restaurant.id)" class="restaurant-card" elevation="0">
                    <div class="image-wrapper">
                        <v-img 
                            :src="restaurant.imagePath || '/noImage.jpg'" 
                            class="restaurant-image" 
                            height="220"
                            cover
                        >
                            <template v-slot:placeholder>
                                <v-row class="fill-height ma-0" align="center" justify="center">
                                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                </v-row>
                            </template>
                        </v-img>
                        <div class="image-gradient"></div>
                        <div class="overlay-content">
                            <v-chip class="restaurant-type-chip" color="white" text-color="#FF5722">
                                {{ restaurant.restaurantType }}
                            </v-chip>
                            <div class="rating-badge">
                                <v-icon color="amber-darken-2" size="18">mdi-star</v-icon>
                                <span class="review-count">
                                    별점 {{ restaurant.averageRating ? restaurant.averageRating.toFixed(1) : '0.0' }} <br> 리뷰 {{ restaurant.reviewCount }}개
                                </span>
                            </div>
                        </div>
                    </div>

                    <v-card-text class="content-wrapper pa-4">
                        <div class="d-flex justify-space-between align-center mb-2">
                            <h3 class="restaurant-name text-truncate">{{ restaurant.name }}</h3>
                        </div>

                        <div class="address-wrapper mb-3">
                            <v-icon size="16" color="grey-darken-1">mdi-map-marker</v-icon>
                            <span class="address-text">{{ restaurant.address }}</span>
                        </div>

                        <div class="stats-container">
                            <div class="stat-item">
                                <v-icon size="18" color="#FF5722">mdi-bookmark</v-icon>
                                <span class="stat-text">{{ restaurant.bookmarkCount }}</span>
                            </div>
                            <div class="divider"></div>
                            <div class="stat-item">
                                <v-icon size="18" color="#FF5722">mdi-comment</v-icon>
                                <span class="stat-text">{{ restaurant.reviewCount }}</span>
                            </div>
                        </div>
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

.restaurant-card {
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    height: 100%;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: white;
}

.restaurant-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
    border-color: rgba(0, 0, 0, 0.12);
}

.image-wrapper {
    position: relative;
    overflow: hidden;
}

.restaurant-image {
    transition: transform 0.4s ease;
}

.restaurant-card:hover .restaurant-image {
    transform: scale(1.05);
}

.image-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);
}

.overlay-content {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.restaurant-type-chip {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    height: 24px;
}

.rating-badge {
    background: white;
    padding: 4px 8px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    font-size: 0.85rem;
    color: #FFA000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.content-wrapper {
    background: white;
}

.restaurant-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    padding-right: 8px;
}

.address-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
}

.address-text {
    font-size: 0.85rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stats-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
}

.divider {
    width: 1px;
    height: 14px;
    background-color: rgba(0, 0, 0, 0.12);
}

.stat-text {
    font-size: 0.85rem;
    font-weight: 500;
    color: #FF5722;
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
            page: 0, // 현재 페이지 번호
            pageSize: 8, // 한 번에 불러올 개수
            isLoading: false, // 데이터 로딩 상태
            isLastPage: false, // 마지막 페이지 여부
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
        window.addEventListener("scroll", this.scrollPagination);
    },
    beforeUnmount() {
        this.isLoading = true;
        window.removeEventListener("scroll", this.scrollPagination);
    },
    methods: {
        async loadData() {
            if (this.isLoading || this.isLastPage) return;

            this.isLoading = true;
            try {
                let params = { size: this.pageSize, page: this.page };

                if (this.searchType === "restaurantType" && this.selectedType) {
                    params["restaurantType"] = this.selectedType;
                } else if (this.searchValue) {
                    params[this.searchType] = this.searchValue;
                }

                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/list`, { params });

                const newRestaurants = response.data?.content || [];
                
                if (newRestaurants.length === 0) {
                    console.log("📌 더 이상 불러올 데이터 없음");
                    this.isLastPage = true;
                    return;
                }

                // 중복 제거
                const existingIds = new Set(this.restaurantList.map(r => r.id));
                const uniqueNewRestaurants = newRestaurants.filter(r => !existingIds.has(r.id));

                if (uniqueNewRestaurants.length === 0) {
                    console.log("📌 중복된 데이터가 감지되어 추가하지 않음");
                    this.isLastPage = true;
                    return;
                }

                this.restaurantList = [...this.restaurantList, ...uniqueNewRestaurants];
                this.page++;
            } catch (e) {
                console.error("❌ 데이터 로드 실패:", e);
            } finally {
                this.isLoading = false;
            }
        },
        scrollPagination() {
            if (this.isLoading || this.isLastPage) return;

            const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
            if (isBottom) {
                this.loadData();
            }
        },
        searchRestaurants() {
            console.log("📌 검색 실행: ", this.searchValue || this.selectedType);

            // ✅ 검색 시 기존 데이터 초기화 & 첫 페이지부터 다시 시작
            this.page = 0;
            this.restaurantList = [];
            this.isLastPage = false;
            
            // ✅ 검색 후에도 페이지네이션 유지
            this.loadData();
        },
        setCategoryAndSearch(categoryValue) {
            this.searchType = "restaurantType";
            this.selectedType = categoryValue;
            this.searchRestaurants();
        },
        goToDetail(id) {
            if (this.isLoading) return;
            this.isLoading = true;
            
            this.$router.push(`/restaurant/detail/${id}`).catch(() => {
                this.isLoading = false; // 만약 라우팅 실패 시 다시 false로 설정
            });
        }
    }
};
</script>
