<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- loading -->
        <div class="loading-box" v-if="isLoading">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </div>
        <template v-else>
          <!-- count -->
          <div class="search-total">
            <div :class="[currentTab == 'all' ? 'active' : '']" @click="changeTab('all')">All	{{count.all}}</div>
            <div :class="[currentTab == 'community' ? 'active' : '']" @click="changeTab('community')">Communities  {{count.community}}</div>
            <div :class="[currentTab == 'people' ? 'active' : '']" @click="changeTab('people')">People  {{count.people}}</div>
            <div :class="[currentTab == 'post' ? 'active' : '']" @click="changeTab('post')">Post  {{count.post}}</div>
          </div>
          <!-- Community -->
          <template v-if="communities.length>0 && (currentTab== 'all' || currentTab== 'community')">
            <div ref="community" class="title">
              <div class="font20">Communities</div>
              <div v-if="communities.length>4 && currentTab== 'all'" class="more" @click="changeTab('community')">More</div>
            </div>
            <div class="community-list">
              <template v-for="(item,index) in communities">
                <template v-if="currentTab== 'community'">
                  <CommunityItem :item="item" :searchWord="searchWord"/>
                </template>
                <template v-else-if="currentTab == 'all' && index<4">
                  <CommunityItem :item="item" :searchWord="searchWord"/>
                </template>
              </template>
            </div>
            <div class="no-more" v-if="currentTab != 'all' && isEnd.community">No more communities</div>
          </template>
          <!-- People  -->
          <template v-if="users.length>0  && (currentTab== 'all' || currentTab== 'people')">
            <div ref="people" class="title">
              <div class="font20">People</div>
              <div v-if="users.length>3 && currentTab== 'all'" class="more" @click="changeTab('people')">More</div>
            </div>
            <div class="user-list">
              <template v-for="(item,index) in users">
                <template v-if="currentTab== 'people'">
                  <UserItem :item="item" :searchWord="searchWord"/>
                </template>
                <template v-else-if="currentTab== 'all' && index<3">
                  <UserItem :item="item" :searchWord="searchWord"/>
                </template>
              </template>
            </div>
            <div class="no-more" v-if="currentTab != 'all' && isEnd.people">No more people</div>
          </template>
          <!-- Post -->
          <template v-if="posts.length>0  && (currentTab== 'all' || currentTab== 'post')">
            <div ref="post" class="title">
              <div class="font20">Post</div>
              <div v-if="posts.length>3 && currentTab== 'all'" class="more" @click="changeTab('post')">More</div>
            </div>
            <div class="post-list">
              <template v-for="(item,index) in posts">
                <template v-if="currentTab== 'post'">
                  <PostItem :item="item" :searchWord="searchWord" @changeListStatus="changeListStatus(item,$event)"/>
                </template>
                <template v-else-if="currentTab== 'all' && index<3">
                  <PostItem :item="item" :searchWord="searchWord" @changeListStatus="changeListStatus(item,$event)"/>
                </template>
              </template>
            </div>
            <div class="no-more" v-if="currentTab != 'all' && isEnd.post">No more posts</div>
          </template>
          <!-- no-result -->
          <div class="no-result" v-if="$store.state.searchWord && count[currentTab]==0">
            <img src="@/assets/images/common/emoji-null.png"/>
            no results
          </div>
        </template>
      </div>
      <!-- right -->
      <div class="right">
        <!-- About -->
        <About/>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs, watch, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import PostItem from '@/component/post-item.vue';
