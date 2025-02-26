<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold text-center mb-8">메뉴 수정</h1>
        <form @submit.prevent="updateMenu">
            <div class="mb-4">
                <label for="name" class="block text-gray-700">메뉴 이름:</label>
                <input type="text" v-model="menu.name" id="name" class="mt-1 block w-full border rounded-md" required />
            </div>
            <div class="mb-4">
                <label for="price" class="block text-gray-700">가격:</label>
                <input type="number" v-model="menu.price" id="price" class="mt-1 block w-full border rounded-md" required />
            </div>
            <div class="mb-4">
                <label for="description" class="block text-gray-700">설명:</label>
                <textarea v-model="menu.description" id="description" class="mt-1 block w-full border rounded-md" required></textarea>
            </div>
            <div class="mb-4">
                <label for="menuPhoto" class="block text-gray-700">메뉴 사진:</label>
                <input type="file" @change="onFileChange" id="menuPhoto" class="mt-1 block w-full border rounded-md" />
            </div>
            <div class="mb-4">
                <h2 class="text-lg font-bold">알레르기 정보:</h2>
                <div class="flex flex-wrap">
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.milk === 'Y'" @change="toggleAllergy('milk')" /> 우유
                    </label>
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.egg === 'Y'" @change="toggleAllergy('egg')" /> 계란
                    </label>
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.wheat === 'Y'" @change="toggleAllergy('wheat')" /> 밀
                    </label>
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.soy === 'Y'" @change="toggleAllergy('soy')" /> 대두
                    </label>
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.peanut === 'Y'" @change="toggleAllergy('peanut')" /> 땅콩
                    </label>
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.nuts === 'Y'" @change="toggleAllergy('nuts')" /> 견과류
                    </label>
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.fish === 'Y'" @change="toggleAllergy('fish')" /> 생선
                    </label>
                    <label class="mr-4">
                        <input type="checkbox" :checked="menu.allergyInfo.shellfish === 'Y'" @change="toggleAllergy('shellfish')" /> 조개류
                    </label>
                </div>
            </div>
            <button type="submit" class="bg-blue text-white px-4 py-2 rounded hover:bg-blue-700">수정</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    props: ['menuId'],
    data() {
        return {
            menu: {
                name: '',
                price: null,
                description: '',
                menuPhoto: null,
                allergyInfo: {
                    milk: 'N',
                    egg: 'N',
                    wheat: 'N',
                    soy: 'N',
                    peanut: 'N',
                    nuts: 'N',
                    fish: 'N',
                    shellfish: 'N',
                }
            }
        };
    },
    methods: {
        onFileChange(event) {
            this.menu.menuPhoto = event.target.files[0];
        },
        toggleAllergy(allergy) {
            this.menu.allergyInfo[allergy] = this.menu.allergyInfo[allergy] === 'Y' ? 'N' : 'Y';
        },
        async updateMenu() {
            try {
                const formData = new FormData();
                formData.append('name', this.menu.name);
                formData.append('price', this.menu.price);
                formData.append('description', this.menu.description);
                
                // 새로운 메뉴 사진이 선택된 경우에만 추가
                if (this.menu.menuPhoto && this.menu.menuPhoto instanceof File) {
                    formData.append('menuPhoto', this.menu.menuPhoto);
                }

                // 알레르기 정보 추가
                Object.entries(this.menu.allergyInfo).forEach(([key, value]) => {
                    formData.append(`allergyInfo.${key}`, value);
                });

                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/menu/update/${this.$route.params.id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                alert('메뉴가 수정되었습니다.');
                this.$router.push(`/menu/list/${localStorage.getItem('restaurantId')}`);
            } catch (error) {
                console.error('메뉴 수정 실패:', error);
                alert('메뉴 수정에 실패했습니다.');
            }
        },
        async fetchMenu() {
            const restaurantId = localStorage.getItem('restaurantId');
            if (!restaurantId) {
                alert('식당 ID가 없습니다. 다시 로그인해주세요.');
                this.$router.push('/login');
                return;
            }
            console.log("라우트에서 받은 menuId:", this.menuId);

            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/menu/list/${restaurantId}`);
                console.log("서버에서 받은 메뉴 목록:", response.data);

                const menuId = Number(this.$route.params.menuId);
                console.log("현재 메뉴 ID:", menuId);

                const menuItem = response.data.find(menu => menu.id === menuId);

                if (menuItem) {
                    this.menu = menuItem;
                } else {
                    console.log("메뉴를 찾을 수 없음! 목록 확인:", response.data);
                    alert("해당 ID의 메뉴를 찾을 수 없습니다.");
                }
            } catch (error) {
                console.error('메뉴 불러오기 실패:', error);
                alert('메뉴를 불러오는 데 실패했습니다.');
            }
        }

    },
    created() {
        this.fetchMenu();
    }
}
</script>