<template>
    <v-container>
        <v-card class="mx-auto" max-width="800">
            <v-card-title class="text-h5 font-weight-bold">
                신고 내용 수정
            </v-card-title>

            <v-card-text>
                <v-form ref="form" v-model="isFormValid">
                    <v-select
                        v-model="reportClass"
                        :items="reportClassOptions"
                        label="신고 유형"
                        variant="outlined"
                        required
                        class="mb-4"
                    ></v-select>

                    <v-textarea
                        v-model="contents"
                        label="신고 내용"
                        :rules="contentsRules"
                        required
                        variant="outlined"
                        rows="10"
                        auto-grow
                    ></v-textarea>

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
                            @click="updateReport"
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
    name: 'ReportUpdate',
    data() {
        return {
            reportClass: '',
            contents: '',
            photos: [], // 새로 선택한 사진
            currentPhotos: [], // 현재 첨부된 사진 URL 배열
            isFormValid: false,
            loading: false,
            showError: false,
            errorMessage: '',
            reportClassOptions: [
                { title: '스팸', value: 'SPAM' },
                { title: '욕설/비방', value: 'ABUSE' },
                { title: '도배', value: 'FLOODING' },
                { title: '기타', value: 'OTHER' }
            ],
            contentsRules: [
                v => !!v || '내용을 입력해주세요',
                v => v.length <= 2000 || '내용은 2000자 이하여야 합니다'
            ]
        }
    },
    async created() {
        try {
            const response = await axios.get(
                `${process.env.VUE_APP_API_BASE_URL}/report/${this.$route.params.id}`
            );
            this.reportClass = response.data.reportClass;
            this.contents = response.data.contents;
            this.currentPhotos = response.data.photos || []; // 현재 첨부된 사진 URL 저장
        } catch (error) {
            console.error('신고글 불러오기 실패:', error);
            this.errorMessage = '신고글을 불러오는데 실패했습니다.';
            this.showError = true;
            this.$router.push('/report/list');
        }
    },
    methods: {
        async updateReport() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            try {
                const formData = new FormData();
                formData.append('reportClass', this.reportClass);
                formData.append('contents', this.contents);

                // 새로운 사진이 선택된 경우에만 photos 필드 추가
                if (this.photos && this.photos.length > 0) {
                    this.photos.forEach(photo => {
                        formData.append('photos', photo);
                    });
                }
                // 새로운 사진이 없는 경우 photos 필드를 전송하지 않음 (기존 사진 유지)

                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/report/update/${this.$route.params.id}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                this.$router.push(`/report/${this.$route.params.id}`);
            } catch (error) {
                if (error.response?.status === 403) {
                    this.errorMessage = '해당 신고를 수정할 권한이 없습니다.';
                } else {
                    this.errorMessage = '신고 수정에 실패했습니다.';
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