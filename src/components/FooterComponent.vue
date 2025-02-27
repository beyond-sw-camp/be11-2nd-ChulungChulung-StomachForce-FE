<template>
    <v-footer class="footer-container">
        <v-container>
            <v-row>
                <!-- 회사 로고 및 정보 -->
                <v-col cols="3">
                    <div class="company-info">
                        <h2 class="company-name">StomachForce Corporation</h2>
                        <p class="copyright">©2025 StomachForce, Inc.</p>
                        <p class="rights">All rights reserved.</p>
                    </div>
                </v-col>

               

                <!-- 소셜 미디어 아이콘 -->
                <v-col cols="3" class="text-right">
                    <div class="social-icons">
                        <v-icon>mdi-google</v-icon>
                        <v-icon>mdi-twitch</v-icon>
                        <v-icon>mdi-facebook</v-icon>
                        <v-icon>mdi-instagram</v-icon>
                    </div>
                </v-col>
            </v-row>

            <!-- 회사 상세 정보 -->
            <v-row class="company-details mt-1">
                <v-col cols="12">
                    <div class="detail-line">
                        <span>상호명: 주식회사 뱃살력컴퍼니</span>
                        <span>대표: 양기정</span>
                        <span>사업자등록번호: 155-51-11515</span>
                        <span>전화: 1577-1666</span>
                        <span>팩스: 070-2321-4251</span>
                        <span>이메일: gorani@daum.net</span>
                    </div>
                    <div class="detail-line">
                        <span>주소: 서울특별시 강남구 어디로 7길 7 (3F)</span>
                        <span>영업 시간: 09:00 - 18:00</span>
                        <span>점심 시간: 12:00 - 13:00</span>
                    </div>
                    <div class="detail-line links mt-2">
                        <router-link to="/privacy">위치기반 약관</router-link>
                        <router-link to="/terms">개인정보 처리방침</router-link>
                        <router-link to="/service">서비스 이용약관</router-link>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </v-footer>
</template>

<style scoped>
.footer-container {
    background-color: white !important;
    color: #666;
    padding: 0px 0;
    border-top: 1px solid #eee;
}

.company-name {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}

.copyright, .rights {
    font-size: 14px;
    color: #888;
    margin: 2px 0;
}

.menu-group {
    display: flex;
    flex-direction: column;
}

.menu-link {
    color: #666;
    text-decoration: none;
    margin: 4px 0;
    font-size: 14px;
}

.menu-link:hover {
    color: #333;
}

.social-icons {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
}

.social-icons .v-icon {
    font-size: 20px;
    color: #666;
}

.company-details {
    font-size: 13px;
    color: #888;
}

.detail-line {
    margin: 5px 0;
}

.detail-line span {
    margin-right: 15px;
}

.detail-line.links a {
    color: #666;
    text-decoration: none;
    margin-right: 15px;
}

.detail-line.links a:hover {
    color: #333;
}
</style>