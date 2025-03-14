import { createRouter, createWebHistory } from "vue-router"
import { membereRouter } from "./userRouter";
import { postRouter } from "./postRouter";
import { RestaurantRouter } from "./restaurantRouter";
import { serviceRouter } from "./serviceRouter";
import { loginRouter } from "./loginRouter";
import { homeRouter } from "./homeRouter";
import { announcementRouter } from "./announcementRouter";
import { reportRouter } from "./reportRouter";
import GoogleRedirect from "@/components/GoogleRedirect.vue";

const routes = [
    ...membereRouter,
    ...postRouter,
    ...RestaurantRouter,
    ...serviceRouter,
    ...loginRouter,
    ...homeRouter,
    ...announcementRouter,
    ...reportRouter,
    {
        path:"/oauth/google/redirect",
        component:GoogleRedirect
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;