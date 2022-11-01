<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- Post -->
        <Post :location="'explore'" @addNewPost="addNewPost"/>
        <!-- PostItem  -->
        <div class="filter-menu">
          <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
          <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">
            New
            <div class="unread-count" v-if="postCount.new">{{postCount.new}}</div>
          </div>
          <div v-if="$store.getters.isLogin" :class="['filter-menu-item',currentTab == 'follow' ? 'active' : '']" @click="changeTab('follow')">
            Follow
            <div class="unread-count" v-if="postCount.follow">{{postCount.follow}}</div>
          </div>
        </div>

        <div class="post-list">
          <template v-for="item in postList[currentTab]" :key="item.create_at">
            <template v-if="item.isNewPost">
              <PostItemNew :item="item" @changeListStatus="changeListStatus(item,$event)"/>
            </template>
            <template v-else>
              <PostItem :item="item" :from="'explore'"  @changeListStatus="changeListStatus(item,$event)"/>
            </template>
          </template>
        </div>

        <div class="loading-box" v-if="isLoading">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </div>
        <div class="no-more" v-else-if="isEnd">
          <div v-if="postList[currentTab]['length'] == 0" class="no-result">
            <img src="@/assets/images/common/emoji-null.png"/>
            No posts
          </div>
          <template v-else>No more posts</template>
        </div>
      </div>
      <!-- right -->
      <div class="right">
        <!-- New Communities -->
        <div class="font20">New Communities</div>
        <div class="new-communities">
          <template v-for="item in communities">
            <CommunityItem :item="item"/>
          </template>
          <router-link :to="'/communities'">
            <div class="button-border all-communities-button">
              <div class="button">All Communities</div>
            </div>
          </router-link>
        </div>
        <!-- About -->
        <About/>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>

</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import Post from '@/component/post.vue';
import PostItem from '@/component/post-item.vue';
import PostItemNew from '@/component/post-item-new.vue';
import CommunityItem from '@/component/community-item.vue';
import About from '@/component/about.vue';
import LoginMask from "@/component/login-mask.vue";
import axios from 'axios';
export default {
  components: {
    Post,
    PostItem,
    PostItemNew,
    CommunityItem,
    About,
    LoginMask,
  },
  setup(){
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
      currentTab:"",
      postList:{
        hot:[],
        new:[],
        follow:[]
      },
      postCount:{
        hot:0,
        new:0,
        follow:0
      },
      page:0,
      limit:10,
      isEnd:false,
      isLoading:false,
      communities:[],
    });

    const init = () => {
      getCommunities();
      changeTab('hot');

      //unReadCount
      initUnreadCount();
    }

    //getCommunities
    const getCommunities = async () => {
      const res = await proxy.$axios.community.get_community_list({
        type:'new',
        page:0,
        limit:3,
        account_id:store.getters.accountId || ''
      });
      if(res.success){
        state.communities =  res.data;
      }
    }

    //changeTab
    const changeTab = async (tab) => {
      // if(state.isLoading) return;
      if(state.currentTab == tab) return;
      //reset data
      state.currentTab = tab;
      state.postList[state.currentTab] = [];
      state.page = 0;
      state.isEnd = false;
      state.postCount[state.currentTab] = 0;
      //request
      const res = await getPosts();
      state.postList[state.currentTab] = res.data;
    }

    //getPosts
    let CancelToken = axios.CancelToken;
    const getPosts = async () => {
      if(state.cancel){
        state.cancel();
      }
      const cancelToken = new CancelToken((c) => {
        state.cancel = c;
      })
      state.isLoading = true;
      const res = await proxy.$axios.post.get_post_list({
        type: state.currentTab,
        page:state.page,
        limit:state.limit,
        account_id:store.getters.accountId || ''
      },cancelToken);
      state.isLoading = false;
      if(res.success){
        if(state.page==0 && state.currentTab=='new' && res.data.length>0){
          localStorage.setItem("lastPostId",res['data'][0]['target_hash']);
          localStorage.removeItem("commLastPostId");
        }
        if(res.data.length==0){
          state.isEnd = true;
        }
        state.page += 1;
        return res;
      }
      return {
        data:[],
        count:0
      };
    }

    //handleScroll
    const handleScroll = async () => {
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd){
        const res = await getPosts();
        let result = [];
        if(state.page>1 && state.currentTab=='new' && res.data.length>0){  //deduplication
          const checkList = state.postList['new'].slice(-Math.min(res.data.length,state.postList['new'].length));
          const checkListIds = []
          checkList.forEach(checkItem=>{
            checkListIds.push(checkItem.target_hash);
          })
          res.data.forEach(item=>{
            if(checkListIds.indexOf(item.target_hash) == -1){
              result.push(item);
            }
          })
        }else{
          result = res.data;
        }
        state.postList[state.currentTab] = state.postList[state.currentTab].concat(result);
      }
    }

    //unread post count
    const initUnreadCount = async () => {
      const lastPostId = localStorage.getItem("lastPostId") || '';
      const resNew = await proxy.$axios.post.get_post_list({
        type: 'new',
        page:0,
        limit:10,
        last_post_id:lastPostId,
      });
      if(lastPostId){
        // const resFollow = await proxy.$axios.post.get_post_list({
        //   type: 'follow',
        //   page:0,
        //   limit:10,
        //   lastPostId:lastPostId,
        // });
        state.postCount['new'] = resNew.unread_count;
        // state.postCount['follow'] = resFollow.unread_count;
      }
      if(resNew.data && resNew.data.length>0){
        localStorage.setItem("lastPostId",resNew['data'][0]['target_hash']);
        localStorage.removeItem("commLastPostId");
      }
    }

    //changeListStatus 
    const changeListStatus = (item,close=false) => {
      state.postList[state.currentTab].forEach(i=>{
        if(i==item){
          if(!close){
            i.isComment = true;
          }else{
            i.isComment = false;
          }
        }else{
          i.toggleState = i.toggleState ? !i.toggleState : true;
          i.isComment = false;
        }
      })
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    //addNewPost
    const addNewPost = async (item) => {
      await changeTab('new');
      state.postList['new'].unshift(item);
    }

    return {
      ...toRefs(state),
      init,
      changeTab,
      handleScroll,
      changeListStatus,
      showLoginMask,
      closeLoginMask,
      addNewPost
    }


  },
  mounted(){
    this.$router.push({query: {}});
    this.init();
    window.addEventListener('scroll',this.handleScroll);
  },
  unmounted(){
    window.removeEventListener('scroll', this.handleScroll);
  },
}
</script>

<style lang="scss" scoped>
.main {
  .left{
    padding-right:20px;
    .post-list{
      background: #28282D;
      border-radius: 24px;
      padding:0 20px;
      margin-top:20px;
    }
    .loading-box{
      width:690px;
      margin-top:20px;
      min-height:100px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
  }
  .right{
    .new-communities{
      .community-item{
        width:320px;
      }
      .all-communities-button{
        margin:30px auto 60px;
      }
    }
  }
}
</style>
