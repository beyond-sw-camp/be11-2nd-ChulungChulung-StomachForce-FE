<template>
    <v-container>
        <v-card class="mx-auto my-4" max-width="800">
            <v-card-title class="text-h4 pa-4">
                신고하기
            </v-card-title>

            <v-divider></v-divider>

            <v-form @submit.prevent="submitPost" class="pa-4">
                <v-select
                    v-model="reportClass"
                    :items="reportClassOptions"
                    label="신고 유형"
                    variant="outlined"
                    required
                    class="mb-4"
                ></v-select>

                <v-text-field
                    v-model="searchQuery"
                    label="신고할 사용자 닉네임"
                    variant="outlined"
                    required
                    class="mb-4"
                    :loading="loading"
                    :error-messages="userNotFoundError"
                    @input="validateUser"
                    hint="신고할 사용자의 닉네임을 입력해주세요"
                ></v-text-field>

                <v-textarea
                    v-model="contents"
                    label="신고 내용"
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

                <v-card-actions class="px-0">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        type="submit"
                        :loading="loading"
                        :disabled="!isFormValid"
                    >
                        신고하기
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
    name: 'ReportCreate',
    data() {
        return { 
            reportClass: 'SPAM',
            reportedId: null,
            contents: '',
            photos: [],
            loading: false,
            users: [],
            searchQuery: '',
            userNotFoundError: '',
            reportClassOptions: [
                { title: '스팸', value: 'SPAM' },
                { title: '욕설/비방', value: 'ABUSE' },
                { title: '도배', value: 'FLOODING' },
                { title: '기타', value: 'OTHER' }
            ]
        };
    },
    computed: {
        isFormValid() {
            return this.contents && 
                   this.reportClass &&
                   this.reportedId &&
                   (!this.photos || this.photos.length <= 5);
        }
    },
    async created() {
        // URL 쿼리 파라미터에서 신고할 사용자 닉네임을 가져옴
        const reportedNickName = this.$route.query.reportedNickName;
        if (reportedNickName) {
            this.searchQuery = reportedNickName;
            await this.validateUser();
        }
    },
    mounted() {
        this.searchUsers();
        window.scrollTo(0, 0);
    },
    methods: {
        goToList() {
            this.$router.push({
                path: '/service',
                query: { tab: 'report' }
            });
        },
        async searchUsers() {
            try {
                this.loading = true;
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`);
                this.users = response.data;
            } catch (error) {
                console.error('사용자 목록 조회 실패:', error);
            } finally {
                this.loading = false;
            }
        },
        async validateUser() {
            if (!this.searchQuery) {
                this.userNotFoundError = '';
                this.reportedId = null;
                return;
            }

            this.loading = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`);
                this.users = response.data;
                const foundUser = this.users.find(user => user.nickName === this.searchQuery);
                
                if (foundUser) {
                    this.reportedId = foundUser;
                    this.userNotFoundError = '';
                } else {
                    this.reportedId = null;
                    this.userNotFoundError = '없는 사용자입니다';
                }
            } catch (error) {
                console.error('사용자 검색 실패:', error);
                this.userNotFoundError = '사용자 검색에 실패했습니다';
            } finally {
                this.loading = false;
            }
        },
        async submitPost() {
            if (!this.reportedId) {
                alert('유효한 사용자를 선택해주세요');
                return;
            }
            try {
                const formData = new FormData();
                formData.append('reporterId', localStorage.getItem('userId'));
                formData.append('reportedId', this.reportedId.userId);
                formData.append('reportClass', this.reportClass);
                formData.append('contents', this.contents);

                if (this.photos && this.photos.length > 0) {
                    this.photos.forEach(file => {
                        formData.append('photos', file);
                    });
                }

                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/report/create`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.status === 200 || response.status === 201) {
                    alert('신고가 접수되었습니다.');
                    this.$router.push({
                        path: '/service',
                        query: { tab: 'report' }});
                }

            } catch (error) {
                console.error('신고 접수 실패:', error);
                alert('신고 접수에 실패했습니다.');
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
