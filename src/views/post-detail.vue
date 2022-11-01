<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <div class="post-detail">
          <!-- Community -->
          <div class="Community-info" v-if="postCommunity.data">
            <router-link :to="'/community-detail/'+postCommunity.community_id">
              <img v-if="postCommunity.avatar" class="avatar" :src="$store.getters.getAwsImg(postCommunity.avatar)" @error.once="$event.target.src=postCommunity.avatar"/>
              <img v-else class="avatar" src="@/assets/images/community/default-avatar.png"/>
            </router-link>
            <div class="info">
              <router-link :to="'/community-detail/'+postCommunity.community_id">
                <div class="name">{{postCommunity.name}}</div>
              </router-link>
              <router-link :to="'/user-profile/'+postCommunity.account_id">
                <div class="creator">@{{postCommunity.account_id}}</div>
              </router-link>
              <div class="total">
                <div class="total-item"><span>{{postCommunity.data.members_count}}</span>Members</div>
                <div class="total-item"><span>{{postCommunity.data.post_count}}</span>Posts</div>
              </div>
            </div>
            <template v-if="postCommunity.community_id != $store.state.nearConfig.MAIN_CONTRACT && postCommunity.account_id != $store.getters.accountId">
              <div v-if="postCommunity.data.is_join" class="mini-button-border join-button joined" @click="changeJoinCommunity()">
                <div class="mini-button">  
                  <span class="static-text">Joined</span>
                  <span class="hover-text">Quit</span>
                </div>
              </div>
              <div v-else class="mini-button-border join-button" @click="changeJoinCommunity()">
                <div class="mini-button">  Join  </div>
              </div>
          </template>
          </div>
          <!-- PostItem  -->
          <template v-if="postDetail.target_hash">
            <PostItem 
              :item="postDetail" 
              :commentC="commentCount" 
              :from="'detail'" 
              :unJoinCommunity="!postCommunity.data.is_join"
              @changeAccess="changeAccess()"
              @focus="focusComment=!focusComment"
            />
          </template>
        </div>
        <!-- Comment  -->
        <template v-if="postCommunity.data && postDetail.type!='encrypt' || isAccess || $store.getters.accountId==postDetail.accountId">
          <div style="margin-top:20px;"></div>
          <Comment 
            :targetHash="$route.params.id" 
            :parentAccount="postDetail.account_id"
            :replyUser="userDetail.name || postDetail.account_id"
            :hierarchies="[]"
            :communityId="postDetail.receiver_id" 
            :unJoinCommunity="!postCommunity.data.is_join"
            :postType="postDetail.type"
            :focus="focusComment"
            @addNewComment="addNewComment"
          />

          <!-- All Comments -->
          <div class="all-comments-title">
            <div class="font20">Comments({{formatCount(commentCount)}})</div>
            <div class="filter-menu">
              <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
              <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">New</div>
            </div>
          </div>
          <div class="all-comments" ref="commentList">
            <template v-for="(item,index) in comments[currentTab]" :key="item.create_at">
              <template v-if="item.isNewComment">
                <CommentItemNew 
                :community="postCommunity" 
                :post="postDetail" 
                :item="item" 
                @comment="comment" 
                @changeListStatus="changeListStatus(item,$event)"/>
              </template>
              <template v-else-if="(item.target_hash == defaultCommentHash && index == 0) || item.target_hash != defaultCommentHash">
                <CommentItem 
                :community="postCommunity" 
                :post="postDetail" 
                :item="item" 
                :unJoinCommunity="!postCommunity.data.is_join"
                @comment="comment" 
                @changeListStatus="changeListStatus(item,$event)"/>
              </template>
            </template>
          </div>

          <!-- loading -->
          <div class="loading-box" v-if="isLoading">
            <img class="white-loading" src="@/assets/images/common/loading.png"/>
          </div>
          <div class="no-more" v-else-if="isEnd">
            <div v-if="commentCount == 0" class="no-result">
              <img src="@/assets/images/common/emoji-null.png"/>
              No comments
            </div>
            <template v-else>No more comments</template>
          </div>

        </template>
      </div>


      <!-- right -->
      <div class="right">
        <!-- User Info -->
        <div class="creator-info" v-if="userDetail.account_id" >
          <!-- avatar-follow -->
          <div>
            <div class="avatar-follow">
              <router-link :to="'/user-profile/'+userDetail.account_id">
                <img v-if="userDetail.avatar" class="avatar" :src="$store.getters.getAwsImg(userDetail.avatar)" @error.once="$event.target.src=userDetail.avatar"/>
                <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
              </router-link>
              <!-- follow -->
              <div class="follow-button" v-if="userDetail.account_id !== $store.getters.accountId">
                <FollowButton 
                  :isFollow="userDetail.data.is_follow" 
                  :accountId="userDetail.account_id" 
                  :background="'#000'"
                  @follow = "follow"
                  :position="'right'"
                />
              </div>
            </div>

            <!-- name-account -->
            <router-link :to="'/user-profile/'+userDetail.account_id">
              <div class="name txt-wrap">{{userDetail.name}}</div>
              <div class="account txt-wrap">{{userDetail.account_id}}</div>
            </router-link>
          </div>
          
          <!-- account-total -->
          <div class="total">
            <div class="total-item"><span>{{userDetail.data.follows}}</span>Followers</div>
            <div class="total-item"><span>{{userDetail.data.following}}</span>Following</div>
            <div class="total-item"><span>{{userDetail.data.post_count}}</span>Posts</div>
          </div>

          <!-- bio -->
          <div class="bio txt-wrap2">{{userDetail.bio}}</div>

          <!-- communities -->
          <div class="communities" v-if="joinedCommunities.length>0">
            <div class="community-item" v-for="item in joinedCommunities">
              <router-link :to="'/community-detail/'+item.community_id">
                <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar"/>
                <img v-else class="avatar" src="@/assets/images/community/default-avatar.png">
                <div class="name txt-wrap">{{item.name}}</div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance} from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
