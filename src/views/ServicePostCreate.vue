<template>
    <v-container>
        <v-card class="mx-auto my-4" max-width="800">
            <v-card-title class="text-h4 pa-4">
                {{ pageTitle }}
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
                        @click="goToList"
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
            pageTitle: '문의글 등록',  // 기본 제목
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
    mounted() {
        // URL 쿼리에서 category 값을 받아오면 설정
        if (this.$route.query.category) {
            this.category = this.$route.query.category;
        }
        if (this.$route.query.title) {
            this.title = this.$route.query.title;
        }
        // `fromEvent` 값이 존재하면 제목을 "이벤트 배너 신청"으로 변경
        if (this.$route.query.fromEvent) {
            this.pageTitle = '이벤트 배너 신청';
        }
        if (this.$route.query.fromEvent2) {
            this.pageTitle = '등업 신청';
        }
        window.scrollTo(0, 0);
    },
    methods: {
        goToList() {
            this.$router.push({
                path: '/service',
                query: { tab: 'service' }
            });
        },
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
                    
                    // 1초 후 목록 페이지로 이동
                    setTimeout(() => {
                        this.$router.push({
                        path: '/service',
                        query: { tab: 'service' }});
                        }, 1000);
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
