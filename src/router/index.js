import { createRouter, createWebHistory } from "vue-router"
import { membereRouter } from "./userRouter";
import { postRouter } from "./postRouter";
import { RestaurantRouter } from "./restaurantRouter";
import { serviceRouter } from "./serviceRouter";

const routes = [
    ...membereRouter,
    ...postRouter,
    ...RestaurantRouter,
    ...serviceRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;