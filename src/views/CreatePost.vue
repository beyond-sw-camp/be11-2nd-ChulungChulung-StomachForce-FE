<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="text-h5">게시글 작성</v-card-title>
            <v-card-text>
              <v-form ref="form">
                <!-- 게시글 내용 입력 (해시태그는 # 입력) -->
                <v-textarea
                  v-model="content"
                  label="게시글 내용 (해시태그는 # 입력)"
                  outlined
                  rows="5"
                  class="mb-4"
                ></v-textarea>
                
                <!-- 추출된 해시태그들을 칩으로 표시 (해시 기호 없이) -->
                <v-chip-group multiple column class="mb-4">
                  <v-chip
                    v-for="(tag, index) in plainHashtags"
                    :key="index"
                    close
                    @click:close="removeHashtag(tag)"
                  >
                    {{ tag }}
                  </v-chip>
                </v-chip-group>
                
                <!-- 이미지 업로드 (다중 선택 가능) -->
                <v-file-input
                  v-model="images"
                  label="게시글 사진들"
                  multiple
                  show-size
                  outlined
                  class="mb-4"
                ></v-file-input>
                
                <!-- 게시글 등록 버튼 -->
                <v-btn color="primary" block @click="submitPost">
                  등록
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  export default {
    data() {
      return {
        content: "",
        images: []
      };
    },
    computed: {
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
  .mb-4 {
    margin-bottom: 16px;
  }
  </style>
  