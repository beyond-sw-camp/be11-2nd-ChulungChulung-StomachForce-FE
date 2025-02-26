<template>
    <div class="container mx-auto px-4 py-8 min-h-screen">
        <v-card class="mx-auto rounded-xl shadow-lg" style="max-width: 800px;">
            <!-- 타이틀 섹션 -->
            <div class="title-section">
                <div class="title-overlay"></div>
                <div class="title-content">
                    <h2 class="text-h4 font-weight-bold text-white mb-2">메뉴 등록</h2>
                </div>
            </div>

            <v-card-text class="px-8 py-6">
                <form @submit.prevent="createMenu">
                    <!-- 기본 정보 섹션 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <div class="label-container mb-2">
                                <v-icon color="#FB8C00" size="18" class="mr-1">mdi-pencil</v-icon>
                                <span class="input-label">메뉴 이름</span>
                            </div>
                            <v-text-field
                                v-model="menu.name"
                                variant="outlined"
                                placeholder="메뉴 이름을 입력하세요"
                                required
                                class="modern-input"
                                density="comfortable"
                            ></v-text-field>
                        </div>
                        <div>
                            <div class="label-container mb-2">
                                <v-icon color="#FB8C00" size="18" class="mr-1">mdi-cash</v-icon>
                                <span class="input-label">가격</span>
                            </div>
                            <v-text-field
                                v-model="menu.price"
                                variant="outlined"
                                type="number"
                                placeholder="가격을 입력하세요"
                                prefix="₩"
                                required
                                class="modern-input"
                                density="comfortable"
                            ></v-text-field>
                        </div>
                    </div>

                    <!-- 설명 섹션 -->
                    <div class="mb-8">
                        <div class="label-container mb-2">
                            <v-icon color="#FB8C00" size="18" class="mr-1">mdi-text</v-icon>
                            <span class="input-label">설명</span>
                        </div>
                        <v-textarea
                            v-model="menu.description"
                            variant="outlined"
                            rows="4"
                            placeholder="메뉴에 대한 설명을 입력하세요"
                            required
                            class="modern-input"
                        ></v-textarea>
                    </div>

                    <!-- 이미지 업로드 섹션 -->
                    <div class="mb-8">
                        <div class="label-container mb-2">
                            <v-icon color="#FB8C00" size="18" class="mr-1">mdi-camera</v-icon>
                            <span class="input-label">메뉴 사진</span>
                        </div>
                        <div class="text-center">
                            <div v-if="previewImage" class="mb-4">
                                <img 
                                    :src="previewImage" 
                                    alt="Preview" 
                                    class="mx-auto rounded-lg shadow-md"
                                    style="max-height: 200px; object-fit: contain;"
                                />
                            </div>
                            <v-file-input
                                @change="onFileChange"
                                accept="image/*"
                                variant="outlined"
                                placeholder="사진을 선택해주세요"
                                show-size
                                class="modern-file-input"
                                prepend-icon="mdi-camera"
                                hide-details
                                density="compact"
                            ></v-file-input>
                        </div>
                    </div>

                    <!-- 알레르기 정보 섹션 -->
                    <div class="mb-8">
                        <div class="label-container mb-2">
                            <v-icon color="#FB8C00" size="18" class="mr-1">mdi-allergen</v-icon>
                            <span class="input-label">알레르기 정보</span>
                        </div>
                        <div class="allergy-grid">
                            <v-card
                                v-for="(value, key) in menu.allergyInfo" 
                                :key="key"
                                flat
                                class="allergy-item"
                                :class="{ 'selected': value === 'Y' }"
                                @click="toggleAllergy(key)"
                            >
                                <div class="d-flex align-center justify-center pa-3">
                                    <div class="allergy-content text-center">
                                        <v-icon 
                                            :color="value === 'Y' ? '#FB8C00' : 'grey'"
                                            size="32"
                                            class="mb-2"
                                        >
                                            {{ getAllergyIcon(key) }}
                                        </v-icon>
                                        <span class="allergy-label">{{ getAllergyLabel(key) }}</span>
                                    </div>
                                </div>
                            </v-card>
                        </div>
                    </div>

                    <!-- 버튼 섹션 -->
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
        },
        getAllergyIcon(key) {
            const icons = {
                milk: 'mdi-bottle-tonic',
                egg: 'mdi-egg',
                wheat: 'mdi-grain',
                soy: 'mdi-soy-sauce',
                peanut: 'mdi-peanut',
                nuts: 'mdi-tree',
                fish: 'mdi-fish',
                shellfish: 'mdi-jellyfish'
            };
            return icons[key] || 'mdi-alert-circle';
        }
    }
}
</script>

<style scoped>
.title-section {
    position: relative;
    height: 200px;
    background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836');
    background-size: cover;
    background-position: center;
    border-radius: 12px 12px 0 0;
    overflow: hidden;
}

.title-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.7)
    );
}

.title-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    z-index: 1;
}

.label-container {
    display: flex;
    align-items: center;
    margin-left: 4px;
}

.input-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: #424242;
    letter-spacing: 0.3px;
}

.modern-input :deep(.v-field) {
    border-radius: 12px;
    background-color: #f8f9fa;
    border: 1px solid #e0e0e0;
}

.modern-input :deep(.v-field:hover) {
    background-color: #f1f3f5;
    border-color: #FB8C00;
}

.modern-input :deep(.v-field--focused) {
    border-color: #FB8C00 !important;
    background-color: white !important;
}

.allergy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
}

.allergy-item {
    cursor: pointer;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.allergy-item:hover {
    background-color: #FFF3E0;
}

.allergy-item.selected {
    background-color: #FFF3E0;
    border-color: #FB8C00;
}

.allergy-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.allergy-label {
    font-size: 0.9rem;
    color: #424242;
    margin-top: 4px;
}

@media (max-width: 600px) {
    .v-card-text {
        padding: 16px !important;
    }
}
</style>