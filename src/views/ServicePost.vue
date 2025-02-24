<template>
    <div class="service-post">
        <v-container v-if="loading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-container>

        <v-container v-else-if="post">
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    {{ post.title }}
                    <v-chip
                        class="ml-4"
                        :color="answer ? 'success' : 'warning'"
                        :text="answer ? '답변완료' : '답변대기'"
                    ></v-chip>
                </v-card-title>
                <v-card-subtitle>
                    작성일: {{ new Date(post.createdAt).toLocaleDateString() }}
                </v-card-subtitle>
                <v-card-text>
                    <div class="content-text">{{ post.contents }}</div>
                    
                    <!-- 이미지 표시 부분 -->
                    <div v-if="post.photos && post.photos.length > 0" class="image-container">
                        <v-img
                            v-for="(photo, index) in post.photos"
                            :key="index"
                            :src="photo"
                            @click="openImageDialog(photo)"
                            class="post-image"
                            cover
                            max-height="200"
                        ></v-img>
                    </div>
                </v-card-text>
                
                <!-- 수정 버튼 (작성자인 경우에만 표시) -->
                <v-card-actions v-if="isAuthor">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="editPost">
                        수정하기
                    </v-btn>
                </v-card-actions>
            </v-card>

            <!-- 답변 표시 -->
            <v-card v-if="answer" class="mb-4">
                <v-card-title>답변</v-card-title>
                <v-card-subtitle>
                    답변일: {{ new Date(answer.createdAt).toLocaleDateString() }}
                </v-card-subtitle>
                <v-card-text>
                    <div class="content-text">{{ answer.contents }}</div>
                </v-card-text>
            </v-card>

            <!-- 이미지 다이얼로그 -->
            <v-dialog v-model="imageDialog" max-width="800px">
                <v-card v-if="selectedImage">
                    <v-img :src="selectedImage"></v-img>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="closeImageDialog">닫기</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- 하단 버튼 그룹 -->
            <div class="d-flex mt-4">
                <v-btn color="red" @click="$router.push('/service/list')">
                    목록으로
                </v-btn>
            </div>
        </v-container>

        <v-container v-else>
            <v-alert type="error">
                게시글을 불러올 수 없습니다.
            </v-alert>
        </v-container>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            post: null,
            answer: null,
            currentUser: null,
            userRole: null,
            loading: true,
            imageDialog: false,
            selectedImage: null
        };
    },
    computed: {
        canEdit() {
            return this.userRole === 'ADMIN' || 
                   (this.currentUser && this.post.userId === this.currentUser.id);
        },
        isAuthor() {
            return this.currentUser && 
                   this.post && 
                   Number(this.post.userId) === Number(this.currentUser.id);
        }
    },
    methods: {
        getCategoryText(category) {
            const categoryMap = {
                'INQUIRY': '문의사항',
                'REQUEST': '요청사항',
                'COMPLAINT': '불만사항'
            };
            return categoryMap[category] || category;
        },
        getCategoryColor(category) {
            const colorMap = {
                'INQUIRY': 'blue',
                'REQUEST': 'green',
                'COMPLAINT': 'orange'
            };
            return colorMap[category] || 'grey';
        },
        async fetchCurrentUser() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.currentUser = null;
                    this.userRole = null;
                    return;
                }

                // JWT 토큰 디코딩
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                const userId = localStorage.getItem('userId');

                this.currentUser = {
                    id: userId ? Number(userId) : null,
                    identify: payload.sub,
                    role: payload.role
                };
                this.userRole = payload.role;

                console.log('Current User:', this.currentUser);
            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
                this.currentUser = null;
                this.userRole = null;
            }
        },
        async fetchPost() {
            try {
                const postId = this.$route.params.id;
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/service/post/${postId}`
                );
                this.post = response.data;

                // 권한 체크
                if (this.post.visibility === 'N') {
                    if (!this.currentUser) {
                        alert('비공개 글은 로그인 후 확인할 수 있습니다.');
                        this.$router.push('/service/list');
                        return;
                    }

                    if (this.userRole !== 'ADMIN' && 
                        Number(this.post.userId) !== Number(this.currentUser.id)) {
                        alert('비공개 글은 작성자만 확인할 수 있습니다.');
                        this.$router.push('/service/list');
                        return;
                    }
                }

                // 답변 조회
                try {
                    const answerResponse = await axios.get(
                        `${process.env.VUE_APP_API_BASE_URL}/service/answer/${postId}`
                    );
                    if (answerResponse.data && answerResponse.data.contents) {
                        this.answer = answerResponse.data;
                    }
                } catch (error) {
                    console.error('답변 조회 실패:', error);
                    this.answer = null;
                }
            } catch (error) {
                console.error('게시글 조회 실패:', error);
                alert('게시글을 불러올 수 없습니다.');
                this.$router.push('/service/list');
            } finally {
                this.loading = false;
            }
        },
        openImageDialog(image) {
            this.selectedImage = image;
            this.imageDialog = true;
        },
        closeImageDialog() {
            this.imageDialog = false;
            this.selectedImage = null;
        },
        editPost() {
            this.$router.push(`/service/post/update/${this.post.id}`);
        }
    },
    async mounted() {
        await this.fetchCurrentUser();
        await this.fetchPost();
    }
};
</script>

<style scoped>
.service-post {
    padding: 20px;
}

.content-text {
    white-space: pre-wrap;
    margin-bottom: 20px;
}

.image-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 20px;
}

.post-image {
    cursor: pointer;
    border-radius: 4px;
}

/* 제목과 상태 칩 정렬을 위한 스타일 */
.v-card-title {
    flex-wrap: wrap;
    gap: 8px;
}
</style>