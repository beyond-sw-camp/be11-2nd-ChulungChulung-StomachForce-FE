<template>
    <v-container class="pa-0">
        <v-tabs v-model="activeTab">
            <v-tab value="service">문의사항</v-tab>
            <v-tab value="report">신고</v-tab>
        </v-tabs>

        <!-- 문의사항 탭 -->
        <div v-if="activeTab === 'service'" class="pt-4">
            <service-post-list></service-post-list>
        </div>

        <!-- 신고 탭 -->
        <div v-else class="pt-4">
            <report-list></report-list>
        </div>
    </v-container>
</template>

<script>
import ServicePostList from '@/views/ServicePostList.vue';
import ReportList from '@/views/ReportList.vue';

export default {
    name: 'ServiceAndReportList',
    components: {
        ServicePostList,
        ReportList
    },
    data() {
        return {
            activeTab: 'service'
        }
    },
    created() {
        // URL 쿼리 파라미터에서 탭 정보 가져오기
        const tabFromQuery = this.$route.query.tab;
        if (tabFromQuery && ['service', 'report'].includes(tabFromQuery)) {
            this.activeTab = tabFromQuery;
        }
    },
    watch: {
        // 라우터 쿼리 변경 감지
        '$route.query.tab'(newTab) {
            if (newTab && ['service', 'report'].includes(newTab)) {
                this.activeTab = newTab;
            }
        }
    }
}
</script>

<style scoped>
:deep(.v-tabs) {
    border-bottom: none;
}
</style>
