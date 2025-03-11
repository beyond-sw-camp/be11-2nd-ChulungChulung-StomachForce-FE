<template>
    <v-container>
        <v-card class="mx-auto" max-width="800">
            <v-card-title class="text-h5 font-weight-bold">
                문의글 수정
            </v-card-title>

            <v-card-text>
                <v-form ref="form" v-model="isFormValid">
                    <v-text-field
                        v-model="title"
                        label="제목"
                        :rules="titleRules"
                        required
                        variant="outlined"
                        class="mb-4"
                    ></v-text-field>

                    <v-textarea
                        v-model="contents"
                        label="내용"
                        :rules="contentsRules"
                        required
                        variant="outlined"
                        rows="10"
                        auto-grow
                    ></v-textarea>

                    <v-select
                        v-model="category"
                        :items="categoryItems"
                        label="카테고리"
                        variant="outlined"
                        :rules="[v => !!v || '카테고리를 선택해주세요']"
                        required
                        class="mb-4"
                        item-title="text"
                        item-value="value"
                    ></v-select>

                    <v-select
                        v-model="visibility"
                        :items="[
                            { title: '공개', value: 'Y' },
                            { title: '비공개', value: 'N' }
                        ]"
                        item-title="title"
                        item-value="value"
                        label="공개 여부"
                        variant="outlined"
                        required
                        class="mb-4"
                    ></v-select>

                    <!-- 현재 첨부된 사진 표시 -->
                    <div v-if="currentPhotos && currentPhotos.length > 0" class="mb-4">
                        <div class="text-subtitle-1 mb-2">현재 첨부된 사진:</div>
                        <v-row>
                            <v-col v-for="(photo, index) in currentPhotos" :key="index" cols="4">
                                <v-img
                                    :src="photo"
                                    aspect-ratio="1"
                                    cover
                                    class="bg-grey-lighten-2"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>

                    <v-file-input
                        v-model="photos"
                        label="새로운 사진 첨부"
                        variant="outlined"
                        multiple
                        accept="image/*"
                        prepend-icon="mdi-camera"
                        class="mb-4"
                        :show-size="true"
                        hint="최대 5장까지 첨부 가능합니다"
                        :rules="[v => !v || v.length <= 5 || '최대 5장까지만 첨부할 수 있습니다']"
                    ></v-file-input>

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
                            @click="updatePost"
                        >
                            수정
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- 에러 메시지 -->
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
    data() {
        return {
            title: '',
            contents: '',
            category: '',
            visibility: 'Y',
            photos: [],
            currentPhotos: [],
            isFormValid: false,
            loading: false,
            showError: false,
            errorMessage: '',
            categoryItems: [
                { text: '요청사항', value: 'REQUEST' },
                { text: '문의사항', value: 'INQUIRY' },
                { text: '불만사항', value: 'COMPLAINT' }
            ],
            titleRules: [
                v => !!v || '제목을 입력해주세요',
                v => v.length <= 100 || '제목은 100자 이하여야 합니다'
            ],
            contentsRules: [
                v => !!v || '내용을 입력해주세요',
                v => v.length <= 2000 || '내용은 2000자 이하여야 합니다'
            ],
        }
    },
    async created() {
        try {
            const response = await axios.get(
                `${process.env.VUE_APP_API_BASE_URL}/service/post/${this.$route.params.id}`
            );
            this.title = response.data.title;
            this.contents = response.data.contents;
            this.category = response.data.category;
            this.visibility = response.data.visibility;
            this.currentPhotos = response.data.photos || [];
        } catch (error) {
            console.error('게시글 불러오기 실패:', error);
            this.errorMessage = '게시글을 불러오는데 실패했습니다.';
            this.showError = true;
            this.$router.push('/service/list');
        }
    },
    methods: {
        async updatePost() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            try {
                const formData = new FormData();
                formData.append('title', this.title);
                formData.append('contents', this.contents);
                formData.append('category', this.category);
                formData.append('visibility', this.visibility);

                if (this.photos && this.photos.length > 0) {
                    this.photos.forEach(photo => {
                        formData.append('photos', photo);
                    });
                }

                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/service/post/update/${this.$route.params.id}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                this.$router.push(`/service/post/${this.$route.params.id}`);
            } catch (error) {
                console.error('업데이트 실패:', error);
                if (error.response?.status === 403) {
                    this.errorMessage = '해당 게시글을 수정할 권한이 없습니다.';
                } else {
                    this.errorMessage = '게시글 수정에 실패했습니다.';
                }
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