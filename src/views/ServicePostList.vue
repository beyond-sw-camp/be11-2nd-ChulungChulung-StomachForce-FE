<template>
    <v-container>
        <!-- 상단 헤더 영역 -->
        <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h5">문의사항</h2>
            <v-btn
                color="red"
                prepend-icon="mdi-plus"
                @click="handleCreatePostClick"
            >
                문의하기
            </v-btn>
        </div>

        <v-divider class="mb-4"></v-divider>
        <!-- 리스트 아이템 -->
        <v-list class="list-content">
            <v-list-item
                v-for="post in posts"
                :key="post.id"
                @click="handlePostClick(post)"
                class="list-item"
            >
                <div class="d-flex align-center w-100">
                    <span class="visibility-col text-center">
                        <v-chip
                            :color="post.visibility === 'Y' ? 'success' : 'warning'"
                            size="small"
                            class="font-weight-medium"
                        >
                            {{ post.visibility === 'Y' ? '공개' : '비공개' }}
                        </v-chip>
                    </span>
                    <span class="title-col" :class="{ 'blur-text': shouldBlurTitle(post) }">
                        {{ post.title }}
                    </span>
                    <span class="category-col text-center">
                        <v-chip
                            :color="getCategoryColor(post.category)"
                            size="small"
                            class="font-weight-medium"
                        >
                            {{ getCategoryText(post.category) }}
                        </v-chip>
                    </span>
                    <span class="status-col text-center">
                        <v-chip
                            :color="post.answer ? 'success' : 'warning'"
                            size="small"
                            class="font-weight-medium"
                        >
                            {{ post.answer ? '답변완료' : '답변대기' }}
                        </v-chip>
                    </span>
                </div>
            </v-list-item>
        </v-list>

        <div class="bottom-container py-4">
            <div class="pagination-wrapper">
                <v-pagination
                    v-model="page"
                    :length="totalPages"
                    :total-visible="7"
                ></v-pagination>
            </div>
        </div>
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
        handleCreatePostClick() {
            if (!this.currentUser) {
                alert('로그인이 필요합니다.');
                return;
            }
            this.$router.push('/service/post/create');
        
    },
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
                'COMPLAINT': '#9575CD'
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
.service-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.list-content {
    background: transparent !important;
}

.list-item {
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.2s;
    cursor: pointer;
    min-height: 60px !important;
}

.list-item:hover {
    background-color: #f5f5f5;
}

.list-item:last-child {
    border-bottom: none;
}

/* 컬럼 너비 설정 */
.id-col {
    width: 80px;
    flex-shrink: 0;
}

.title-col {
    flex-grow: 1;
    padding: 0 16px;
}

.category-col,
.visibility-col,
.status-col {
    width: 120px;
    flex-shrink: 0;
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

.bottom-container {
    position: relative;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* v-list 기본 패딩 제거 */
:deep(.v-list-item__content) {
    padding: 0;
}

:deep(.v-list-item) {
    padding: 8px 16px;
}
</style>