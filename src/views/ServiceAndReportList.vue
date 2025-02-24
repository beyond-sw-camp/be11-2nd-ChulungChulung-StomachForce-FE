<template>
    <v-container>
        <v-card class="mx-auto" max-width="1000">
            <v-tabs v-model="activeTab">
                <v-tab value="service">문의사항</v-tab>
                <v-tab value="report">신고</v-tab>
            </v-tabs>

            <!-- 문의사항 탭 -->
            <div v-if="activeTab === 'service'" class="pa-4">
                <service-post-list></service-post-list>
            </div>

            <!-- 신고 탭 -->
            <div v-else class="pa-4">
                <report-list></report-list>
            </div>
        </v-card>
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
    }
}
</script>

<style scoped>
.v-card {
    height: 100%;
}
</style> 