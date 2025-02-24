import EventPage from "@/views/eventPage.vue";
import NoticeCreatePage from "@/views/noticeCreatePage.vue";
import NoticeDetailPage from "@/views/noticeDetailPage.vue";
import NoticePage from "@/views/noticePage.vue";
import NoticeUpdatePage from "@/views/noticeUpdatePage.vue";

export const announcementRouter = [
    {
        path: "/notice",
        name: "noticePage",
        component: NoticePage
    },
    {
        path: "/event",
        name: "EventPage",
        component: EventPage
    },
    {
        path: "/notice/:id",  // 
        name: "NoticeDetailPage",
        component: NoticeDetailPage,
        props: true  // 
    },
    {
        path: "/NoticeCreatePage",  // 
        name: "NoticeCreatePage",
        component: NoticeCreatePage,
    },
    {
        path: '/notice/update/:id', // 🔹 공지사항 ID를 URL에 포함하여 수정 페이지 접근
        name: 'NoticeUpdatePage',
        component: NoticeUpdatePage,
        props: true, // 🔹 URL 파라미터를 컴포넌트로 전달
      },
    



]