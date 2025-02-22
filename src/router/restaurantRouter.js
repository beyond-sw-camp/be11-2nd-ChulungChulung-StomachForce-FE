import RestaurantListComponent from "@/components/RestaurantListComponent.vue";
import RestaurantCreate from "@/views/RestaurantCreate.vue";
import RestaurantDetailHome from "@/views/RestaurantDetailHome.vue";

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



]