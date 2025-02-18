import { createRouter, createWebHistory } from "vue-router"
import { membereRouter } from "./userRouter";
import { postRouter } from "./postRouter";
import { RestaurantRouter } from "./restaurantRouter";

const routes = [
    ...membereRouter,
    ...postRouter,
    ...RestaurantRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;