<template>
    <v-container>
        <v-card class="mx-auto" max-width="800">
            <v-card-title class="d-flex align-center">
                신고 내용
                <v-chip
                    class="ml-4"
                    :color="getReportClassColor(report?.reportClass)"
                    size="small"
                >
                    {{ getReportClassText(report?.reportClass) }}
                </v-chip>
                <v-chip
                    class="ml-4"
                    :color="answer ? 'success' : 'warning'"
                    size="small"
                >
                    {{ answer ? '답변완료' : '답변대기' }}
                </v-chip>
            </v-card-title>

            <v-card-subtitle v-if="report">
                작성일: {{ new Date(report.createdAt).toLocaleDateString() }}
            </v-card-subtitle>

            <v-card-text v-if="report">
                <div class="content-text">{{ report.contents }}</div>
                
                <!-- 이미지 표시 부분 -->
                <div v-if="report.photos && report.photos.length > 0" class="image-container mt-4">
                    <v-img
                        v-for="(photo, index) in report.photos"
                        :key="index"
                        :src="photo"
                        @click="openImageDialog(photo)"
                        class="report-image ma-2"
                        cover
                        max-height="200"
                    ></v-img>
                </div>
            </v-card-text>

            <!-- 수정/삭제 버튼 (작성자인 경우에만 표시) -->
            <v-card-actions v-if="isAuthor">
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="editPost">
                    수정하기
                </v-btn>
                <v-btn color="error" @click="deletePost">
                    삭제하기
                </v-btn>
            </v-card-actions>
        </v-card>

        <!-- 답변 표시 -->
        <v-card v-if="answer" class="mx-auto mt-4" max-width="800">
            <v-card-title>
                답변
                <v-spacer></v-spacer>
                <v-btn
                    v-if="userRole === 'ADMIN'"
                    icon="mdi-pencil"
                    size="small"
                    @click="startEditAnswer"
                ></v-btn>
                <v-btn
                    v-if="userRole === 'ADMIN'"
                    icon="mdi-delete"
                    size="small"
                    color="error"
                    @click="deleteAnswer"
                ></v-btn>
            </v-card-title>

            <v-card-text>
                <!-- 수정 모드일 때는 폼 표시 -->
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
        <v-card v-else-if="userRole === 'ADMIN'" class="mx-auto mt-4" max-width="800">
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
                    <div class="d-flex justify-end gap-2">
                        <v-btn
                            color="primary"
                            :loading="answerLoading"
                            :disabled="!isAnswerFormValid"
                            @click="createAnswer"
                        >
                            답변 등록
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
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
        }
    }
}
</script>

<style scoped>
.content-text {
    white-space: pre-line;
    line-height: 1.5;
}

.image-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.report-image {
    width: 200px;
    cursor: pointer;
}

.gap-2 {
    gap: 8px;
}
</style>