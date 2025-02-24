import { createRouter, createWebHistory } from "vue-router"
import { membereRouter } from "./userRouter";
import { postRouter } from "./postRouter";
import { RestaurantRouter } from "./restaurantRouter";
import { loginRouter } from "./loginRouter";


const routes = [
    ...membereRouter,
    ...postRouter,
    ...RestaurantRouter,
    ...loginRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;