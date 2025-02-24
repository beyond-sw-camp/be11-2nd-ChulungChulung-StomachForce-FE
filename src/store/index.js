import { createStore } from 'vuex';
import restaurant from './restaurant'; // ✅ restaurant 모듈 import (restaurantRouter 아님!)

export default createStore({
  modules: {
    restaurant, // ✅ restaurant 모듈 추가
  }
});