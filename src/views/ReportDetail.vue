<template>
    <div class="report-detail">
        <v-container class="pt-8">
            <v-card class="post-card mb-6" elevation="3">
                <!-- 게시글 헤더 -->
                <div class="post-header pa-6">
                    <div class="d-flex justify-space-between align-center mb-4">
                        <h2 class="text-h5 font-weight-bold">신고 내용</h2>
                        <div class="d-flex gap-2">
                            <v-chip
                                :color="getReportClassColor(report?.reportClass)"
                                class="status-chip"
                            >
                                {{ getReportClassText(report?.reportClass) }}
                            </v-chip>
                            <v-chip
                                :color="answer ? 'success' : 'warning'"
                                class="status-chip"
                            >
                                {{ answer ? '처리완료' : '처리중' }}
                            </v-chip>
                        </div>
                    </div>

                    <div class="post-info">
                        <div class="info-item">
                            <v-icon size="small" color="grey">mdi-account</v-icon>
                            <span>신고자: {{ reporterNickname }}</span>
                        </div>
                        <div class="info-item">
                            <v-icon size="small" color="grey">mdi-account-alert</v-icon>
                            <span>신고 대상: {{ reportedNickname }}</span>
                        </div>
                        <div class="info-item">
                            <v-icon size="small" color="grey">mdi-calendar</v-icon>
                            <span>작성일: {{ new Date(report?.createdTime).toLocaleDateString() }}</span>
                        </div>
                        <div class="info-item">
                            <v-icon size="small" color="grey">mdi-update</v-icon>
                            <span>수정일: {{ new Date(report?.updatedTime).toLocaleDateString() }}</span>
                        </div>
                    </div>
                </div>

                <v-divider></v-divider>
                <div class="post-content pa-6">
                    <p class="content-text">{{ report?.contents }}</p>
                    
                    <div v-if="report?.photos && report.photos.length > 0" class="image-grid mt-4">
                        <v-img
                            v-for="(photo, index) in report.photos"
                            :key="index"
                            :src="photo"
                            @click="openImageDialog(photo)"
                            class="post-image"
                            height="200"
                            cover
                        ></v-img>
                    </div>
                </div>

                <!-- 작성자 전용 버튼 -->
                <v-divider v-if="isAuthor"></v-divider>
                <v-card-actions v-if="isAuthor" class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="outlined" class="mr-2" @click="editPost">
                        <v-icon left class="mr-1">mdi-pencil</v-icon>
                        수정하기
                    </v-btn>
                    <v-btn color="error" variant="outlined" @click="deletePost">
                        <v-icon left class="mr-1">mdi-delete</v-icon>
                        삭제하기
                    </v-btn>
                </v-card-actions>
            </v-card>

            <!-- 처리 결과 섹션 -->
            <v-card v-if="answer" class="answer-card mb-6" elevation="2">
                <div class="answer-header pa-6">
                    <div class="d-flex justify-space-between align-center">
                        <h3 class="text-h6 font-weight-bold">
                            <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                            처리 결과
                        </h3>
                        <div v-if="userRole === 'ADMIN'" class="d-flex gap-2">
                            <v-btn icon="mdi-pencil" size="small" @click="startEditAnswer"></v-btn>
                            <v-btn icon="mdi-delete" size="small" color="error" @click="deleteAnswer"></v-btn>
                        </div>
                    </div>
                </div>

                <v-divider></v-divider>
                <div class="answer-content pa-6">
                    <v-form
                        v-if="isEditingAnswer"
                        ref="editAnswerForm"
                        v-model="isAnswerFormValid"
                    >
                        <v-textarea
                            v-model="editAnswerContents"
                            label="답변 내용"
                            :rules="answerRules"
                            rows="5"
                            auto-grow
                            variant="outlined"
                        ></v-textarea>
                        <div class="d-flex justify-end gap-2">
                            <v-btn color="error" variant="text" @click="cancelEditAnswer">
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
                    <p v-else class="content-text">{{ answer.contents }}</p>
                </div>
            </v-card>

            <!-- 관리자용 처리 등록 폼 -->
            <v-card v-else-if="userRole === 'ADMIN'" class="answer-form-card" elevation="2">
                <div class="answer-header pa-6">
                    <h3 class="text-h6 font-weight-bold">
                        <v-icon color="primary" class="mr-2">mdi-clipboard-check</v-icon>
                        처리 결과 등록
                    </h3>
                </div>
                <v-divider></v-divider>
                <div class="pa-6">
                    <v-form ref="answerForm" v-model="isAnswerFormValid">
                        <v-textarea
                            v-model="answerContents"
                            label="처리 결과"
                            :rules="answerRules"
                            rows="5"
                            auto-grow
                            variant="outlined"
                        ></v-textarea>
                        <div class="d-flex justify-end mt-4">
                            <v-btn
                                color="primary"
                                :loading="answerLoading"
                                :disabled="!isAnswerFormValid"
                                @click="createAnswer"
                            >
                                등록하기
                            </v-btn>
                        </div>
                    </v-form>
                </div>
            </v-card>

            <!-- 하단 버튼 -->
            <div class="d-flex mt-6">
                <v-btn color="grey" variant="outlined" @click="goToList">
                    <v-icon left class="mr-1">mdi-arrow-left</v-icon>
                    목록으로
                </v-btn>
            </div>
        </v-container>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ReportDetail',
    data() {
        return {
            report: null,
            answer: null,
            loading: false,
            answerLoading: false,
            isEditingAnswer: false,
            answerContents: '',
            editAnswerContents: '',
            isAnswerFormValid: false,
            currentUser: null,
            userRole: null,
            reporterNickname: '',
            reportedNickname: '',
            users: [], // 사용자 목록 저장
            answerRules: [
                v => !!v || '답변 내용을 입력해주세요',
                v => v.length <= 2000 || '답변은 2000자 이하여야 합니다'
            ]
        }
    },
    computed: {
        isAuthor() {
            return this.currentUser && 
                   this.report && 
                   Number(this.report.reporterId) === Number(this.currentUser.id);
        }
    },
    async created() {
        try {
            // 현재 사용자 정보 가져오기
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                this.$router.push('/report/list');
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
            const userRole = payload.role;

            // 게시글 정보 가져오기
            const response = await axios.get(
                `${process.env.VUE_APP_API_BASE_URL}/report/${this.$route.params.id}`
            );

            // 관리자나 작성자만 접근 가능
            if (userRole !== 'ADMIN' && Number(response.data.reporterId) !== Number(userId)) {
                alert('해당 신고글에 접근할 권한이 없습니다.');
                this.$router.push('/report/list');
                return;
            }

            this.report = response.data;
            this.currentUser = {
                id: userId,
                role: userRole
            };
            this.userRole = userRole;

            // 답변 조회
            try {
                const answerResponse = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/report/answer/${this.$route.params.id}`
                );
                if (answerResponse.data && answerResponse.data.contents) {
                    this.answer = answerResponse.data;
                }
            } catch (error) {
                console.error('답변 조회 실패:', error);
                this.answer = null;
            }

            // 사용자 목록 조회
            const usersResponse = await axios.get(
                `${process.env.VUE_APP_API_BASE_URL}/user/list`
            );
            this.users = usersResponse.data;

            // 신고자와 신고 대상자의 닉네임 찾기
            const reporter = this.users.find(user => user.userId === this.report.reporterId);
            const reported = this.users.find(user => user.userId === this.report.reportedId);

            this.reporterNickname = reporter ? reporter.nickName : '알 수 없음';
            this.reportedNickname = reported ? reported.nickName : '알 수 없음';

        } catch (error) {
            console.error('신고글 조회 실패:', error);
            alert('신고글을 불러올 수 없습니다.');
            this.$router.push('/report/list');
        }
    },
    methods: {
        getReportClassText(reportClass) {
            const classMap = {
                'SPAM': '스팸',
                'ABUSE': '욕설/비방',
                'FLOODING': '도배',
                'OTHER': '기타'
            };
            return classMap[reportClass] || reportClass;
        },
        getReportClassColor(reportClass) {
            const colorMap = {
                'SPAM': 'red',
                'ABUSE': 'orange',
                'FLOODING': 'yellow',
                'OTHER': 'grey'
            };
            return colorMap[reportClass] || 'grey';
        },
        async editPost() {
            this.$router.push(`/report/update/${this.report.id}`);
        },
        async deletePost() {
            if (!confirm('정말 삭제하시겠습니까?')) return;

            try {
                await axios.delete(
                    `${process.env.VUE_APP_API_BASE_URL}/report/delete/${this.report.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                alert('신고글이 삭제되었습니다.');
                this.$router.push('/report/list');
            } catch (error) {
                console.error('신고글 삭제 실패:', error);
                alert('신고글 삭제에 실패했습니다.');
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
        async createAnswer() {
            if (!this.$refs.answerForm.validate()) return;

            this.answerLoading = true;
            try {
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/report/answer/create`,
                    {
                        reportId: this.report.id,
                        contents: this.answerContents
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                this.answer = response.data;
                this.answerContents = '';
            } catch (error) {
                console.error('답변 등록 실패:', error);
                alert('답변 등록에 실패했습니다.');
            } finally {
                this.answerLoading = false;
            }
        },
        async updateAnswer() {
            if (!this.$refs.editAnswerForm.validate()) return;

            this.answerLoading = true;
            try {
                const response = await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/report/answer/update/${this.answer.id}`,
                    {
                        contents: this.editAnswerContents
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                this.answer = response.data;
                this.isEditingAnswer = false;
            } catch (error) {
                console.error('답변 수정 실패:', error);
                alert('답변 수정에 실패했습니다.');
            } finally {
                this.answerLoading = false;
            }
        },
        async deleteAnswer() {
            if (!confirm('정말 답변을 삭제하시겠습니까?')) return;

            try {
                await axios.delete(
                    `${process.env.VUE_APP_API_BASE_URL}/report/answer/delete/${this.answer.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                this.answer = null;
            } catch (error) {
                console.error('답변 삭제 실패:', error);
                alert('답변 삭제에 실패했습니다.');
            }
        },
        goToList() {
            this.$router.push({
                path: '/service',
                query: { tab: 'report' }
            });
        }
    }
}
</script>

<style scoped>
.report-detail {
    background-color: #f5f5f5;
    min-height: 100vh;
}

.post-card, .answer-card, .answer-form-card {
    border-radius: 12px;
    background-color: white;
}

.post-header, .answer-header {
    background-color: #fafafa;
}

.status-chip {
    font-weight: 500;
}

.post-info, .answer-info {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    color: #666;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9rem;
}

.content-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.post-image {
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
}

.post-image:hover {
    transform: scale(1.02);
}

.gap-2 {
    gap: 8px;
}

@media (max-width: 600px) {
    .post-info, .answer-info {
        flex-direction: column;
        gap: 8px;
    }
}
</style>