<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- 헤더 -->
        <div class="text-center mb-8">
          <v-icon size="40" color="deep-orange" class="mb-3">mdi-bookmark-multiple</v-icon>
          <h2 class="text-h4 font-weight-bold mb-2">My Favorites</h2>
          <div class="text-subtitle-1 text-grey">맛있는 순간들을 모아봤어요</div>
        </div>

        <!-- 북마크 리스트 -->
        <v-list class="bookmark-list rounded-lg">
          <v-list-item
            v-for="bookmark in bookmarks"
            :key="bookmark.restaurantId"
            @click="goToRestaurantDetail(bookmark.restaurantId)"
            class="bookmark-item mb-3"
            rounded="lg"
          >
            <template v-slot:prepend>
              <v-avatar size="64" rounded="lg" class="mr-4 elevation-2">
                <v-img 
                  :src="bookmark.restaurantPhoto" 
                  cover
                  class="restaurant-image"
                >
                  <template v-slot:placeholder>
                    <v-row align="center" justify="center" class="fill-height">
                      <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-avatar>
            </template>

            <div class="bookmark-content">
              <v-list-item-title class="text-h6 font-weight-bold mb-1">
                {{ bookmark.restaurantName }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-grey">
                <v-icon size="16" color="deep-orange-lighten-1" class="mr-1">mdi-bookmark</v-icon>
                저장됨
              </v-list-item-subtitle>
            </div>

            <template v-slot:append>
              <v-icon size="24" color="deep-orange-lighten-1" class="bookmark-arrow">mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-list>

        <!-- 로딩 인디케이터 -->
        <div v-if="loading" class="text-center py-6">
          <v-progress-circular
            size="32"
            color="deep-orange"
            indeterminate
          ></v-progress-circular>
        </div>

        <!-- 더보기 버튼 -->
        <div v-if="!isLastPage && !loading" class="text-center py-6">
          <v-btn
            color="deep-orange"
            variant="outlined"
            size="large"
            @click="loadMore"
            class="load-more-btn px-8"
            rounded="pill"
          >
            더보기
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useRouter } from "vue-router";
import axios from "axios";
import { ref, onMounted } from "vue";

export default {
  setup() {
    const router = useRouter();
    const bookmarks = ref([]);
    const page = ref(0);
    const size = ref(9);
    const isLastPage = ref(false);
    const loading = ref(false);

    const loadBookmarks = async () => {
      if (loading.value || isLastPage.value) return;
      loading.value = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/restaurant/myBookMark`,
          {
            params: { page: page.value, size: size.value },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const data = response.data;
        bookmarks.value.push(...data.content);
        if (page.value >= data.totalPages - 1) {
          isLastPage.value = true;
        }
        page.value++;
      } catch (error) {
        console.error("즐겨찾기 목록 로드 실패:", error);
      } finally {
        loading.value = false;
      }
    };

    const goToRestaurantDetail = (restaurantId) => {
      router.push(`/restaurant/detail/${restaurantId}`);
    };

    onMounted(() => {
      loadBookmarks();
    });

    return {
      bookmarks,
      page,
      size,
      isLastPage,
      loading,
      loadBookmarks,
      loadMore: loadBookmarks,
      goToRestaurantDetail,
    };
  },
};
</script>

<style scoped>
.bookmark-list {
  background: transparent;
  max-width: 100%;
  margin: 0 auto;
}

.bookmark-item {
  background: white;
  border: 1px solid #eeeeee;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 12px !important;
  height: 96px;
}

.bookmark-item:hover {
  transform: translateY(-2px);
  border-color: #ffccbc;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, white, #fff5f2);
}

.bookmark-item:hover .restaurant-image {
  transform: scale(1.05);
}

.restaurant-image {
  transition: transform 0.3s ease;
}

.bookmark-content {
  overflow: hidden;
}

.bookmark-arrow {
  transition: transform 0.3s ease;
}

.bookmark-item:hover .bookmark-arrow {
  transform: translateX(4px);
}

.load-more-btn {
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 87, 34, 0.2);
}

@media (max-width: 600px) {
  .bookmark-item {
    height: 80px;
    margin-bottom: 8px !important;
  }
  
  .text-h4 {
    font-size: 1.75rem !important;
  }
}
</style>
  