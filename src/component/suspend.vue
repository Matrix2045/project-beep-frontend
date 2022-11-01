<template>
  <div class="suspend">
    <div id="backTop" class="back-top" @click="backTop()"></div>
    <!-- <div class="button-box" @click="popUp()">
      <div class="button">
        <img src="@/assets/images/post/icon-post.png"/>
      </div>
    </div>
    <div class="elastic-layer suspend-elastic-layer" v-if="showLayer" @click.self="closeLayer()">
      <div class="edit-button close" @click="closeLayer()"></div>
      <Post :location="'suspend'" @addNewPost="addNewPost"/>
    </div> -->
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
  import { reactive,toRefs } from "vue";
  import { useStore } from 'vuex';
  import { useRouter } from "vue-router";
  import LoginMask from "@/component/login-mask.vue";
  import Post from '@/component/post.vue';
  export default {
    components: {
      Post,
      LoginMask
    },
    props:{},
    setup(props,{emit}){
      const store = useStore();
      const router = useRouter();

      //state
      const state = reactive({
        showLogin:false,
        showLayer:false
      })

      //backTop
      const backTop = () => {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      }
      //pop up
      const popUp = () => {
        if(!store.getters.isLogin){
          state.showLogin = true;
        }else{
          state.showLayer = true;
          document.getElementsByTagName('body')[0].classList.add("fixed");
        }
      }

      const closeLayer = () => {
        state.showLayer=false;
        document.getElementsByTagName('body')[0].classList.remove("fixed")
      }
      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      //addNewPost
      const addNewPost = (item) => {
        state.showLayer=false;
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit("addNewPost",item);
      }

      return {
        ...toRefs(state),
        backTop,
        popUp,
        closeLayer,
        showLoginMask,
        closeLoginMask,
        addNewPost,
      }
    },
    mounted(){
      window.addEventListener('scroll',()=>{
        if(document.getElementById('backTop')){
          if(document.documentElement.scrollTop > window.innerHeight){
            document.getElementById('backTop').style.display = 'block';
          }else{
            document.getElementById('backTop').style.display = 'none';
          }
        }
      })
    }
  };
</script>

<style lang="scss">
  
</style>
