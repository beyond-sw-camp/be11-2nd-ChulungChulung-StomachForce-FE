<template>
    <v-container>
        <v-card class="mx-auto my-4" max-width="800">
            <v-card-title class="text-h4 pa-4">
                문의글 등록
            </v-card-title>

            <v-divider></v-divider>

            <v-form @submit.prevent="submitPost" class="pa-4">
                <v-select
                    v-model="category"
                    :items="categoryOptions"
                    label="문의 유형"
                    variant="outlined"
                    required
                    class="mb-4"
                ></v-select>

                <v-text-field
                    v-model="title"
                    label="제목"
                    variant="outlined"
                    required
                    class="mb-4"
                ></v-text-field>

                <v-textarea
                    v-model="contents"
                    label="내용"
                    variant="outlined"
                    required
                    rows="10"
                    class="mb-4"
                ></v-textarea>

                <v-file-input
                    v-model="photos"
                    label="사진 첨부"
                    variant="outlined"
                    multiple
                    accept="image/*"
                    prepend-icon="mdi-camera"
                    class="mb-4"
                    :show-size="true"
                    hint="최대 5장까지 첨부 가능합니다"
                    :rules="[v => !v || v.length <= 5 || '최대 5장까지만 첨부할 수 있습니다']"
                ></v-file-input>

                <v-radio-group
                    v-model="visibility"
                    label="공개 여부"
                    class="mb-4"
                    inline
                >
                    <v-radio
                        label="공개"
                        value="Y"
                    ></v-radio>
                    <v-radio
                        label="비공개"
                        value="N"
                    ></v-radio>
                </v-radio-group>

                <v-card-actions class="px-0">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        type="submit"
                        :loading="loading"
                        :disabled="!isFormValid"
                    >
                        등록하기
                    </v-btn>
                    <v-btn
                        color="grey"
                        class="ml-2"
                        :to="{path:'/service/list'}"
                    >
                        취소
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return { 
            title: '',
            contents: '',
            category: 'INQUIRY',
            visibility: 'Y',
            photos: [],
            loading: false,
            categoryOptions: [
                { title: '문의사항', value: 'INQUIRY' },
                { title: '요청사항', value: 'REQUEST' },
                { title: '불만사항', value: 'COMPLAINT' }
            ]
        };
    },
    computed: {
        isFormValid() {
            return this.title && 
                   this.contents && 
                   this.category &&
                   this.visibility &&
                   (!this.photos || this.photos.length <= 5);
        }
    },
    methods: {
        async submitPost() {
            try {
                const formData = new FormData();
                formData.append('title', this.title);
                formData.append('contents', this.contents);
                formData.append('category', this.category);
                formData.append('visibility', this.visibility);

                // 이미지 파일들 추가
                if (this.photos && this.photos.length > 0) {
                    this.photos.forEach(file => {
                        formData.append('photos', file);
                    });
                }

                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/service/post/create`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.status === 200 || response.status === 201) {
                    // 성공 메시지 표시
                    this.showSuccessAlert = true;
                    
                    // 3초 후 목록 페이지로 이동
                    setTimeout(() => {
                        this.$router.push('/service/list');
                    }, 3000);
                }

            } catch (error) {
                console.error('게시글 작성 실패:', error);
                this.showErrorAlert = true;
            }
        }
    }
};
</script>

<style scoped>
.v-card-title {
    word-break: break-all;
}

.v-card-text {
    white-space: pre-line;
}
</style>
