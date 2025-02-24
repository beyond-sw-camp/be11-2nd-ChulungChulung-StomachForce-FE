<template>
    <v-container>
        <v-card class="mx-auto" max-width="1000">
            <v-card-title class="text-h4 py-4 px-6">
                문의 게시판
                <v-spacer></v-spacer>
                <v-btn
                    color="red"
                    :to="{path:'/service/post/create'}"
                    prepend-icon="mdi-plus"
                >
                    게시글 등록
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-table>
                <thead>
                    <tr>
                        <th class="text-center">번호</th>
                        <th>제목</th>
                        <th class="text-center">문의유형</th>
                        <th class="text-center">공개여부</th>
                        <th class="text-center">답변상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="post in posts" :key="post.id" 
                        @click="handlePostClick(post)"
                        style="cursor: pointer"
                        class="post-row"
                    >
                        <td class="text-center">{{ post.id }}</td>
                        <td :class="{ 'blur-text': shouldBlurTitle(post) }">
                            {{ post.title }}
                        </td>
                        <td class="text-center">
                            <v-chip
                                :color="getCategoryColor(post.category)"
                                size="small"
                            >
                                {{ getCategoryText(post.category) }}
                            </v-chip>
                        </td>
                        <td class="text-center">
                            <v-chip
                                :color="post.visibility === 'Y' ? 'success' : 'warning'"
                                size="small"
                            >
                                {{ post.visibility === 'Y' ? '공개' : '비공개' }}
                            </v-chip>
                        </td>
                        <td class="text-center">
                            <v-chip
                                :color="post.answer ? 'success' : 'warning'"
                                size="small"
                            >
                                {{ post.answer ? '답변완료' : '답변대기' }}
                            </v-chip>
                        </td>
                    </tr>
                </tbody>
            </v-table>

            <v-divider></v-divider>

            <v-card-actions class="pa-4 justify-center">
                <v-pagination
                    v-model="page"
                    :length="totalPages"
                    :total-visible="7"
                ></v-pagination>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return { 
            posts: [],
            page: 1,
            totalPages: 1,
            currentUser: null,
            userRole: null
        };
    },
    methods: {
        getCategoryText(category) {
            const categoryMap = {
                'INQUIRY': '문의사항',
                'REQUEST': '요청사항',
                'COMPLAINT': '불만사항'
            };
            return categoryMap[category] || category;
        },
        getCategoryColor(category) {
            const colorMap = {
                'INQUIRY': 'blue',
                'REQUEST': 'green',
                'COMPLAINT': 'orange'
            };
            return colorMap[category] || 'grey';
        },
        shouldBlurTitle(post) {
            // 공개글은 블러 처리하지 않음
            if (post.visibility === 'Y') {
                return false;
            }

            // 비로그인 상태에서는 비공개글 블러 처리
            if (!this.currentUser) {
                return true;
            }

            // admin은 모든 글을 볼 수 있음
            if (this.userRole === 'ADMIN') {
                return false;
            }
            
            // 일반 사용자는 자신의 비공개글만 볼 수 있음
            if (this.userRole === 'USER') {
                return Number(post.userId) !== Number(this.currentUser.id);
            }

            return true; // 기본적으로는 블러 처리
        },
        handlePostClick(post) {
            console.log('Checking post access:');
            console.log('Current User:', this.currentUser);
            console.log('Post:', post);

            // 공개글은 모든 사용자가 볼 수 있음
            if (post.visibility === 'Y') {
                this.goToPost(post.id);
                return;
            }

            // 비로그인 상태에서 비공개글 접근 시도
            if (!this.currentUser) {
                alert('비공개 글은 로그인 후 확인할 수 있습니다.');
                return;
            }

            // admin은 모든 글에 접근 가능
            if (this.userRole === 'ADMIN') {
                this.goToPost(post.id);
                return;
            }

            // 일반 사용자의 경우 자신의 비공개글만 접근 가능
            if (this.userRole === 'USER') {
                if (Number(post.userId) === Number(this.currentUser.id)) {
                    this.goToPost(post.id);
                    return;
                }
                alert('비공개 글은 작성자만 확인할 수 있습니다.');
                return;
            }
        },
        goToPost(postId) {
            if (!postId) return;
            this.$router.push({
                path: `/service/post/${postId}`
            });
        },
        async fetchCurrentUser() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.currentUser = null;
                    this.userRole = null;
                    return;
                }

                // 토큰 디코딩
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                
                // localStorage에서 userId 직접 가져오기
                const userId = localStorage.getItem('userId');
                
                this.currentUser = {
                    id: userId ? Number(userId) : null,  // userId를 숫자로 변환
                    identify: payload.sub,
                    role: payload.role
                };
                this.userRole = payload.role;

                console.log('Token Payload:', payload);
                console.log('UserId from localStorage:', userId);
                console.log('Current User:', this.currentUser);
            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
                this.currentUser = null;
                this.userRole = null;
            }
        },
        async fetchPosts() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/service/list`);
                const postsWithAnswers = await Promise.all(
                    response.data.map(async (post) => {
                        try {
                            const answerResponse = await axios.get(
                                `${process.env.VUE_APP_API_BASE_URL}/service/answer/${post.id}`
                            );
                            return {
                                ...post,
                                answer: answerResponse.data && answerResponse.data.contents
                            };
                        } catch (error) {
                            return {
                                ...post,
                                answer: false
                            };
                        }
                    })
                );
                this.posts = postsWithAnswers;
                console.log('Fetched Posts:', this.posts);
            } catch (error) {
                console.error('게시글 목록 조회 실패:', error);
            }
        }
    },
    async mounted() {
        await this.fetchCurrentUser();
        await this.fetchPosts();
    }
};
</script>

<style scoped>
.post-row:hover {
    background-color: #f5f5f5;
}

.v-table {
    cursor: default;
}

th {
    font-weight: bold !important;
    background-color: #f5f5f5;
}

.v-chip {
    font-weight: 500;
}

.blur-text {
    filter: blur(4px);
    user-select: none;
}

.blur-text:hover {
    filter: blur(4px);
}
</style>