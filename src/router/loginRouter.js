import LoginPage from "@/views/LoginPage.vue";
import SelectCreate from "@/views/SelectCreate.vue";

export const loginRouter = [
    {
        path: "/login",
        name: "Login",
        component: LoginPage
    },
    {
        path: "/selectCreate",
        name: "SelectCreate",
        component: SelectCreate 
    }

]