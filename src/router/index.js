import { createRouter, createWebHistory } from "vue-router"
import { membereRouter } from "./userRouter";
import { postRouter } from "./postRouter";

const routes = [
    ...membereRouter,
    ...postRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;