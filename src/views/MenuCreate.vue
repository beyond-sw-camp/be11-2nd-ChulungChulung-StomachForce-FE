<template>
    <v-container>
        <v-card class="mx-auto" max-width="800">
            <v-card-title class="text-h5 font-weight-bold">
                메뉴 등록
            </v-card-title>

            <v-card-text>
                <v-form ref="form" v-model="isFormValid">
                    <v-text-field
                        v-model="menu.name"
                        label="메뉴명"
                        required
                        :rules="nameRules"
                        variant="outlined"
                        class="mb-4"
                    ></v-text-field>

                    <v-text-field
                        v-model.number="menu.price"
                        label="가격"
                        type="number"
                        required
                        :rules="priceRules"
                        variant="outlined"
                        class="mb-4"
                    ></v-text-field>

                    <v-textarea
                        v-model="menu.description"
                        label="메뉴 설명"
                        :rules="descriptionRules"
                        variant="outlined"
                        rows="3"
                        auto-grow
                        class="mb-4"
                    ></v-textarea>

                    <v-file-input
                        v-model="menu.menuPhoto"
                        label="메뉴 사진"
                        accept="image/*"
                        prepend-icon="mdi-camera"
                        variant="outlined"
                        :rules="photoRules"
                        class="mb-4"
                        @change="handleFileChange"
                    ></v-file-input>

                    <!-- 알레르기 정보 체크박스들 -->
                    <v-card-title class="text-subtitle-1">알레르기 정보</v-card-title>
                    <v-row>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.milk" label="우유"></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.egg" label="계란"></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.wheat" label="밀"></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.soy" label="대두"></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.peanut" label="땅콩"></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.nuts" label="견과류"></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.fish" label="생선"></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-checkbox v-model="menu.allergyInfo.shellfish" label="조개류"></v-checkbox>
                        </v-col>
                    </v-row>

                    <div class="d-flex justify-end gap-2 mt-4">
                        <v-btn
                            color="error"
                            variant="text"
                            @click="$router.go(-1)"
                        >
                            취소
                        </v-btn>
                        <v-btn
                            color="primary"
                            :loading="loading"
                            :disabled="!isFormValid"
                            @click="createMenu"
                        >
                            등록
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <v-snackbar
            v-model="showError"
            color="error"
            timeout="3000"
            location="top"
        >
            {{ errorMessage }}
        </v-snackbar>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    name: 'MenuCreate',
    data() {
        return {
            restaurantId: localStorage.getItem('restaurantId'),
            menu: {
                name: '',
                price: null,
                description: '',
                menuPhoto: null,
                allergyInfo: {
                    milk: false,
                    egg: false,
                    wheat: false,
                    soy: false,
                    peanut: false,
                    nuts: false,
                    fish: false,
                    shellfish: false
                }
            },
            isFormValid: false,
            loading: false,
            showError: false,
            errorMessage: '',
            nameRules: [
                v => !!v || '메뉴명을 입력해주세요',
                v => v.length <= 50 || '메뉴명은 50자 이하여야 합니다'
            ],
            priceRules: [
                v => !!v || '가격을 입력해주세요',
                v => v > 0 || '가격은 0보다 커야 합니다'
            ],
            descriptionRules: [
                v => v.length <= 500 || '설명은 500자 이하여야 합니다'
            ],
            photoRules: [
                v => !v || v.size < 5000000 || '파일 크기는 5MB 이하여야 합니다'
            ]
        }
    },
    methods: {
        handleFileChange(file) {
            if (file) {
                this.menu.menuPhoto = file;
            }
        },
        async createMenu() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            try {
                const formData = new FormData();
                formData.append('restaurantId', this.restaurantId);
                formData.append('name', this.menu.name);
                formData.append('price', this.menu.price);
                formData.append('description', this.menu.description);

                // 메뉴 사진이 있는 경우에만 추가
                if (this.menu.menuPhoto instanceof File) {
                    formData.append('menuPhoto', this.menu.menuPhoto);
                }

                // 알레르기 정보를 개별적으로 추가
                Object.entries(this.menu.allergyInfo).forEach(([key, value]) => {
                    formData.append(`allergyInfo.${key}`, value);
                });

                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/menu/create`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.data) {
                    this.$router.push(`/menu/list/${this.restaurantId}`);
                }
            } catch (error) {
                console.error('메뉴 등록 실패:', error);
                this.errorMessage = error.response?.data || '메뉴 등록에 실패했습니다.';
                this.showError = true;
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>