import CommunityContract from "@/contract/CommunityContract";
import { formatCount} from "@/utils/util.js";
import PostItem from '@/component/post-item.vue';
import Comment from '@/component/comment.vue';
import CommentItem from '@/component/comment-item.vue';
import CommentItemNew from '@/component/comment-item-new.vue';
import LoginMask from "@/component/login-mask.vue";
import FollowButton from "@/component/follow-button.vue";
export default {
  components: {
    PostItem,
    Comment,
    CommentItem,
    CommentItemNew,
    LoginMask,
    FollowButton
  },
  setup(){
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
      postCommunity:{
        data:{
          is_join:true
        }
      },
      postDetail:{},
      userDetail:{},
      joinedCommunities:[],
      isAccess:false,
      //comment
      currentTab:"",
      comments:{
        hot:[],
        new:[]
      },
      commentCount:0,
      defaultCommentHash:'',
      page:0,
      limit:10,
      isEnd:false,
      isLoading:false,
      //other
      showLogin:false,
      focusComment:false
    })

    const commentList = ref()
    const init = async () => {
      //detail
      const res = await proxy.$axios.post.get_post_detail({
        post_id:route.params.id,
        account_id:store.getters.accountId || ''
      });
      if(res.success){
        state.postCommunity = res.data.post_community;
        state.postDetail = res.data.post;
        state.userDetail = res.data.user;
        state.joinedCommunities = res.data.joined_communities.slice(0,3);
      }
      //comment
      if(state.postDetail.type!='encrypt' || state.isAccess || store.getters.accountId==state.postDetail.accountId){
        changeTab('hot');
        if(route.query.comment){
          await initComment();
          document.body.scrollTop = document.documentElement.scrollTop = commentList.value.getBoundingClientRect().top - 100;
        }
      }
    };

    const initComment = async() => {
      //detail
      const res = await proxy.$axios.comment.get_comment_detail({
        comment_id:route.query.comment,
        account_id:store.getters.accountId || ''
      });
      if(res.success){
        if(res.data.length>1){  //level 2
          const item = {
            ...res.data[1],
            child:{...res.data[0]},
            isShare:true,
          };
          state.defaultCommentHash = res.data[1]['target_hash'];
          state.comments[state.currentTab].unshift(item);
        }else{  //level 1
          const item = {
            ...res.data[0],
            isShare:true,
          };
          state.defaultCommentHash = res.data[0]['target_hash'];
          state.comments[state.currentTab].unshift(item);
        }
      }
    }

    const changeAccess = async () => {
      state.isAccess=true;
      changeTab('hot');
      if(route.query.comment){
        await initComment();
        document.body.scrollTop = document.documentElement.scrollTop = commentList.value.getBoundingClientRect().top - 100;
      }
    }

    //changeJoinCommunity
    const changeJoinCommunity = async () => {
      if(!store.getters.isLogin){
        state.showLogin = true
      }else{
        const communityContract = await CommunityContract.new(state.postDetail.receiver_id);
        const result = state.postCommunity.data.is_join ? await communityContract.quit({}) : await communityContract.join({});
        if (result.status == 'pending' || result.status == 'success') {
          state.postCommunity.data.is_join = !state.postCommunity.data.is_join;
        } else if (result.status == 'fail') {
          const message = state.postCommunity.data.is_join ? 'Quit Failed' : 'Join Failed';
          proxy.$Message({
            message,
            type: "error",
          });
        }
      }
    }

    const follow = (res) => {
      state.userDetail.data.follows = res.isFollow ? state.userDetail.data.follows + 1 : state.userDetail.data.follows -1;
    }

    //comment
    const addNewComment = async (item) => {
      await changeTab('new');
      state.comments['new'].unshift(item);
      state.commentCount += 1;
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    //changeTab
    const changeTab = async (tab) => {
      if(state.currentTab == tab) return;
      state.defaultCommentHash = '';
      //reset data
      state.currentTab = tab;
      state.comments[state.currentTab] = [];
      state.page = 0;
      state.isEnd = false;
      //request
      state.comments[state.currentTab] = state.comments[state.currentTab].concat(await getComments());
    }

    //getComments
    const getComments = async () => {
      state.isLoading = true;
      const params = {
        post_id:route.params.id,
        type: state.currentTab,
        limit:state.limit,
        account_id:store.getters.accountId || ''
      }
      if(state.currentTab=='new'){
        params.comment_id = state.comments[state.currentTab].length>0 ? state.comments[state.currentTab][state.comments[state.currentTab].length-1]['_id'] : null
      }else{
        params.page = state.page
      }

      const res = await proxy.$axios.comment.get_comment_list(params);
      state.isLoading = false;
      if(res.success){
        if(res.data.length==0){
          state.isEnd = true;
        }
        if(state.commentCount ==0 ){
          state.commentCount = res.count;
        }
        state.page += 1;
        return res.data;
      }
      return [];
    }

    //handleScroll
    const handleScroll = async () => {
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.currentTab){
        const res = await getComments();
        state.comments[state.currentTab] = state.comments[state.currentTab].concat(res);
      }
    }

    const changeListStatus = (item,close=false) => {
      state.comments[state.currentTab].forEach(i=>{
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
      commentList,
      init,
      changeAccess,
      changeJoinCommunity,
      follow,
      addNewComment,
      showLoginMask,
      closeLoginMask,
      changeTab,
      handleScroll,
      changeListStatus,
      formatCount
    }


  },
  mounted(){
    if(this.$route.query.comment){
      this.$router.push({query: {comment:this.$route.query.comment}});
    }else{
      this.$router.push({query: {}});
    }
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
    .post-detail{
      background: #28282D;
      border-radius: 24px;
      padding:0 20px;
      .Community-info{
        background: #28282D;
        padding:20px 0;
        display:flex;
        align-items: center;
        position: relative;
        .avatar{
          width: 90px;
          height: 90px;
          border-radius: 16px;
          cursor:pointer;
          object-fit: cover;
        }
        .info{
          margin-left:30px;
          .name{
            line-height: 22px;
            font-family: D-DINExp-Bold;
            font-size: 20px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            cursor:pointer;
          }
          .creator{
            margin-top:8px;
            opacity: 0.5;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 400;
            cursor:pointer;
            line-height: 16px;
          }
          .total{
            margin-top:20px;
            display:flex; 
            .total-item{
              margin-right:30px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              line-height:18px;
              span{
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 700;
                margin-right:4px;
              }
            }
          }
        }
        .join-button{
          position: absolute;
          top:47px;
          right:20px;
          &.joined{
            background: rgba(255,255,255,0.2);
            &::after{
              display: none;
            }
            .hover-text{
              display: none;
            }
            &:hover{
              background: rgba(255,104,104,0.2);
              .mini-button{
                color: #FF6868;
              }
              .static-text{
                display: none;
              }
              .hover-text{
                display: block;
              }
            }
          }
        }
      }
    }

    .all-comments{
      margin-top:20px;
      padding: 0;
      background: #28282D;
      border-radius: 24px;
    }
    .loading-box{
      height:50px;
      display:flex;
      align-items: center;
      justify-content:center;
    }
  }
  .right{
    .creator-info{
      margin-bottom:20px;
      padding:20px;
      background: #000000;
      border-radius: 24px;
      .avatar-follow{
        display:flex;
        justify-content:space-between;
        align-items:center;
        .avatar{
          width: 80px;
          height: 80px;
          border-radius:50%;
          cursor:pointer;
          object-fit: cover;
        }
        .follow-button{
          position: relative;
        }
      }
      .name{
        margin-top:20px;
        font-family: D-DINExp-Bold;
        font-size: 18px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        cursor:pointer;
      }
      .account{
        margin-top:4px;
        opacity: 0.5;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        cursor:pointer;
      }
      .total{
        margin-top:20px;
        display:flex; 
        justify-content:space-between;
        .total-item{
          margin-right:30px;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          line-height:18px;
          span{
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            display:block;
            margin-bottom:4px;
            line-height:18px;
          }
        }
      }
      .bio{
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: justify;
        line-height: 22px;
        font-weight: 400;
        margin-top:20px;
      }
      .communities{
        margin-top:20px;
        padding:20px;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 16px;
        display:flex;
        
        .community-item{
          width:60px;
          margin-right:30px;
          cursor:pointer;
          &:last-child{
            margin-right:0;
          }
          a{
            display:flex;
            flex-direction: column;
            align-items: center;
          }
          .avatar{
            width:40px;
            height:40px;
            border-radius: 8px;
            object-fit: cover;
          }
          .name{
            margin-top:12px;
            width:60px;
            line-height:16px;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
          }
        }
      }
    }
  }
}

.all-comments-title{
  margin-top:60px;
  height:38px;
  display:flex;
  justify-content:space-between;
  align-items: center;
  .filter-menu{
    margin-top:0;
  }
}

</style>
