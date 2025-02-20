<template>
    <!-- 문자열로 넘길경우에는 '변수명 =' 형태, 그외에는 ':변수명' 형태로 전달 -->
    <RestaurantListComponent
        :isAdmin = "false"
        pageTitle = "가게게목록"
    />
</template>
<script>
import RestaurantListComponent from '@/components/RestaurantListComponent.vue';

export default{
    components:{
        RestaurantListComponent
    }
}

</script>