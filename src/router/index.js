import { createRouter, createWebHistory } from "vue-router"
import { membereRouter } from "./userRouter";


const routes = [
    ...membereRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;