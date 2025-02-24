import ReportCreate from "@/views/ReportCreate.vue";
import ReportList from "@/views/ReportList.vue";
import ReportUpdate from "@/views/ReportUpdate.vue";
import ReportDetail from "@/views/ReportDetail.vue";

export const reportRouter = [
    {
        path: '/report/list',
        name: 'ReportList',
        component: ReportList
    },
    {
        path: '/report/create',
        name: 'ReportCreate',
        component: ReportCreate
    },
    {
        path: '/report/update/:id',
        name: 'ReportUpdate',
        component: ReportUpdate,
        props: route => ({ id: Number(route.params.id) })
    },
    {
        path: '/report/:id',
        name: 'ReportDetail',
        component: ReportDetail,
        props: route => ({ id: Number(route.params.id) })
    }
];