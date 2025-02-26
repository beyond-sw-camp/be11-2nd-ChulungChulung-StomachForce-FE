import FindUser from "@/views/FindUser.vue";
import InfluencerListPage from "@/views/InfluencerListPage.vue";
import ReservationDetailPage from "@/views/ReservationDetailPage.vue";
import ReservationList from "@/views/ReservationList.vue";
import UserBlocked from "@/views/UserBlocked.vue";
import UserCreate from "@/views/UserCreate.vue";
import UserLogin from "@/views/UserLogin.vue";
import UserMyBookMark from "@/views/UserMyBookMark.vue";
import UserMyPage from "@/views/UserMyPage.vue";
import UserUpdate from "@/views/UserUpdate.vue";
import UserVipBenefit from "@/views/UserVipBenefit.vue";
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
        path: '/user/update',
        name: 'UserUpdate',
        component:UserUpdate
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
    {
        path: '/user/myVip',
        name: 'UserVipBenefit',
        component:UserVipBenefit
    },
    {
        path: '/user/block',
        name: 'UserBlocked',
        component:UserBlocked
    },
    {
            path: '/user/reservation',
            name: 'ReservationList',
            component: ReservationList
        },
            {
                path: '/user/reservation/detail/:id',
                name: 'ReservationDetailPage',
                component: ReservationDetailPage
            },

            
    {
        path: '/influencer/list',
        name: 'InfluencerListPage',
        component:InfluencerListPage
    },
    {
        path: '/user/myBookMark',
        name: 'userMyBookMark',
        component:UserMyBookMark
    }

    
]