<template>
    <div class="p-4">
        <!-- ✅ 유저 & 레스토랑 선택 탭 -->
        <div class="mb-4 flex justify-center">
            <button @click="selectedTab = 'users'" :class="{'active-tab': selectedTab === 'users'}" class="tab-button">
                일반 유저
            </button>
            <button @click="selectedTab = 'restaurants'" :class="{'active-tab': selectedTab === 'restaurants'}" class="tab-button">
                사업자 (레스토랑)
            </button>
        </div>

        <!-- ✅ 검색창 -->
        <div class="mb-4 w-full flex justify-center">
            <div class="flex w-full max-w-lg">
                <input v-model="searchQuery" type="text" :placeholder="selectedTab === 'users' ? '아이디 검색' : '레스토랑명 검색'"
                    class="border border-red-500 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-red-300" />
                <button @click="searchData" class="bg-red-600 text-white p-2 ml-2 rounded-md hover:bg-red-700 transition">
                    🔍
                </button>
            </div>
        </div>

        <!-- ✅ 일반 유저 테이블 -->
        <table v-if="selectedTab === 'users'" class="w-3/4 border-collapse border mx-auto">
            <thead>
                <tr class="bg-red-100">
                    <th class="border p-2">아이디</th>
                    <th class="border p-2">이메일</th>
                    <th class="border p-2">연락처</th>
                    <th class="border p-2">VIP 등급</th>
                    <th class="border p-2">인플루언서</th>
                    <th class="border p-2">상태</th>
                    <th class="border p-2">수정</th>
                </tr>
            </thead>
            <tbody>
    <tr v-for="user in users" :key="user.userId">
        <td class="border p-2">{{ user.identify }}</td>  <!-- ✅ 수정됨 -->
        <td class="border p-2">{{ user.email }}</td>
        <td class="border p-2">{{ user.phoneNumber }}</td>
        <td class="border p-2">
            <select v-model="user.vipGrade">
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            </select>
        </td>
        <td class="border p-2">
            <select v-model="user.influencer">
                <option value="Y">Y</option>
                <option value="N">N</option>
            </select>
        </td>
        <td class="border p-2">
            <select v-model="user.userStatus">
                <option value="Y">활성</option>
                <option value="S">정지</option>
            </select>
        </td>
        <td class="border p-2">
            <button @click="updateUserStatus(user)" class="update-button">수정</button>
        </td>
    </tr>
</tbody>
        </table>

        <!-- ✅ 레스토랑 테이블 -->
        <table v-if="selectedTab === 'restaurants'" class="w-3/4 border-collapse border mx-auto">
            <thead>
                <tr class="bg-red-100">
                    <th class="border p-2">레스토랑명</th>
                    <th class="border p-2">이메일</th>
                    <th class="border p-2">연락처</th>
                    <th class="border p-2">상태</th>
                    <th class="border p-2">수정</th>
                </tr>
            </thead>
            <tbody>
    <tr v-for="restaurant in restaurants" :key="restaurant.id">
        <td class="border p-2">{{ restaurant.name }}</td>  <!-- ✅ 수정됨 -->
        <td class="border p-2">{{ restaurant.email }}</td>
        <td class="border p-2">{{ restaurant.phoneNumber }}</td>
        <td class="border p-2">
            <select v-model="restaurant.status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
            </select>
        </td>
        <td class="border p-2">
            <button @click="updateRestaurantStatus(restaurant)" class="update-button">수정</button>
        </td>
    </tr>
</tbody>
        </table>
    </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, nextTick } from "vue";

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
                console.log(response.data)
                if (Array.isArray(response.data)) {
                    users.value = [...response.data]; // ✅ 반응형 데이터 강제 적용
                } else {
                    console.error("API 응답이 배열이 아님:", response.data);
                    users.value = [];
                }

                await nextTick(); // ✅ UI 업데이트 강제 적용
                console.log("저장된 users:", users.value);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        const fetchRestaurants = async () => {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/restaurant/listmanage`);
                console.log(response.data)
                if (Array.isArray(response.data)) {
                    restaurants.value = [...response.data]; // ✅ 반응형 데이터 강제 적용
                } else {
                    console.error("API 응답이 배열이 아님:", response.data);
                    restaurants.value = [];
                }

                await nextTick();
                console.log("저장된 restaurants:", restaurants.value);
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
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/restaurant/update/status/${restaurant.id}`,  {
                    status: restaurant.status 
                });
                alert("레스토랑 상태가 변경되었습니다.");
            } catch (error) {
                alert("레스토랑 상태 변경에 실패했습니다.");
            }
        };

        // ✅ 검색 기능
        const searchData = () => {
            if (selectedTab.value === "users") {
                fetchUsers();
                users.value = users.value.filter(user => user.identify?.includes(searchQuery.value));
            } else {
                fetchRestaurants();
                restaurants.value = restaurants.value.filter(restaurant => restaurant.name?.includes(searchQuery.value));
            }
        };

        onMounted(() => {
            fetchUsers();
            fetchRestaurants();
        });

        return {
            users, restaurants, searchQuery, selectedTab,
            updateUserStatus, updateRestaurantStatus, searchData
        };
    },
};
</script>
