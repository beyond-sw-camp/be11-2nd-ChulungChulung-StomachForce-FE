<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold text-center mb-8">메뉴 등록</h1>
        <form @submit.prevent="createMenu">
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
                <label for="menuPhoto" class="block text-gray-700">메뉴 사진 (필수):</label>
                <input 
                    type="file" 
                    @change="onFileChange" 
                    id="menuPhoto" 
                    class="mt-1 block w-full border rounded-md" 
                    accept="image/*"
                    required
                />
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
            <button 
                type="submit" 
                class="bg-blue text-white px-4 py-2 rounded hover:bg-blue-700"
                :disabled="!menu.menuPhoto"
            >
                등록
            </button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
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
        async createMenu() {
            const formData = new FormData();
            formData.append('restaurantId', localStorage.getItem('restaurantId'));
            formData.append('name', this.menu.name);
            formData.append('price', this.menu.price);
            formData.append('description', this.menu.description);
            formData.append('menuPhoto', this.menu.menuPhoto);
            Object.entries(this.menu.allergyInfo).forEach(([key, value]) => {
                formData.append(`allergyInfo.${key}`, value); // "allergyInfo.wheat" : "Y"
            });            
            try {
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/menu/create`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('메뉴가 등록되었습니다.');
                const restaurantId = localStorage.getItem('restaurantId');
                this.$router.push(`/menu/list/${restaurantId}`); // 메뉴 목록으로 이동
            } catch (error) {
                console.error('메뉴 등록 실패:', error);
                alert('메뉴 등록에 실패했습니다: ' + error.response.data); // 사용자에게 오류 메시지 표시
            }
        }
    }
}
</script>