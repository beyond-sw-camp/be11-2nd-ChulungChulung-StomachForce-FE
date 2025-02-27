<template>
    <v-container class="pa-0">
        <!-- 탭 메뉴 -->
        <v-tabs v-model="selectedTab">
            <v-tab value="users">일반 유저</v-tab>
            <v-tab value="restaurants">사업자 (레스토랑)</v-tab>
        </v-tabs>

        <!-- 일반 유저 리스트 -->
        <div v-if="selectedTab === 'users'" class="mt-4">
            <!-- 헤더 행 -->
            <div class="list-header d-flex align-center px-4 py-3">
                <span class="user-info">닉네임</span>
                <span class="user-info">이메일</span>
                <span class="user-info">연락처</span>
                <span class="status-col text-center">VIP등급</span>
                <span class="status-col text-center">인플루언서</span>
                <span class="status-col text-center">상태</span>
                <span class="action-col text-center">관리</span>
            </div>

            <v-list class="list-content">
                <v-list-item
                    v-for="user in filteredUsers"
                    :key="user.userId"
                    class="list-item"
                >
                    <div class="d-flex align-center w-100">
                        <span class="user-info">{{ user.nickName }}</span>
                        <span class="user-info">{{ user.email }}</span>
                        <span class="user-info">{{ user.phoneNumber }}</span>
                        <span class="status-col text-center">
                            <v-select
                                v-model="user.vipGrade"
                                :items="['S', 'A', 'B', 'C', 'D']"
                                density="compact"
                                class="status-select"
                            ></v-select>
                        </span>
                        <span class="status-col text-center">
                            <v-select
                                v-model="user.influencer"
                                :items="[{title: 'Y', value: 'Y'}, {title: 'N', value: 'N'}]"
                                density="compact"
                                class="status-select"
                            ></v-select>
                        </span>
                        <span class="status-col text-center">
                            <v-select
                                v-model="user.userStatus"
                                :items="[{title: '활성', value: 'Y'}, {title: '정지', value: 'S'}]"
                                density="compact"
                                class="status-select"
                            ></v-select>
                        </span>
                        <span class="action-col text-center">
                            <v-btn
                                @click="updateUserStatus(user)"
                                color="primary"
                                size="small"
                            >
                                수정
                            </v-btn>
                        </span>
                    </div>
                </v-list-item>
            </v-list>
        </div>

        <!-- 레스토랑 리스트 -->
        <div v-else class="mt-4">
            <!-- 헤더 행 -->
            <div class="list-header d-flex align-center px-4 py-3">
                <span class="restaurant-info">매장명</span>
                <span class="restaurant-info">이메일</span>
                <span class="restaurant-info">연락처</span>
                <span class="status-col text-center">상태</span>
                <span class="action-col text-center">관리</span>
            </div>

            <v-list class="list-content">
                <v-list-item
                    v-for="restaurant in filteredRestaurants"
                    :key="restaurant.id"
                    class="list-item"
                >
                    <div class="d-flex align-center w-100">
                        <span class="restaurant-info">{{ restaurant.name }}</span>
                        <span class="restaurant-info">{{ restaurant.email }}</span>
                        <span class="restaurant-info">{{ restaurant.phoneNumber }}</span>
                        <span class="status-col text-center">
                            <v-select
                                v-model="restaurant.status"
                                :items="[{title: '활성', value: 'ACTIVE'}, {title: '비활성', value: 'INACTIVE'}]"
                                density="compact"
                                class="status-select"
                            ></v-select>
                        </span>
                        <span class="action-col text-center">
                            <v-btn
                                @click="updateRestaurantStatus(restaurant)"
                                color="primary"
                                size="small"
                            >
                                수정
                            </v-btn>
                        </span>
                    </div>
                </v-list-item>
            </v-list>
        </div>

        <!-- 검색창 -->
        <div class="search-container mt-4">
            <div class="search-bar">
                <img 
                    src="@/assets/stomach.png" 
                    alt="뱃살력 로고" 
                    class="search-logo"
                />
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="검색어 입력"
                    class="search-input"
                />
                <v-icon class="search-icon">mdi-magnify</v-icon>
            </div>
        </div>
    </v-container>
