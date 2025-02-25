<template>
    <div class="p-4">
        <!-- 검색창 -->
        <div class="mb-4 w-full flex justify-center">
            <div class="flex w-full max-w-lg"> 
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="아이디 검색"
                    class="border border-red-500 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <button @click="searchUsers" class="bg-red-600 text-white p-2 ml-2 rounded-md hover:bg-red-700 transition">
                    🔍
                </button>
            </div>
        </div>

        <!-- 회원 테이블 -->
        <table class="w-3/4 border-collapse border mx-auto">
            <thead>
                <tr class="bg-red-100">
                    <th class="border p-2">프로필</th>
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
                <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-red-50">
                    <td class="border p-2">
                        <img :src="user.profilePhoto" alt="Profile" class="profile-photo" />
                    </td>
                    <td class="border p-2">{{ user.identify }}</td>
                    <td class="border p-2">{{ user.email }}</td>
                    <td class="border p-2 font-bold">{{ user.phoneNumber }}</td>
                    <!-- VIP 등급 -->
                    <td class="border p-2">
                        <select v-model="user.vipGrade" class="border border-red-500 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300">
                            <option v-for="grade in vipGrades" :key="grade" :value="grade">
                                {{ grade }}
                            </option>
                        </select>
                    </td>
                    <!-- 인플루언서 상태 -->
                    <td class="border p-2">
                        <select v-model="user.influencer" class="border border-red-500 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300">
                            <option v-for="influencerStatus in influencerStatuses" :key="influencerStatus" :value="influencerStatus">
                                {{ influencerStatus }}
                            </option>
                        </select>
                    </td>
                    <!-- 유저 상태 -->
                    <td class="border p-2">
                        <select v-model="user.userStatus" class="border border-red-500 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300">
                            <option v-for="status in userStatuses" :key="status" :value="status">
                                {{ status }}
                            </option>
                        </select>
                    </td>
                    <!-- 수정 버튼 -->
                    <td class="border p-2">
                        <button @click="updateUserStatus(user)" class="bg-red text-white p-1 px-3 rounded-md hover:bg-red-700 transition">
                            수정
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 페이징 -->
        <div class="flex justify-center mt-4 w-full">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 mx-1 border rounded-md border-red-500 text-red-500 hover:bg-red-100 transition">
                ◀
            </button>
            <span v-for="page in totalPages" :key="page">
                <button
                    @click="changePage(page)"
                    class="px-3 py-1 mx-1 border rounded-md border-red-500 text-red-500 hover:bg-red-100 transition"
                    :class="{ 'bg-red-300': page === currentPage }"
                >
                    {{ page }}
                </button>
            </span>
            <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 mx-1 border rounded-md border-red-500 text-red-500 hover:bg-red-100 transition"
            >
                ▶
            </button>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted } from "vue";

export default {
    setup() {
        const users = ref([]);
        const searchQuery = ref("");
        const currentPage = ref(1);
        const perPage = 10;

        const vipGrades = ref(["S", "A", "B", "C", "D"]);
        const influencerStatuses = ref(["Y", "N"]);
        const userStatuses = ref(["Y", "S"]);

        // API에서 회원 정보 불러오기
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`);
                users.value = response.data;
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        // 검색 기능
        const searchUsers = () => {
            if (searchQuery.value) {
                users.value = users.value.filter(user =>
                    user.identify.includes(searchQuery.value)
                );
            } else {
                fetchUsers(); // 검색 초기화 시 전체 리스트 다시 불러오기
            }
        };

        // 페이징 처리
        const totalPages = computed(() => Math.ceil(users.value.length / perPage));
        const paginatedUsers = computed(() => {
            const start = (currentPage.value - 1) * perPage;
            return users.value.slice(start, start + perPage);
        });

        const changePage = (page) => (currentPage.value = page);
        const prevPage = () => (currentPage.value = Math.max(1, currentPage.value - 1));
        const nextPage = () => (currentPage.value = Math.min(totalPages.value, currentPage.value + 1));

        // 상태 업데이트 요청
        const updateUserStatus = async (user) => {
            console.log("Updating user ID:", user.userId); // ID 확인
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/user/update/status/${user.userId}`, {
                    vipGrade: user.vipGrade,
                    influencer: user.influencer,
                    userStatus: user.userStatus
                });
                alert("수정 완료!");
            } catch (error) {
                console.error("Update failed:", error);
                alert("수정 실패");
            }
        };

        onMounted(fetchUsers);

        return {
            users,
            searchQuery,
            currentPage,
            totalPages,
            paginatedUsers,
            searchUsers,
            changePage,
            prevPage,
            nextPage,
            updateUserStatus,
            vipGrades,
            userStatuses,
            influencerStatuses
        };
    },
};
</script>

<style scoped>
/* 선택 스타일 */
select {
    appearance: none;
    padding: 4px;
    border-radius: 4px;
}

/* 프로필 사진 스타일 */
.profile-photo {
    width: 40px; /* 원하는 크기로 조정 */
    height: 40px; /* 원하는 크기로 조정 */
    border-radius: 50%; /* 원형으로 만들기 */
}
</style>
  