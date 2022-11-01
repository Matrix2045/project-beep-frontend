<template>
  <div :class="
    {
      'g_model_light': $store.state.theme === 'light',
      'g_model_black': $store.state.theme === 'black',
    }
  ">
    <router-view></router-view>
  </div>
</template>

<script>
import { watch } from "vue";
import { useStore } from "vuex";
import theme from "./utils/theme.js";
import "./assets/theme/input.scss";

export default {
  setup() {
    const store = useStore();
    let model = localStorage.getItem("mvp_theme_model");
    if(model) {
      store.commit("setTheme", model);
    }
    
    watch(
      () => store.state.theme,
      (newVal) => {
        localStorage.setItem("mvp_theme_model", newVal);
        theme[newVal]();
      },
      {
        immediate: true,
      }
    );
  },
};
</script>

<style lang="scss">
@import "./styles/common.scss";
html,
body {
  height: 100%;
}

body {
  margin: 0;
  overflow-y: scroll;
  overflow-x: hidden;
}


#app,
textarea {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  resize:none;
}



.g_model_light {
  div {
    color: #333;
  }
  .post-show-list-box {
    .item {
      background: #d8d8d8 !important;
    }
  }
  .theme-btn-img.black {
    opacity: 0;
  }
}

.g_model_black {
  .post-show-list-box {
    .item {
      background: #262b34;
    }
  }
  .theme-btn-img.light {
    opacity: 0;
  }
}
</style>