</template>

<script>
import axios from "axios";
import { ref, onMounted, nextTick, computed } from "vue";

export default {
    setup() {
        const users = ref([]);
        const restaurants = ref([]);
        const searchQuery = ref("");
        const selectedTab = ref("users");

        // ✅ API 호출
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`);
                users.value = Array.isArray(response.data) ? response.data : [];
                await nextTick();
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        const fetchRestaurants = async () => {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/listmanage`);
                restaurants.value = Array.isArray(response.data) ? response.data : [];
                await nextTick();
            } catch (error) {
                console.error("Error fetching restaurants:", error);
            }
        };

        // ✅ 유저 상태 업데이트
        const updateUserStatus = async (user) => {
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/user/update/status/${user.userId}`, {
                    vipGrade: user.vipGrade,
                    influencer: user.influencer,
                    userStatus: user.userStatus
                });
                alert("유저 상태가 변경되었습니다.");
            } catch (error) {
                alert("유저 상태 변경에 실패했습니다.");
            }
        };

        // ✅ 레스토랑 상태 업데이트
        const updateRestaurantStatus = async (restaurant) => {
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/restaurant/update/status/${restaurant.id}`, {
                    status: restaurant.status
                });
                alert("레스토랑 상태가 변경되었습니다.");
            } catch (error) {
                alert("레스토랑 상태 변경에 실패했습니다.");
            }
        };

        // ✅ ADMIN 계정 필터링 + 검색 기능
        const filteredUsers = computed(() => {
            return users.value
                .filter(user => user.role !== "ADMIN") // ADMIN 제외
                .filter(user =>
                    user.nickName?.includes(searchQuery.value) ||
                    user.identify?.includes(searchQuery.value) ||
                    user.email?.includes(searchQuery.value)
                ); // 검색어 필터링
        });

        // ✅ 검색 기능 (레스토랑)
        const filteredRestaurants = computed(() => {
            return restaurants.value.filter(restaurant =>
                restaurant.name?.includes(searchQuery.value)
            );
        });

        onMounted(() => {
            fetchUsers();
            fetchRestaurants();
        });

        return {
            users, restaurants, searchQuery, selectedTab,
            updateUserStatus, updateRestaurantStatus,
            filteredUsers, filteredRestaurants
        };
    },
};
</script>

<style scoped>
.list-header {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #424242;
    border-radius: 4px 4px 0 0;
    font-size: 0.9rem;
}

.list-content {
    background: transparent !important;
    border-radius: 0 0 4px 4px;
}

.list-item {
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.2s;
    min-height: 60px !important;
}

.list-item:hover {
    background-color: #f5f5f5;
}

.list-item:last-child {
    border-bottom: none;
}

.user-info,
.restaurant-info {
    flex: 1;
    padding: 0 8px;
}

.status-col {
    width: 120px;
    flex-shrink: 0;
}

.action-col {
    width: 80px;
    flex-shrink: 0;
}

.status-select {
    max-width: 100px;
}

/* 검색창 스타일 */
.search-container {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.search-bar {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 50px;
    height: 44px;
    padding: 4px 10px;
    gap: 6px;
    max-width: 500px;
    width: 100%;
    border: 2px solid #F04E23;
}

.search-logo {
    height: 30px;
    margin-left: 8px;
    margin-right: 8px;
}

.search-input {
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    padding: 0 12px;
    font-size: 14px;
}

.search-icon {
    color: #F04E23;
    margin-right: 12px;
    cursor: pointer;
}

/* v-list 기본 패딩 제거 */
:deep(.v-list-item__content) {
    padding: 0;
}

:deep(.v-list-item) {
    padding: 8px 16px;
}
</style>
