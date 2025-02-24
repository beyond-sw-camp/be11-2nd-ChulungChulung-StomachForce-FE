import RestaurantListComponent from "@/components/RestaurantListComponent.vue";
import ReservationCreatePage from "@/views/ReservationCreatePage.vue";
import RestaurantCreate from "@/views/RestaurantCreate.vue";
import RestaurantDetailHome from "@/views/RestaurantDetailHome.vue";
import RestaurantDetailMain from "@/views/RestaurantDetailMain.vue";
import RestaurantLogin from "@/views/RestaurantLogin.vue";
import RestaurantReviewAll from "@/views/RestaurantReviewAll.vue";

export const RestaurantRouter = [
    {
        path: '/restaurant/create',
        name: 'RestaurantCreate',
        component: RestaurantCreate
    },
    {
        path: '/restaurant/list',
        name: 'RestaurantListComponent',
        component: RestaurantListComponent
    },
    {
        path: '/restaurant/detail/:id',
        name: 'RestaurantDetailHome',
        component: RestaurantDetailHome
    },
    {
        path: '/restaurant/detail/:id/main',
        name: 'RestaurantDetailMain',
        component: RestaurantDetailMain
    },
    {
        path: '/restaurant/detail/:id/reviews',
        name: 'RestaurantReviewAll',
        component: RestaurantReviewAll
    },
    {
        path: '/restaurant/login',
        name: 'RestaurantLogin',
        component: RestaurantLogin
    },
    {
        path: '/restaurant/reservation/:id',
        name: 'ReservationCreatePage',
        component: ReservationCreatePage
    },



]