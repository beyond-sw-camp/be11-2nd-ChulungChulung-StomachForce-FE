<template>
    <div class="container mx-auto p-4">
        <v-card class="max-w-3xl mx-auto rounded-lg shadow-lg">
            <v-card-title class="text-h4 font-weight-bold text-center py-6 bg-orange">
                메뉴 등록
            </v-card-title>

            <v-card-text class="pa-6">
                <form @submit.prevent="createMenu">
                    <div class="mb-6">
                        <label for="name" class="text-subtitle-1 font-weight-medium mb-2 d-block">메뉴 이름</label>
                        <v-text-field
                            v-model="menu.name"
                            id="name"
                            variant="outlined"
                            placeholder="메뉴 이름을 입력하세요"
                            required
                        ></v-text-field>
                    </div>

                    <div class="mb-6">
                        <label for="price" class="text-subtitle-1 font-weight-medium mb-2 d-block">가격</label>
                        <v-text-field
                            v-model="menu.price"
                            id="price"
                            variant="outlined"
                            type="number"
                            placeholder="가격을 입력하세요"
                            prefix="₩"
                            required
                        ></v-text-field>
                    </div>

                    <div class="mb-6">
                        <label for="description" class="text-subtitle-1 font-weight-medium mb-2 d-block">설명</label>
                        <v-textarea
                            v-model="menu.description"
                            id="description"
                            variant="outlined"
                            rows="4"
                            placeholder="메뉴에 대한 설명을 입력하세요"
                            required
                        ></v-textarea>
                    </div>

                    <div class="mb-6">
                        <label class="text-subtitle-1 font-weight-medium mb-2 d-block">메뉴 사진 (필수)</label>
                        <v-file-input
                            @change="onFileChange"
                            accept="image/*"
                            variant="outlined"
                            prepend-icon="mdi-camera"
                            placeholder="사진을 선택해주세요"
                            required
                            show-size
                        ></v-file-input>
                    </div>

                    <v-card class="mb-6 pa-4" variant="outlined">
                        <v-card-title class="text-h6 mb-4">알레르기 정보</v-card-title>
                        <v-row>
                            <v-col cols="6" sm="3" v-for="(value, key) in menu.allergyInfo" :key="key">
                                <v-checkbox
                                    :model-value="value === 'Y'"
                                    @change="toggleAllergy(key)"
                                    :label="getAllergyLabel(key)"
                                ></v-checkbox>
                            </v-col>
                        </v-row>
                    </v-card>

                    <div class="d-flex justify-end gap-3">
                        <v-btn
                            color="grey"
                            variant="outlined"
                            @click="$router.go(-1)"
                        >
                            취소
                        </v-btn>
                        <v-btn
                            color="orange"
                            type="submit"
                            :disabled="!menu.menuPhoto"
                        >
                            등록
                        </v-btn>
                    </div>
                </form>
            </v-card-text>
        </v-card>
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
        },
        getAllergyLabel(key) {
            const labels = {
                milk: '우유',
                egg: '계란',
                wheat: '밀',
                soy: '대두',
                peanut: '땅콩',
                nuts: '견과류',
                fish: '생선',
                shellfish: '조개류'
            };
            return labels[key];
        }
    }
}
</script>

<style scoped>
.bg-orange {
    background-color: #FF5733 !important;
    color: white;
}

.v-btn.orange {
    background-color: #FF5733 !important;
    color: white;
}

.gap-3 {
    gap: 12px;
}
</style>