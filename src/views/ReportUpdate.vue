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
    name: 'ReportUpdate',
    data() {
        return {
            reportClass: '',
            contents: '',
            photos: [],
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
        } catch (error) {
            console.error('신고글 불러오기 실패:', error);
            this.errorMessage = '신고글을 불러오는데 실패했습니다.';
            this.showError = true;
            this.$router.push('/report/list');
        }
    },
    methods: {
        async updatePost() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            try {
                const formData = new FormData();
                formData.append('reportClass', this.reportClass);
                formData.append('contents', this.contents);

                if (this.photos && this.photos.length > 0) {
                    this.photos.forEach(photo => {
                        formData.append('photos', photo);
                    });
                }

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
                console.error('신고글 수정 실패:', error);
                if (error.response?.status === 403) {
                    this.errorMessage = '해당 신고글을 수정할 권한이 없습니다.';
                } else {
                    this.errorMessage = '신고글 수정에 실패했습니다.';
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