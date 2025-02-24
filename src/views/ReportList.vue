<template>
    <v-container>
        <v-card class="mx-auto" max-width="1000">
            <v-card-title class="text-h4 py-4 px-6">
                신고 목록
                <v-spacer></v-spacer>
                <v-btn
                    color="red"
                    :to="{path:'/report/create'}"
                    prepend-icon="mdi-plus"
                >
                    신고하기            
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-table>
                <thead>
                    <tr>
                        <th class="text-center">번호</th>
                        <th class="text-center">신고 유형</th>
                        <th>신고 내용</th>
                        <th class="text-center">답변상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="report in reports" :key="report.id" 
                        @click="goToReport(report.id)"
                        style="cursor: pointer"
                        class="report-row"
                    >
                        <td class="text-center">{{ report.id }}</td>
                        <td class="text-center">
                            <v-chip
                                :color="getReportClassColor(report.reportClass)"
                                size="small"
                            >
                                {{ getReportClassText(report.reportClass) }}
                            </v-chip>
                        </td>
                        <td>{{ report.contents }}</td>
                        <td class="text-center">
                            <v-chip
                                :color="report.answer ? 'success' : 'warning'"
                                size="small"
                            >
                                {{ report.answer ? '답변완료' : '답변대기' }}
                            </v-chip>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>
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
.report-row:hover {
    background-color: #f5f5f5;
}

.v-table {
    cursor: default;
}

th {
    font-weight: bold !important;
    background-color: #f5f5f5;
}

.v-chip {
    font-weight: 500;
}
</style>