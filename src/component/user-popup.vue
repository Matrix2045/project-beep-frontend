<template>
  <div class="pop-box pop-user">
    <div class="loading-box" v-if="isLoading">
      <img class="white-loading" src="@/assets/images/common/loading.png"/>
    </div>
    <template v-else-if="user.data">
      <!-- follow -->
      <div class="follow-button" v-if="user.account_id !== $store.getters.accountId && !hideBtn">
        <FollowButton 
          :isFollow="user.data.is_follow" 
          :accountId="user.account_id" 
          :background="'#000'" 
          :from="'popup'"
          @follow = "follow"
          @login = "login"
        />
      </div>
      <router-link :to="'/user-profile/'+user.account_id">
        <img v-if="user.avatar" class="avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
        <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
        <div class="username  txt-wrap">{{user.name || user.account_id}}</div>
        <div class="account  txt-wrap">{{user.account_id}}</div>
        <div class="total">
          <div class="total-item"><span>{{user.data.follows}}</span>Followers</div>
          <div class="total-item"><span>{{user.data.following}}</span>Following</div>
          <div class="total-item"><span>{{user.data.post_count}}</span>Posts</div>
        </div>
        <div class="bio txt-wrap2">{{user.bio}}</div>
        <div class="comunity-joined" v-if="joinedCommunities && joinedCommunities.length>0">
          <div class="community-item" v-for="item in joinedCommunities">
            <router-link :to="'/community-detail/'+item.community_id">
              <img v-if="item.avatar"  class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
              <img v-else  class="avatar" src="@/assets/images/community/default-avatar.png">
              <div class="name txt-wrap">{{item.name}}</div>
            </router-link>
          </div>
        </div>
      </router-link>
    </template>
  </div>

</template>

<script>
  import { reactive, toRefs , watch, getCurrentInstance } from "vue";
  import { useRouter } from "vue-router";
  import { useStore } from 'vuex';
  import { getTimer} from "@/utils/util.js";
  import FollowButton from "@/component/follow-button.vue";
  export default {
    components: {
      FollowButton
    },
    props:{
      account:{
        type:String,
        value:""
      },
      hideBtn:{
        type:Boolean,
        value:false
      },
    },
    setup(props,{ emit }) {
      const router = useRouter();
      const store = useStore();
      const { proxy } = getCurrentInstance();

      //state
      const state = reactive({
        isLoading:false,
        user:{},
        joinedCommunities:[]
      })

      const init = async () => {
        if(props.account){
          state.isLoading = true;
          //createUser
          const res = await proxy.$axios.profile.get_user_info({
            account_id:props.account,
            current_account_id: store.getters.accountId || ''
          });
          if(res.success){
            state.user = res.data;
            state.joinedCommunities = state.user.data.joined_communities.slice(0,3)
          }
          state.isLoading = false;
        }
      }

      //follow
      const follow = (res) => {
        state.user.data.follows = res.isFollow ? state.user.data.follows + 1 : state.user.data.follows -1;
      }
      //login
      const login = () => {
        emit("login");
      }

      return {
        ...toRefs(state),
        init,
        follow,
        login,
        
      }
    },
    mounted(){
      this.init();
    }
  }
</script>

<style lang="scss" scoped>
  .pop-user{
    display:block;
    width:460px;
    padding:20px 0 20px 20px;
    position:relative;
    transform:translateX(-1px);
    cursor:pointer;
    .loading-box{
      min-height:300px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .avatar{
      width: 80px;
      height: 80px;
      border-radius:50%;
      object-fit: cover;
    }
    .follow-button{
      position:absolute;
      top:42px;
      right:20px;
    }
    .username{
      margin-top:20px;
      line-height: 20px;
      font-family: D-DINExp-Bold;
      font-size: 18px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      padding-right:20px;
    }
    .account{
      margin-top:4px;
      font-family: D-DINExp;
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0;
      font-weight: 400;
      padding-right:20px;
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
    .bio{
      margin-top:20px;
      padding-right:20px;
      font-family: D-DINExp;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: justify;
      line-height: 22px;
      font-weight: 400;
    }
    .comunity-joined{
      margin-top:20px;
      display:flex;
      .community-item{
        margin-right:20px;
        width: 126px;
        height: 126px;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 16px;
        a{
          width: 126px;
          height: 126px;
          display:flex;
          flex-direction:column;
          align-items: center;
          justify-content:center;
        }
        .avatar{
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
        }
        .name{
          max-width:110px;
          margin-top:12px;
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
</style>