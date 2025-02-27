<template>
    <v-container class="pa-0">
        <div class="text-right mb-4">
            <v-btn
                color="red"
                prepend-icon="mdi-plus"

                @click="handleReportCreateClick"
            >
                신고하기
            </v-btn>
        </div>

        <!-- 리스트 아이템 -->
        <v-list class="list-content">
            <v-list-item
                v-for="report in reports"
                :key="report.id"
                @click="goToReport(report.id)"
                class="list-item"
            >
                <div class="d-flex align-center w-100">
                    <span class="type-col text-center">
                        <v-chip
                            :color="getReportClassColor(report.reportClass)"
                            size="small"
                            class="font-weight-medium"
                        >
                            {{ getReportClassText(report.reportClass) }}
                        </v-chip>
                    </span>
                    <span class="content-col">{{ report.contents }}</span>
                    <span class="status-col text-center">
                        <v-chip
                            :color="report.answer ? 'success' : 'warning'"
                            size="small"
                            class="font-weight-medium"
                        >
                            {{ report.answer ? '답변완료' : '답변대기' }}
                        </v-chip>
                    </span>
                </div>
            </v-list-item>
        </v-list>

        <div class="bottom-container py-4">
            <div class="pagination-wrapper">
                <v-pagination
                    v-model="page"
                    :length="totalPages"
                    :total-visible="7"
                ></v-pagination>
            </div>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ReportList',
    data() {
        return { 
            reports: [],
            currentUser: null,
            userRole: null
        };
    },
    methods: {

        async handleReportCreateClick() {
            if (!this.currentUser) {
                alert('로그인이 필요합니다.');
                return;
            }
            this.$router.push('/report/create');
        },
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
        async goToReport(reportId) {
            if (!this.currentUser) {
                alert('로그인이 필요합니다.');
                return;
            }
            this.$router.push(`/report/${reportId}`);
        },
        async fetchCurrentUser() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.currentUser = null;
                    this.userRole = null;
                    return;
                }

                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                const userId = localStorage.getItem('userId');
                
                this.currentUser = {
                    id: userId,
                    role: payload.role
                };
                this.userRole = payload.role;
            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
                this.currentUser = null;
                this.userRole = null;
            }
        },
        async fetchReports() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/report/list`);
                const reportsWithAnswers = await Promise.all(
                    response.data.map(async (report) => {
                        try {
                            const answerResponse = await axios.get(
                                `${process.env.VUE_APP_API_BASE_URL}/report/answer/${report.id}`
                            );
                            return {
                                ...report,
                                answer: answerResponse.data && answerResponse.data.contents
                            };
                        } catch (error) {
                            return {
                                ...report,
                                answer: false
                            };
                        }
                    })
                );
                this.reports = reportsWithAnswers;
            } catch (error) {
                console.error('신고 목록 조회 실패:', error);
            }
        }
    },
    async mounted() {
        await this.fetchCurrentUser();
        await this.fetchReports();
    }
};
</script>

<style scoped>
.list-content {
    background: transparent !important;
}

.list-item {
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.2s;
    cursor: pointer;
    min-height: 60px !important;
}

.list-item:hover {
    background-color: #f5f5f5;
}

.list-item:last-child {
    border-bottom: none;
}

.type-col {
    width: 120px;
    flex-shrink: 0;
}

.content-col {
    flex-grow: 1;
    padding: 0 16px;
}

.status-col {
    width: 120px;
    flex-shrink: 0;
}

.v-chip {
    font-weight: 500;
}

.bottom-container {
    position: relative;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* v-list 기본 패딩 제거 */
:deep(.v-list-item__content) {
    padding: 0;
}

:deep(.v-list-item) {
    padding: 8px 16px;
}
</style>