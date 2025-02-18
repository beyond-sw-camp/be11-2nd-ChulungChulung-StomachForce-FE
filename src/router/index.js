import { createRouter, createWebHistory } from "vue-router"
import { RestaurantRouter } from "./restaurantRouter";


const routes = [
    ...RestaurantRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;