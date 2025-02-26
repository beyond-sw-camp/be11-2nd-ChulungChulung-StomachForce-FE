<template>
    <div class="container mx-auto p-4">
        <!-- 상단 네비게이션 탭 -->
        <v-tabs v-model="tab">
            <v-tab :to="`/restaurant/detail/${restaurantId}`">레스토랑 홈</v-tab>
            <v-tab :to="`/restaurant/detail/${restaurantId}/main`">상세정보</v-tab>
            <v-tab @click="reload()">메뉴</v-tab>
            <v-tab :to="`/restaurant/detail/${restaurantId}/reviews`">리뷰</v-tab>
        </v-tabs>

        <h1 class="text-3xl font-bold text-center mb-8">{{ restaurantName }}</h1>

        <!-- 메뉴 등록 버튼 -->
        <div class="text-right mb-4">
            <button 
                v-if="isLoggedIn && isRestaurantOwner" 
                class="bg-red text-white px-4 py-2 rounded hover:bg-blue-700"
                @click="navigateToMenuRegistration"
            >
                메뉴 등록
            </button>
        </div>
        
        <div class="grid grid-cols-4 gap-6">
            <div
                v-for="menu in menuList"
                :key="menu.id"
                class="bg-white rounded-lg shadow-md overflow-hidden w-full"
            >
                <!-- 메뉴 이름 -->
                <div class="flex justify-center items-center py-4">
                    <h2 class="text-xl font-bold text-center">{{ menu.name }}</h2>
                </div>

                <!-- 이미지 컨테이너 -->
                <div class="w-full h-[300px] flex justify-center items-center">
                    <img
                        v-if="menu.menuPhoto"
                        :src="menu.menuPhoto"
                        :alt="menu.name"
                        class="max-w-full max-h-full object-contain"
                        style="display: block; margin: auto;"
                    />
                    <div 
                        v-else 
                        class="w-full h-full bg-gray-100 flex items-center justify-center"
                    >
                        <span class="text-3xl">🍽️</span>
                    </div>
                </div>

                <!-- 메뉴 정보 -->
                <div class="p-4">
                    <p class="text-gray-600 mb-1"><strong>메뉴설명:</strong> {{ menu.description }}</p>
                    <p class="text-xl font-bold text-blue-600 mb-1"><strong>가격:</strong> {{ numberWithCommas(menu.price) }}원</p>
                    <p class="text-gray-600 mb-1"><strong>알레르기정보:</strong></p>
                    <div class="text-sm text-gray-500">
                        <span v-if="hasAllergies(menu.allergyInfo)">
                            <span 
                                v-for="allergy in getAllergyList(menu.allergyInfo)" 
                                :key="allergy.key"
                                class="mr-2"
                            >
                                {{ allergy.label }}
                            </span>
                        </span>
                        <span v-else>해당없음</span>
                    </div>

                    <!-- 수정 및 삭제 버튼 -->
                    <div class="flex text-right mt-4">
                        <button 
                            v-if="isLoggedIn && isRestaurantOwner" 
                            class="bg-blue text-white px-2 py-1 rounded hover:bg-yellow-600"
                            @click="navigateToMenuUpdate(menu.id)"
                        >
                            수정
                        </button>
                        <button 
                            v-if="isLoggedIn && isRestaurantOwner" 
                            class="bg-yellow text-white px-2 py-1 rounded hover:bg-red-600"
                            @click="deleteMenu(menu.id)"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "MenuList",
    data() {
        return {
            menuList: [],
            restaurantName: "",
            loading: false,
            allergyLabels: {
                milk: "우유",
                egg: "계란",
                wheat: "밀",
                soy: "대두",
                peanut: "땅콩",
                nuts: "견과류",
                fish: "생선",
                shellfish: "조개류"
            },
            isLoggedIn: false,
            tab: null,
        };
    },
    computed: {
        // 라우트 변경 시 자동으로 반영되도록 설정
        restaurantId() {
            return this.$route.params.id;
        },
        isRestaurantOwner() {
            return this.isLoggedIn && this.restaurantId === this.$route.params.id;
        }
    },
    watch: {
        // 라우트 변경 감지 -> restaurantId 업데이트 및 데이터 다시 로드
        "$route.params.id": {
            immediate: true, // 컴포넌트가 처음 로드될 때도 실행
            handler(newId) {
                if (newId) {
                    this.fetchRestaurantDetail();
                    this.fetchMenuList();
                }
            }
        }
    },
    methods: {
        async fetchRestaurantDetail() {
            if (!this.restaurantId) return;
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${this.restaurantId}`
                );
                this.restaurantName = response.data.name;
            } catch (error) {
                console.error("레스토랑 정보 조회 실패:", error);
            }
        },
        async fetchMenuList() {
            if (!this.restaurantId) {
                console.warn("🚨 restaurantId가 null입니다. API 요청을 생략합니다.");
                return;
            }
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/menu/list/${this.restaurantId}`
                );
                this.menuList = response.data;
            } catch (error) {
                console.error("메뉴 목록 조회 실패:", error);
            }
        },
        numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        navigateToMenuRegistration() {
            this.$router.push("/menu/create");
        },
        navigateToMenuUpdate(menuId) {
            this.$router.push(`/menu/update/${menuId}`);
        },
        async deleteMenu(menuId) {
            if (confirm("정말로 이 메뉴를 삭제하시겠습니까?")) {
                try {
                    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/menu/delete/${menuId}`);
                    this.menuList = this.menuList.filter(menu => menu.id !== menuId);
                } catch (error) {
                    console.error("메뉴 삭제 실패:", error);
                }
            }
        },
        checkUserStatus() {
            this.isLoggedIn = true;
            this.restaurantId = localStorage.getItem("restaurantId");
        },
        reload() {
            window.location.reload();
        },
    },

};
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
}

.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

img {
    max-width: 100% !important;
    max-height: 300px !important;
    object-fit: contain;
}

@media (max-width: 1024px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .grid {
        grid-template-columns: 1fr;
    }
}
</style>