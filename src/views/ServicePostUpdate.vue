<template>
    <v-container>
        <v-card class="mx-auto my-4" max-width="800">
            <v-card-title class="text-h4 pa-4">
                게시글 수정
            </v-card-title>

            <v-divider></v-divider>

            <v-form @submit.prevent="updatePost" class="pa-4">
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

                <v-card-actions class="px-0">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        type="submit"
                        :loading="loading"
                    >
                        수정하기
                    </v-btn>
                    <v-btn
                        color="grey"
                        class="ml-2"
                        :to="`/service/post/${id}`"
                    >
                        취소
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>

        <!-- 성공 알림 -->
        <v-alert
            v-model="showSuccessAlert"
            type="success"
            closable
            class="ma-4"
        >
            게시글이 성공적으로 수정되었습니다.
        </v-alert>

        <!-- 에러 알림 -->
        <v-alert
            v-model="showErrorAlert"
            type="error"
            closable
            class="ma-4"
        >
            게시글 수정 중 오류가 발생했습니다.
        </v-alert>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    props: ['id'],
    data() {
        return { 
            title: '', 
            contents: '',
            loading: false,
            showSuccessAlert: false,
            showErrorAlert: false
        };
    },
    async mounted() {
        try {
            const response = await axios.get(
                `${process.env.VUE_APP_API_BASE_URL}/service/post/${this.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            this.title = response.data.title;
            this.contents = response.data.contents;
        } catch (error) {
            console.error('게시글 조회 실패:', error);
            this.$router.push('/service/list');
        }
    },
    methods: {
        async updatePost() {
            try {
                this.loading = true;
                const formData = new FormData();
                formData.append('title', this.title);
                formData.append('contents', this.contents);

                const response = await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/service/post/update/${this.id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.status === 200) {
                    this.showSuccessAlert = true;
                    setTimeout(() => {
                        this.$router.push(`/service/post/${this.id}`);
                    }, 3000);
                }
            } catch (error) {
                console.error('게시글 수정 실패:', error);
                this.showErrorAlert = true;
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>