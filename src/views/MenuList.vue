<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold text-center mb-8">{{ restaurantName }}</h1>

        <!-- 메뉴 등록 버튼 -->
        <div class="text-center mb-4">
            <button 
                v-if="isLoggedIn && isRestaurantOwner" 
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                @click="navigateToMenuRegistration"
            >
                메뉴 등록
            </button>
        </div>
        
        <div class="grid grid-cols-3 gap-6">
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
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import axios from 'axios';

export default {
    name: 'MenuList',
    data() {
        return {
            menuList: [],
            restaurantName: '',
            loading: false,
            allergyLabels: {
                milk: '우유',
                egg: '계란',
                wheat: '밀',
                soy: '대두',
                peanut: '땅콩',
                nuts: '견과류',
                fish: '생선',
                shellfish: '조개류'
            },
            isLoggedIn: false,
            restaurantId: null
        }
    },
    async created() {
        await this.fetchRestaurantDetail();
        await this.fetchMenuList();
        this.checkUserStatus();
    },
    methods: {
        async fetchRestaurantDetail() {
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/restaurant/detail/${this.$route.params.id}`
                );
                this.restaurantName = response.data.name;
            } catch (error) {
                console.error('레스토랑 정보 조회 실패:', error);
            }
        },
        async fetchMenuList() {
            this.loading = true;
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/menu/list/${this.$route.params.id}`
                );
                this.menuList = response.data;
            } catch (error) {
                console.error('메뉴 목록 조회 실패:', error);
            } finally {
                this.loading = false;
            }
        },
        numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        getAllergyList(allergyInfo) {
            if (!allergyInfo) return [];
            return Object.entries(allergyInfo)
                .filter(([key, value]) => value === 'Y')
                .map(([key]) => ({
                    key,
                    label: this.allergyLabels[key]
                }));
        },
        hasAllergies(allergyInfo) {
            if (!allergyInfo) return false;
            return Object.values(allergyInfo).some(value => value === 'Y');
        },
        navigateToMenuRegistration() {
            this.$router.push('/menu/create');
        },
        checkUserStatus() {
            this.isLoggedIn = true;
            this.restaurantId = this.$route.params.id;
        }
    },
    computed: {
        isRestaurantOwner() {
            return this.isLoggedIn && this.restaurantId === this.$route.params.id;
        }
    }
}
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