import UserItem from '@/component/user-item.vue';
import CommunityItem from '@/component/community-item.vue';
import About from '@/component/about.vue';
import loadmore from "@/component/loadmore.vue";
export default {
  components: {
    PostItem,
    CommunityItem,
    UserItem,
    About,
    loadmore
  },
  setup(){
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
      searchWord:"",
      isLoading:false,
      isEnd:{
        community:false,
        post:false,
        people:false,
      },
      page:{
        community:1,
        post:1,
        people:1,
      },
      currentTab:"all",
      communities:[],
      users:[],
      posts:[],
      count:{
        all:0,
        community:0,
        post:0,
        people:0
      },
    })

    const init = () => {
      if(store.state.searchWord){
        state.searchWord = store.state.searchWord;
        getSearch(store.state.searchWord);
      }
    }

    //getSearchList
    watch(
			() => store.state.searchWord,
			() => {
        state.searchWord = store.state.searchWord;
        state.currentTab = "all";
        state.isEnd = {
          community:false,
          post:false,
          people:false,
        };
        state['page'] = {
          community:1,
          post:1,
          people:1,
        };
        getSearch(store.state.searchWord);
			}
		);

    const getSearch = (keyword) => {
      state.isLoading = true; 
      const promise1 = proxy.$axios.community.get_community_list({keyword,page:0,account_id:store.getters.accountId || ''});
      const promise2 = proxy.$axios.post.get_post_list({type: 'hot',keyword,page:0,account_id:store.getters.accountId || ''});
      const promise3 = proxy.$axios.profile.get_user_list({keyword,page:0,account_id:store.getters.accountId || ''});
      Promise.all([promise1, promise2, promise3]).then((resList) => {
        resList.forEach((res,index) => {
          if(res.success){
            switch(index){
              case 0:
                state.count.community = res.count || 0;
                state.communities = res.data;
                break;
              case 1:
                state.count.post = res.count || 0;
                let posts = res.data;
                const postBlockList = JSON.parse(localStorage.getItem("postBlockList")) || [];
                state.posts = posts.filter(post => {
                  return postBlockList.indexOf(post.target_hash) == -1;
                })
                break;
              case 2:
                state.count.people = res.count || 0;
                state.users = res.data;
                break;
              default:
                break;
            }
          }
        })
        state.count.all = state.count.post + state.count.community + state.count.people;
        // state.isEnd = {
        //   community:state.count.community<7,
        //   post:state.count.post<7,
        //   user:state.count.people<7,
        // }
        state.isLoading = false;
      });
    }

    //tab changeTab
    const changeTab = (mode) => {
      state.currentTab = mode;
    }

    //handleScroll
    const handleScroll = async () => {
      if(state.currentTab != 'all' && ((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state['isEnd'][state.currentTab]){
        state.isLoading = true; 
        const keyword = state.searchWord;
        const page = state['page'][state.currentTab];
        switch(state.currentTab){
          case 'community':
            const community = await proxy.$axios.community.get_community_list({keyword,page,account_id:store.getters.accountId || ''});
            state.communities = state.communities.concat(community.data);
            state.isEnd.community = community.data.length == 0 ;
            break;
          case 'post':
            const post = await proxy.$axios.post.get_post_list({type: 'hot',keyword,page,account_id:store.getters.accountId || ''});
            state.posts = state.posts.concat(post.data);
            state.isEnd.post = post.data.length == 0 ;
            break;
          case 'people':
            const user = await proxy.$axios.profile.get_user_list({keyword,page,account_id:store.getters.accountId || ''});
            state.users = state.users.concat(user.data);
            state.isEnd.people = user.data.length == 0 ;
            break;
          default:
            break;
        }
        state['page'][state.currentTab] = state['page'][state.currentTab]+1;
        state.isLoading = false;
      }
    }

    //changeListStatus 
    const changeListStatus = (item,close=false) => {
      state.posts.forEach(i=>{
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

    return {
      ...toRefs(state),
      init,
      changeTab,
      handleScroll,
      changeListStatus
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
    .loading-box{
      min-height:300px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .search-total{
      display:flex;
      flex-wrap:wrap;
      >div{
        margin-right:20px;
        padding:0 20px;
        height: 36px;
        line-height: 34px;
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 40px;
        font-family: D-DINExp;
        font-size: 16px;
        color: rgba(255,255,255,0.5);
        letter-spacing: 0;
        font-weight: 400;
        cursor:pointer;
        &.active,&:hover{
          background: #EBEBEB;
          border-radius: 40px;
          border: 2px solid #EBEBEB;
          color: #111113;
          font-weight: 700;
        }
      }
    }
    .title{
      margin-right:20px;
      margin-top:60px;
      display:flex;
      justify-content:space-between;
      align-items: center;
      .more{
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        padding-right:18px;
        background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
        background-size:14px 14px;
        cursor:pointer;
      }
    }
    .community-list{
      display:flex;
      flex-wrap:wrap;
    }
    .post-list,.user-list{
      margin-right:20px;
      background: #28282D;
      border-radius: 24px;
      padding:0 20px;
      margin-top:20px;
    }

    .no-result{
      margin:160px auto 0;
    }
  }
}
</style>
