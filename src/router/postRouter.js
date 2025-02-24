import CreatePost from "@/views/CreatePost.vue";
import PostList from "@/views/PostList.vue";
import UserPostDetail from "@/views/UserPostDetail.vue";

export const postRouter = [
    {
        path: "/post/create",
        name: "CreatePost",
        component: CreatePost
    },
    {
        path: "/post/detail/:postId",
        name: "UserPostDetail",
        component: UserPostDetail
    },
    {
        path: "/post/postList",
        name: "PostList",
        component: PostList
    }
]