<template>
    <v-container class="py-8">
        <!-- 상단 네비게이션 탭 -->
        <v-tabs v-model="tab" class="mb-8">
            <v-tab :to="`/restaurant/detail/${restaurantId}/home`">레스토랑 홈</v-tab>
            <v-tab :to="`/restaurant/detail/${restaurantId}/main`">상세정보</v-tab>
            <v-tab :to="`/menu/list/${restaurantId}`">메뉴</v-tab>
            <v-tab :to="`/restaurant/detail/${restaurantId}/reviews`">리뷰</v-tab>
            <v-tab :to="`/restaurant/detail/${restaurantId}/reservation`">예약하기</v-tab>
        </v-tabs>

        <!-- 레스토랑 이름 -->
        <div class="menu-header text-center mb-8">
            <h1 class="text-h3 font-weight-bold mb-4">{{ restaurantName }}</h1>
            <div class="divider">
                <span class="divider-line"></span>
                <v-icon size="24" color="grey-darken-2" class="mx-3">mdi-silverware-fork-knife</v-icon>
                <span class="divider-line"></span>
            </div>
        </div>

        <!-- 메뉴 등록 버튼 -->
        <div class="text-right mb-6" v-if="isLoggedIn && isRestaurantOwner">
            <v-btn
                color="deep-orange"
                @click="navigateToMenuRegistration"
                prepend-icon="mdi-plus"
            >
                메뉴 등록
            </v-btn>
        </div>

        <!-- 메뉴 그리드 -->
        <v-row>
            <v-col v-for="menu in menuList" :key="menu.id" cols="12" md="6" lg="4">
                <v-card class="menu-card" elevation="0">
                    <!-- 메뉴 이름 -->
                    <div class="menu-name text-h5 font-weight-bold text-center py-4">
                        {{ menu.name }}
                    </div>

                    <!-- 메뉴 이미지 -->
                    <div class="menu-image-container">
                        <v-img
                            v-if="menu.menuPhoto"
                            :src="menu.menuPhoto"
                            height="300"
                            cover
                            class="menu-image"
                        ></v-img>
                        <div v-else class="menu-image-placeholder">
                            <v-icon size="48" color="grey">mdi-food</v-icon>
                        </div>
                    </div>

                    <!-- 메뉴 정보 -->
                    <div class="menu-info pa-6">
                        <p class="menu-description mb-4">{{ menu.description }}</p>
                        <div class="menu-price-line">
                            <span class="dots"></span>
                            <span class="price font-weight-bold">{{ numberWithCommas(menu.price) }}원</span>
                        </div>

                        <!-- 알레르기 정보 -->
                        <div class="allergy-info mt-4" v-if="hasAllergies(menu.allergyInfo)">
                            <div class="text-subtitle-2 font-weight-medium mb-2">알레르기 정보</div>
                            <v-chip-group>
                                <v-chip
                                    v-for="allergy in getAllergyList(menu.allergyInfo)"
                                    :key="allergy.key"
                                    size="small"
                                    color="grey-lighten-3"
                                    class="mr-1"
                                >
                                    {{ allergy.label }}
                                </v-chip>
                            </v-chip-group>
                        </div>

                        <!-- 수정/삭제 버튼 -->
                        <div class="d-flex justify-end mt-4" v-if="isLoggedIn && isRestaurantOwner">
                            <v-btn
                                variant="text"
                                color="primary"
                                class="mr-2"
                                @click="navigateToMenuUpdate(menu.id)"
                            >
                                수정
                            </v-btn>
                            <v-btn
                                variant="text"
                                color="error"
                                @click="deleteMenu(menu.id)"
                            >
                                삭제
                            </v-btn>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
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
            restaurantId: null,
            tab: null
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
        navigateToMenuUpdate(menuId) {
            this.$router.push(`/menu/update/${menuId}`);
        },
        async deleteMenu(menuId) {
            if (confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
                try {
                    await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/menu/delete/${menuId}`);
                    this.menuList = this.menuList.filter(menu => menu.id !== menuId);
                } catch (error) {
                    console.error('메뉴 삭제 실패:', error);
                }
            }
        },
        checkUserStatus() {
            this.isLoggedIn = true;
            this.restaurantId = localStorage.getItem('restaurantId');
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
.menu-header {
    position: relative;
    padding: 40px 0;
}

.menu-header h1 {
    font-family: 'Playfair Display', serif;
    letter-spacing: 1px;
}

.divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}

.divider-line {
    height: 2px;
    width: 120px;
    background: linear-gradient(90deg, 
        transparent, 
        #8B4513 20%, 
        #8B4513 80%, 
        transparent
    );
}

.menu-card {
    border: none;
    border-radius: 20px;
    margin-bottom: 32px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(to bottom, #ffffff, #fafafa);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.menu-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.menu-name {
    position: relative;
    border-bottom: 2px solid #e0e0e0;
    font-family: 'Noto Sans KR', 'Pretendard', sans-serif;
    color: #1a1a1a;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    letter-spacing: -0.3px;
    font-size: 1.6rem !important;
    padding: 28px 32px !important;
    font-weight: 700 !important;
    line-height: 1.4;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.menu-name::before,
.menu-name::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, 
        transparent,
        rgba(139, 69, 19, 0.2) 20%,
        rgba(139, 69, 19, 0.2) 80%,
        transparent
    );
}

.menu-name::before {
    left: 0;
}

.menu-name::after {
    right: 0;
}

.menu-name::before {
    transform: translateY(-6px);
}

.menu-name::after {
    transform: translateY(-3px);
}

.menu-card:hover .menu-name {
    background: linear-gradient(135deg, #ffffff 0%, #fff5f2 100%);
    color: #8B4513;
}

.menu-image-container {
    position: relative;
    height: 300px;
    border: none;
    overflow: hidden;
}

.menu-image {
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-card:hover .menu-image {
    transform: scale(1.05);
}

.menu-image-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(45deg, #f5f5f5, #fafafa);
}

.menu-info {
    background: linear-gradient(to bottom, #ffffff, #fafafa);
    padding: 32px !important;
}

.menu-description {
    font-family: 'Noto Sans KR', 'Pretendard', sans-serif;
    color: #4a4a4a;
    line-height: 1.7;
    font-size: 0.95rem;
    letter-spacing: -0.3px;
    font-weight: 400;
}

.menu-price-line {
    display: flex;
    align-items: center;
    margin: 24px 0;
}

.dots {
    flex: 1;
    height: 1px;
    margin: 0 20px;
    background: repeating-linear-gradient(
        90deg,
        #8B4513,
        #8B4513 3px,
        transparent 3px,
        transparent 8px
    );
    opacity: 0.5;
}

.price {
    font-family: 'Noto Sans KR', 'Pretendard', sans-serif;
    font-size: 1.5rem;
    color: #1a1a1a;
    font-weight: 600;
    letter-spacing: -0.3px;
}

.allergy-info {
    border-top: 1px solid #e0e0e0;
    padding-top: 24px;
    margin-top: 24px;
}

.allergy-info .text-subtitle-2 {
    font-family: 'Noto Sans KR', 'Pretendard', sans-serif;
    letter-spacing: -0.3px;
    color: #2c3e50;
    font-weight: 500;
}

.v-chip {
    font-size: 0.85rem !important;
    letter-spacing: 0.3px;
}

.v-btn {
    text-transform: none;
    letter-spacing: 0.5px;
    font-weight: 500;
}

@media (max-width: 600px) {
    .menu-header {
        padding: 24px 0;
    }

    .menu-card {
        margin-bottom: 24px;
    }

    .text-h3 {
        font-size: 2rem !important;
    }

    .menu-info {
        padding: 24px !important;
    }
}
</style>