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
                    <v-chip
                        class="ml-2"
                        :color="post.visibility === 'Y' ? 'info' : 'grey'"
                        size="small"
                    >
                        {{ post.visibility === 'Y' ? '공개' : '비공개' }}
                    </v-chip>
                </v-card-title>
                <v-card-subtitle>
                    작성자: {{ authorNickname }} <br>
                    작성일: {{ new Date(post.createdTime).toLocaleDateString() }} {{ new Date(post.createdTime).toLocaleTimeString() }} <br>
                    수정일: {{ new Date(post.updatedTime).toLocaleDateString() }} {{ new Date(post.updatedTime).toLocaleTimeString() }}
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
                <v-card-actions v-if="isAuthor">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="deletePost">
                        삭제하기
                    </v-btn>
                </v-card-actions>
            </v-card>

            <!-- 답변 표시 -->
            <v-card v-if="answer" class="mb-4">
                <v-card-title class="d-flex align-center">
                    답변
                    <!-- 관리자용 답변 수정 버튼 -->
                    <v-spacer></v-spacer>
                    <v-btn
                        v-if="userRole === 'ADMIN'"
                        color="primary"
                        variant="text"
                        :disabled="isEditingAnswer"
                        @click="startEditAnswer"
                    >
                        수정하기
                    </v-btn>
                </v-card-title>
                <v-card-title class="d-flex align-center">
                    <!-- 관리자용 답변 삭제 버튼 -->
                    <v-spacer></v-spacer>
                    <v-btn
                        v-if="userRole === 'ADMIN'"
                        color="primary"
                        variant="text"
                        :disabled="isEditingAnswer"
                        @click="deleteAnswer"
                    >
                        삭제하기
                    </v-btn>
                </v-card-title>
                <v-card-subtitle>
                    작성일: {{ new Date(answer.createdTime).toLocaleDateString() }} {{ new Date(answer.createdTime).toLocaleTimeString() }} <br>
                    수정일: {{ new Date(answer.updatedTime).toLocaleDateString() }} {{ new Date(answer.updatedTime).toLocaleTimeString() }}
                </v-card-subtitle>
                <v-card-text>
                    <!-- 수정 모드일 때는 textarea 표시 -->
                    <v-form v-if="isEditingAnswer" ref="editAnswerForm" v-model="isAnswerFormValid">
                        <v-textarea
                            v-model="editAnswerContents"
                            label="답변 내용"
                            :rules="answerRules"
                            rows="5"
                            auto-grow
                            variant="outlined"
                        ></v-textarea>
                        <div class="d-flex justify-end gap-2">
                            <v-btn
                                color="error"
                                variant="text"
                                @click="cancelEditAnswer"
                            >
                                취소
                            </v-btn>
                            <v-btn
                                color="primary"
                                :loading="answerLoading"
                                :disabled="!isAnswerFormValid"
                                @click="updateAnswer"
                            >
                                저장
                            </v-btn>
                        </div>
                    </v-form>
                    <!-- 일반 모드일 때는 텍스트 표시 -->
                    <div v-else class="content-text">{{ answer.contents }}</div>
                </v-card-text>
            </v-card>

            <!-- 관리자용 답변 등록 폼 -->
            <v-card v-else-if="userRole === 'ADMIN'" class="mb-4">
                <v-card-title>답변 등록</v-card-title>
                <v-card-text>
                    <v-form ref="answerForm" v-model="isAnswerFormValid">
                        <v-textarea
                            v-model="answerContents"
                            label="답변 내용"
                            :rules="answerRules"
                            rows="5"
                            auto-grow
                            variant="outlined"
                        ></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        :loading="answerLoading"
                        :disabled="!isAnswerFormValid"
                        @click="submitAnswer"
                    >
                        답변 등록
                    </v-btn>
                </v-card-actions>
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
            selectedImage: null,
            answerContents: '',
            isAnswerFormValid: false,
            answerLoading: false,
            isEditingAnswer: false,
            editAnswerContents: '',
            answerRules: [
                v => !!v || '답변 내용을 입력해주세요',
                v => v.length >= 10 || '답변은 최소 10자 이상 입력해주세요'
            ],
            authorNickname: '',
            users: []
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
        async fetchUsers() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`);
                this.users = response.data;
            } catch (error) {
                console.error('사용자 목록 조회 실패:', error);
            }
        },
        async fetchPost() {
            try {
                const postId = this.$route.params.id;
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/service/post/${postId}`
                );
                this.post = response.data;
                console.log(response.data);

                // 작성자 닉네임 찾기
                const author = this.users.find(user => Number(user.userId) === Number(this.post.userId));
                this.authorNickname = author ? author.nickName : '알 수 없음';

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
        },
        async submitAnswer() {
            if (!this.$refs.answerForm.validate()) return;
            
            this.answerLoading = true;
            try {
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/service/answer/create`,
                    {
                        postId: this.post.id,
                        contents: this.answerContents
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                // 답변 등록 성공 시 답변 데이터 업데이트
                this.answer = response.data;
                this.answerContents = '';
                this.$refs.answerForm.reset();

                // 성공 메시지 표시
                this.$emit('show-message', {
                    color: 'success',
                    text: '답변이 성공적으로 등록되었습니다.'
                });
            } catch (error) {
                console.error('답변 등록 실패:', error);
                this.$emit('show-message', {
                    color: 'error',
                    text: '답변 등록에 실패했습니다.'
                });
            } finally {
                this.answerLoading = false;
            }
        },
        startEditAnswer() {
            this.editAnswerContents = this.answer.contents;
            this.isEditingAnswer = true;
        },
        cancelEditAnswer() {
            this.editAnswerContents = '';
            this.isEditingAnswer = false;
        },
        async updateAnswer() {
            if (!this.$refs.editAnswerForm.validate()) return;
            
            this.answerLoading = true;
            try {
                const response = await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/service/answer/update/${this.answer.id}`,
                    {
                        contents: this.editAnswerContents
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                // 답변 수정 성공 시 데이터 업데이트
                this.answer = response.data;
                this.isEditingAnswer = false;
                this.editAnswerContents = '';

                // 성공 메시지 표시
                this.$emit('show-message', {
                    color: 'success',
                    text: '답변이 성공적으로 수정되었습니다.'
                });
            } catch (error) {
                console.error('답변 수정 실패:', error);
                this.$emit('show-message', {
                    color: 'error',
                    text: '답변 수정에 실패했습니다.'
                });
            } finally {
                this.answerLoading = false;
            }
        },
        async deletePost() {
            try {
                // 먼저 답변 삭제
                if (this.answer) {
                    await axios.delete(
                        `${process.env.VUE_APP_API_BASE_URL}/service/answer/delete/${this.answer.id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                }

                // 그 다음 게시글 삭제
                await axios.delete(
                    `${process.env.VUE_APP_API_BASE_URL}/service/post/delete/${this.post.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                // 성공 메시지 표시
                this.$emit('show-message', {
                    color: 'success',
                    text: '게시글이 성공적으로 삭제되었습니다.'
                });

                // 목록 페이지로 이동
                this.$router.push('/service/list');

            } catch (error) {
                console.error('게시글 삭제 실패:', error);
                this.$emit('show-message', {
                    color: 'error',
                    text: '게시글 삭제에 실패했습니다.'
                });
            }
        },
        async deleteAnswer() {
            try {
                await axios.delete(
                    `${process.env.VUE_APP_API_BASE_URL}/service/answer/delete/${this.answer.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                // 답변 상태 초기화
                this.answer = null;

                // 성공 메시지 표시
                this.$emit('show-message', {
                    color: 'success',
                    text: '답변이 성공적으로 삭제되었습니다.'
                });

            } catch (error) {
                console.error('답변 삭제 실패:', error);
                this.$emit('show-message', {
                    color: 'error',
                    text: '답변 삭제에 실패했습니다.'
                });
            }
        }
    },
    async mounted() {
        await this.fetchCurrentUser();
        await this.fetchUsers();
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

.v-textarea {
    margin-bottom: 16px;
}

.gap-2 {
    gap: 8px;
}
</style>