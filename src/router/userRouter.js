import FindUser from "@/views/FindUser.vue";
import UserCreate from "@/views/UserCreate.vue";
import UserLogin from "@/views/UserLogin.vue";
import UserMyPage from "@/views/UserMyPage.vue";
import UserYourPage from "@/views/UserYourPage.vue";

export const membereRouter = [
    {
        path: '/user/login',
        name: 'UserLogin',
        component: UserLogin
    },
    {
        path: '/user/create',
        name: 'UserCreate',
        component:UserCreate
    },
    {
        path: '/user/mypage',
        name: 'UserMyPage',
        component:UserMyPage
    },
    {
        path: '/user/findUser',
        name: 'FindUser',
        component:FindUser
    },
    {
        path: '/user/yourPage',
        name: 'UserYourPage',
        component:UserYourPage
    },
]