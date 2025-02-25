import ServicePost from "@/views/ServicePost.vue";
import ServicePostCreate from "@/views/ServicePostCreate.vue";
import ServicePostList from "@/views/ServicePostList.vue";
import ServicePostUpdate from "@/views/ServicePostUpdate.vue";
import ServiceAndReportList from '@/views/ServiceAndReportList.vue'
import UserList from '@/views/UserList.vue'

export const serviceRouter = [
    {
        path: '/service/list',
        name: 'ServicePostList',
        component: ServicePostList
    },
    {
        path: '/service/post/create',
        name: 'ServicePostCreate',
        component: ServicePostCreate
    },
    {
        path: '/service/post/update/:id',
        name: 'ServicePostUpdate',
        component: ServicePostUpdate,
        props: route => ({ id: Number(route.params.id) })
    },
    {
        path: '/service/post/:id',
        name: 'ServicePost',
        component: ServicePost,
        props: route => ({ id: Number(route.params.id) })
    },
    {
        path: '/service',
        name: 'ServiceAndReportList',
        component: ServiceAndReportList
    },
    {
        path: '/user/list',
        name: 'UserList',
        component: UserList
    }
];