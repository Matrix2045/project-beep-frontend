<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- Joined -->
        <template v-if="joinedList.length>0">
          <div class="font20">Joined</div>
          <div class="joined-list">
            <template v-for="item in joinedList">
              <router-link :to="'/community-detail/'+item.community_id">
                <div class="joined-item">
                  <img v-if="item.avatar"  class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                  <img v-else  class="avatar" src="@/assets/images/community/default-avatar.png">
                  <div class="name txt-wrap">{{item.name}}</div>
                  <div class="message" v-if="item.unRead">{{item.unRead}}</div>
                </div>
              </router-link>
            </template>
          </div>
        </template>
        <!-- All Communities -->
        <div class="all-communities-title">
          <div class="font20">All Communities</div>
          <div class="filter-menu">
            <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
            <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">New</div>
          </div>
        </div>
        <div class="all-communities" v-if="currentTab && communities[currentTab]['length']>0">
          <template v-for="item in communities[currentTab]">
            <CommunityItem :item="item"/>
          </template>
        </div>

        <div class="no-more" v-if="isEnd">
          <div v-if="communities[currentTab]['length'] == 0" class="no-result">
            <img src="@/assets/images/common/emoji-null.png"/>
            No communities
          </div>
          <template v-else>No more communities</template>
        </div>
      </div>
      <!-- right -->
      <div class="right">
        <!-- Creat Community -->
        <div class="creat-community">
          <div class="font20">Launch a Community</div>
          <div class="intro">The Beta version currently allows only registered creators to launch communities.</div>
          <div class="button-border">
            <a class="button" href="https://0smaupbwvz0.typeform.com/to/BYx9MMTZ?typeform-source=popula.io" target="_blank">Apply</a>
          </div>
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
import CommunityItem from '@/component/community-item.vue';
import About from '@/component/about.vue';
import LoginMask from "@/component/login-mask.vue";
export default {
  components: {
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
      joinedList:[],
      currentTab:"",
      communities:{
        hot:[],
        new:[]
      },
      showLogin:false,
      page:0,
      limit:10,
      isEnd:false,
      isLoading:false,
    });

    const init = async () => {
      if(store.getters.isLogin){
        const res = await proxy.$axios.community.get_joined_community_list({
          account_id:store.getters.accountId,
          page:state.page,
          limit:10000
        });
        if(res.success) {
          const joinedList = res.data;
          for(let i=0;i<joinedList.length;i++){
            joinedList[i]["unRead"] = await initUnreadCount(joinedList[i]['community_id']);
          }
          state.joinedList = joinedList;
        }
      }
      changeTab('hot');
    }

    const initUnreadCount = async (community_id) => {
      let lastPostId = '';
      let commLastPostId = localStorage.getItem("commLastPostId") || '{}';
      commLastPostId = JSON.parse(commLastPostId);
      if(commLastPostId[community_id]){
        lastPostId = commLastPostId[community_id];
      }else if(localStorage.getItem("lastPostId")){
        lastPostId = localStorage.getItem("lastPostId")
      }
      if(lastPostId){
        const resNew = await proxy.$axios.post.get_post_list({
          type: 'new',
          page:0,
          limit:1,
          community_id:community_id,
          last_post_id:lastPostId,
        });
        return resNew.unread_count;
      }
      return 0;
    }

    //changeTab
    const changeTab = async (tab) => {
      // if(state.currentTab == tab) return;
      //reset data
      state.currentTab = tab;
      state.communities[state.currentTab] = [];
      state.page = 0;
      state.isEnd = false;
      //request
      state.communities[state.currentTab] = await getCommunities();
    }

    //getCommunities
    const getCommunities = async () => {
      let res = {};
      state.isLoading = true;
      if(store.getters.isLogin){
        res = await proxy.$axios.community.get_unjoined_community_list({
          account_id:store.getters.accountId,
          type:state.currentTab,
          page:state.page,
          limit:state.limit
        });
      }else{
        res = await proxy.$axios.community.get_community_list({
          type:state.currentTab,
          page:state.page,
          limit:state.limit
        });
      }
      state.isLoading = false;
      if(res.success){
        state.page += 1;
        if(res.data.length==0){
          state.isEnd = true;
        }
        return res.data;
      }
      return [];
    }

    //handleScroll
    const handleScroll = async () => {
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.currentTab){
        const res = await getCommunities();
        state.communities[state.currentTab] = state.communities[state.currentTab].concat(res);
      }
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    return {
      ...toRefs(state),
      init,
      changeTab,
      handleScroll,
      showLoginMask,
      closeLoginMask

    }
  },
  mounted(){
    this.$router.push({query: {}})
    this.init();
    window.addEventListener('scroll',this.handleScroll)
  },
  unmounted(){
    window.removeEventListener('scroll', this.handleScroll);
  },
}
</script>

<style lang="scss" scoped>
.main {
  .left{
    .joined-list{
      display:flex;
      flex-wrap:wrap;
      padding-bottom:60px;
      .joined-item{
        margin-top:20px;
        margin-right:20px;
        padding:0 20px;
        width: 216px;
        height: 80px;
        background: #28282D;
        border-radius: 10px;
        display:flex;
        align-items: center;
        position:relative;
        cursor:pointer;
        .avatar{
          width: 40px;
          height: 40px;
          border-radius: 10px;
          object-fit: cover;
        }
        .name{
          width:124px;
          font-family: D-DINExp-Bold;
          font-size: 18px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          margin-left:12px;
        }
        .message{
          position:absolute;
          top:-4px;
          right:-4px;
          display:flex;
          justify-content:center;
          align-items: center;
          width: 32px;
          height: 20px;
          background: #ED1F5A;
          border-radius: 12px;
          font-family: D-DINExp-Bold;
          font-size: 12px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: center;
        }
      }
    }

    .all-communities-title{
      padding-right:20px;
      height:38px;
      display:flex;
      justify-content:space-between;
      align-items: center;
      .filter-menu{
        margin-top:0;
      }
    }
    .all-communities{
      display:flex;
      flex-wrap:wrap;
      padding-bottom:60px;
    }
  }
  .right{
    .creat-community{
      width: 320px;
      background: #000000;
      border-radius: 24px;
      padding:20px 20px 30px;
      margin-bottom:20px;
      .intro{
        margin-top:12px;
        opacity: 0.5;
        font-family: D-DINExp;
        font-size: 16px;
        color: #FFFFFF;
        letter-spacing: 0;
        // text-align: justify;
        line-height: 24px;
        font-weight: 400;
      }
      .button-border{
        margin:30px auto 0;
      }
    }
  }
}
</style>
