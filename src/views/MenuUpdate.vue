<template>
    <div class="container mx-auto px-4 py-8 min-h-screen">
        <v-card class="mx-auto rounded-xl shadow-lg" style="max-width: 800px;">
            <!-- 타이틀 섹션 추가 -->
            <div class="title-section">
                <div class="title-overlay"></div>
                <div class="title-content">
                    <h2 class="text-h4 font-weight-bold text-white mb-2">메뉴 수정</h2>
                </div>
            </div>

            <v-card-text class="px-8 py-6">
                <form @submit.prevent="updateMenu">
                    <!-- 메뉴 이름 & 가격 섹션 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="input-group">
                            <div class="label-container mb-2">
                                <v-icon color="#FB8C00" size="18" class="mr-1">mdi-pencil</v-icon>
                                <span class="input-label">메뉴 이름</span>
                            </div>
                            <v-text-field
                                v-model="menu.name"
                                variant="outlined"
                                placeholder="예) 아메리카노"
                                required
                                class="modern-input"
                                density="comfortable"
                            ></v-text-field>
                        </div>
                        <div class="input-group">
                            <div class="label-container mb-2">
                                <v-icon color="#FB8C00" size="18" class="mr-1">mdi-cash</v-icon>
                                <span class="input-label">가격</span>
                            </div>
                            <v-text-field
                                v-model="menu.price"
                                variant="outlined"
                                type="number"
                                placeholder="예) 4500"
                                prefix="₩"
                                required
                                class="modern-input"
                                density="comfortable"
                            ></v-text-field>
                        </div>
                    </div>

                    <!-- 설명 섹션 -->
                    <div class="input-group mb-8">
                        <div class="label-container mb-2">
                            <v-icon color="#FB8C00" size="18" class="mr-1">mdi-text</v-icon>
                            <span class="input-label">설명</span>
                        </div>
                        <v-textarea
                            v-model="menu.description"
                            variant="outlined"
                            rows="4"
                            placeholder="메뉴에 대한 설명을 입력해주세요"
                            required
                            class="modern-input"
                        ></v-textarea>
                    </div>

                    <!-- 이미지 업로드 섹션 -->
                    <div class="input-group mb-8">
                        <div class="label-container mb-2">
                            <v-icon color="#FB8C00" size="18" class="mr-1">mdi-camera</v-icon>
                            <span class="input-label">메뉴 사진</span>
                        </div>
                        <div class="text-center">
                            <div v-if="previewImage || menu.menuPhoto" class="preview-container">
                                <img 
                                    :src="previewImage || menu.menuPhoto" 
                                    alt="Preview" 
                                    class="preview-image"
                                />
                            </div>
                            <v-file-input
                                @change="onFileChange"
                                accept="image/*"
                                variant="outlined"
                                :placeholder="previewImage ? '사진 변경하기' : '사진을 선택해주세요'"
                                show-size
                                class="modern-file-input"
                                prepend-icon="mdi-camera"
                                hide-details
                                density="compact"
                            ></v-file-input>
                        </div>
                    </div>

                    <!-- 알레르기 정보 섹션 -->
                    <div class="allergy-section mb-8">
                        <div class="label-container mb-2">
                            <v-icon color="#FB8C00" size="18" class="mr-1">mdi-allergen</v-icon>
                            <span class="input-label">알레르기 정보</span>
                        </div>
                        <div class="allergy-grid">
                            <div 
                                v-for="(value, key) in menu.allergyInfo" 
                                :key="key"
                                class="allergy-item"
                                :class="{ 'selected': value === 'Y' }"
                                @click="toggleAllergy(key)"
                            >
                                <v-icon 
                                    :color="value === 'Y' ? '#FB8C00' : '#9E9E9E'"
                                    size="32"
                                    class="mb-2"
                                >
                                    {{ getAllergyIcon(key) }}
                                </v-icon>
                                <span class="allergy-label">{{ getAllergyLabel(key) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 버튼 섹션 -->
                    <div class="button-group">
                        <v-btn
                            color="grey-lighten-1"
                            variant="tonal"
                            @click="$router.go(-1)"
                            class="cancel-btn"
                        >
                            취소
                        </v-btn>
                        <v-btn
                            color="#FB8C00"
                            type="submit"
                            class="submit-btn"
                            elevation="2"
                        >
                            수정하기
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
    props: ['menuId'],
    data() {
        return {
            previewImage: null,
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
        onFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.menu.newMenuPhoto = file;
            }
        },
        toggleAllergy(allergy) {
            this.menu.allergyInfo[allergy] = this.menu.allergyInfo[allergy] === 'Y' ? 'N' : 'Y';
        },
        async updateMenu() {
            try {
                // 데이터 유효성 검사
                if (!this.menu.name || !this.menu.price || !this.menu.description) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                const formData = new FormData();
                formData.append('name', this.menu.name);
                formData.append('price', Number(this.menu.price)); // 명시적으로 숫자로 변환
                formData.append('description', this.menu.description);
                
                // 새로운 이미지가 선택된 경우에만 추가
                if (this.menu.newMenuPhoto) {
                    formData.append('menuPhoto', this.menu.newMenuPhoto);
                }

                // 알레르기 정보 추가
                Object.entries(this.menu.allergyInfo).forEach(([key, value]) => {
                    formData.append(`allergyInfo.${key}`, value);
                });

                const menuId = this.$route.params.menuId; // URL 파라미터 이름 수정
                console.log('Updating menu with ID:', menuId); // 디버깅용

                const response = await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/menu/update/${menuId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.data) {
                    alert('메뉴가 수정되었습니다.');
                    this.$router.push(`/menu/list/${localStorage.getItem('restaurantId')}`);
                }
            } catch (error) {
                console.error('메뉴 수정 실패:', error);
                console.error('에러 응답:', error.response?.data);
                alert(`메뉴 수정에 실패했습니다: ${error.response?.data || error.message}`);
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

/* 각 라벨에 맞는 아이콘 */
.price-label .v-icon {
    transform: rotate(-90deg);
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

.preview-container {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
    padding: 16px;
}

.preview-image {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
}

.modern-file-input :deep(.v-field) {
    border-radius: 12px;
    background-color: transparent !important;
}

.allergy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
}

.allergy-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    border-radius: 12px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.allergy-item:hover {
    background-color: #FFF3E0;
}

.allergy-item.selected {
    background-color: #FFF3E0;
    border-color: #FB8C00;
}

.allergy-label {
    font-size: 0.9rem;
    color: #424242;
    text-align: center;
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.submit-btn {
    min-width: 120px;
}

.cancel-btn {
    min-width: 100px;
}

@media (max-width: 600px) {
    .v-card-text {
        padding: 16px !important;
    }
    
    .allergy-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;
    }
}
</style>