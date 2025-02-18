<template>
  <v-app>
    <v-main class="create-post-bg">
      <v-container class="py-8">
        <v-card class="create-post-card mx-auto" elevation="3">
          <!-- 헤더 -->
          <v-card-title class="header-title pa-6">
            <span class="text-h5 font-weight-bold">새 게시글 작성</span>
            <v-btn
              color="primary"
              class="submit-btn"
              @click="submitPost"
              :loading="loading"
              :disabled="!isValid"
            >
              게시하기
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-row>
              <!-- 이미지 업로드 섹션 -->
              <v-col cols="12" md="6">
                <div class="upload-section">
                  <div v-if="!previewImages.length" class="upload-placeholder">
                    <v-icon size="40" color="grey-darken-1">mdi-cloud-upload</v-icon>
                    <p class="mt-3 upload-text">이미지를 선택하거나 드래그하세요</p>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      class="mt-4"
                      prepend-icon="mdi-image-plus"
                      @click="$refs.fileInput.$el.querySelector('input[type=file]').click()"
                    >
                      이미지 선택
                    </v-btn>
                  </div>
                  <v-carousel
                    v-else
                    height="400"
                    hide-delimiter-background
                    show-arrows="hover"
                    class="preview-carousel"
                  >
                    <v-carousel-item
                      v-for="(image, i) in previewImages"
                      :key="i"
                      :src="image"
                      cover
                    >
                      <div class="image-overlay">
                        <v-btn
                          icon="mdi-close"
                          size="small"
                          color="white"
                          variant="text"
                          @click="removeImage(i)"
                        ></v-btn>
                      </div>
                    </v-carousel-item>
                  </v-carousel>
                </div>

                <v-file-input
                  ref="fileInput"
                  v-model="images"
                  multiple
                  accept="image/*"
                  hide-input
                  class="d-none"
                  @change="handleFileChange"
                ></v-file-input>
              </v-col>

              <!-- 게시글 작성 섹션 -->
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="content"
                  label="게시글 내용"
                  placeholder="여러분의 이야기를 들려주세요..."
                  rows="12"
                  auto-grow
                  variant="outlined"
                  class="content-textarea mb-3"
                ></v-textarea>

                <div class="hashtags-section compact">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-2" size="small">mdi-pound</v-icon>
                    <span class="text-body-2 font-weight-medium">해시태그</span>
                  </div>
                  <v-chip-group class="hashtag-container-compact">
                    <v-chip
                      v-for="(tag, index) in plainHashtags"
                      :key="index"
                      closable
                      color="primary"
                      variant="outlined"
                      density="comfortable"
                      class="hashtag-chip"
                      @click:close="removeHashtag(tag)"
                    >
                      #{{ tag }}
                    </v-chip>
                  </v-chip-group>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      content: "",
      images: [],
      previewImages: [],
      loading: false
    };
  },
  computed: {
    isValid() {
      return this.content.trim() !== "" || this.images.length > 0;
    },
    // rawHashtags: 게시글 내용에서 '#'가 붙은 해시태그들을 추출
    rawHashtags() {
      const regex = /#[\w가-힣ㄱ-ㅎㅏ-ㅣ]+/g;
      const matches = this.content.match(regex);
      return matches ? [...new Set(matches)] : [];
    },
    // plainHashtags: '#'를 제거한 해시태그 배열
    plainHashtags() {
      return this.rawHashtags.map(tag => tag.replace(/^#/, ""));
    }
  },
  methods: {
    handleFileChange() {
      this.previewImages = [];
      if (this.images) {
        this.images.forEach(file => {
          const reader = new FileReader();
          reader.onload = e => {
            this.previewImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        });
      }
    },
    removeImage(index) {
      this.previewImages.splice(index, 1);
      this.images.splice(index, 1);
    },
    removeHashtag(tag) {
      // 원래 입력된 형태 (예: "#tag")를 찾아서 제거
      const originalTag = "#" + tag;
      const regex = new RegExp(`\\s*${originalTag}`, "g");
      this.content = this.content.replace(regex, "");
    },
    submitPost() {
      const formData = new FormData();
      // 해시태그들을 제거한 순수한 내용 생성
      const pureContent = this.content.replace(/#[\w가-힣ㄱ-ㅎㅏ-ㅣ]+/g, "").trim();
      formData.append("contents", pureContent);
      
      // plainHashtags (해시 기호 없이) 를 tags 필드에 추가
      this.plainHashtags.forEach(tag => {
        formData.append("tags", tag);
      });
      
      // 이미지 파일들을 postPhotos 필드에 추가
      if (this.images && this.images.length > 0) {
        this.images.forEach(file => {
          formData.append("postPhotos", file);
        });
      }
      
      axios.post(`${process.env.VUE_APP_API_BASE_URL}/post/create`, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          }
        })
        .then(() => {
          alert("게시글이 등록되었습니다!");
          this.$router.push("/user/mypage");
        })
        .catch(error => {
          console.error(error);
          alert("게시글 등록에 실패했습니다.");
        });
    }
  }
};
</script>

<style scoped>
.create-post-bg {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.create-post-card {
  max-width: 1200px;
  border-radius: 16px;
}

.header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  border-radius: 8px;
  min-width: 100px;
}

.upload-section {
  background-color: #fafafa;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-section:hover {
  border-color: var(--v-primary-base);
  background-color: #f5f5f5;
}

.upload-placeholder {
  text-align: center;
  padding: 24px;
}

.upload-text {
  color: #666;
  font-size: 1rem;
}

.preview-carousel {
  border-radius: 12px;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}

.content-textarea {
  font-size: 16px;
  flex-grow: 1;
}

.content-textarea :deep(.v-field__input) {
  min-height: 300px !important;
}

.hashtags-section.compact {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 12px;
  margin-top: auto;
}

.hashtag-container-compact {
  max-height: 80px;
  overflow-y: auto;
  padding: 4px;
}

.hashtag-chip {
  margin: 2px;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* 반응형 스타일 */
@media (max-width: 960px) {
  .create-post-card {
    margin: 0;
    border-radius: 0;
  }

  .upload-section {
    height: 300px;
  }
}
</style>
  