<template>
  
  <div v-if="detail" :class="['community-item','community-item-'+from]">
    <router-link :to="'/community-detail/'+detail.community_id">
      <img v-if="detail.cover" class="cover" :src="$store.getters.getAwsImg(detail.cover)" @error.once="$event.target.src=detail.cover">
      <img v-else class="cover" src="@/assets/images/community/bg-small.png">
      <div class="info">
        <div class="avatar-border">
          <img v-if="detail.avatar"  class="avatar" :src="$store.getters.getAwsImg(detail.avatar)" @error.once="$event.target.src=detail.avatar">
          <img v-else  class="avatar" src="@/assets/images/community/default-avatar.png">
        </div>
        <div class="item-token item-token-multiple3">
          <!--
          <img class="token-icon token-icon0" src="@/assets/images/test/token_icon1.png"/>
          <img class="token-icon token-icon1" src="@/assets/images/test/token_icon2.png"/>
          <img class="token-icon token-icon2" src="@/assets/images/test/token_icon3.png"/>
          -->
        </div>
        <div class="name txt-wrap" v-html="name"></div>
        <!--createUser-->
        <div class="creator txt-wrap" v-if="from=='popup' && detail.data.create_user">@{{detail.data.create_user.name || detail.data.create_user.account_id}}</div>
        <div class="creator txt-wrap" v-else-if="from=='popup'">@{{detail.account_id}}</div>
        <el-popover v-else placement="bottom" :fallback-placements="[ 'top']"  trigger="hover" @show="showCreateUser=true" @hide="showCreateUser=false">
          <template #reference>
            <router-link :to="'/user-profile/'+detail.account_id">
              <div class="creator txt-wrap">@{{detail.account_id}}</div>
            </router-link>
          </template>
          <template v-if="showCreateUser">
            <UserPopup :account="detail.account_id" @login="showLogin=true"/>
          </template>
        </el-popover>

        <div class="total">
          <div class="total-item"><span>{{detail.data.members_count}}</span>Members</div>
          <div class="total-item"><span>{{detail.data.post_count}}</span>Posts</div>
        </div>
        <div class="bio txt-wrap2">{{detail.info}}</div>
      </div>
    </router-link>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
  import { reactive, toRefs , onMounted, computed, watch, getCurrentInstance } from "vue";
  import { useRouter } from "vue-router";
  import { useStore } from 'vuex';
  import UserPopup from '@/component/user-popup.vue';
  import LoginMask from "@/component/login-mask.vue";
  export default {
    props:{
      from:{
        type:String,
        value:""
      },
      item:{
        type:Object,
        value:{}
      },
      searchWord:{
        type:String,
        value:""
      },
    },
    components: {
      LoginMask,
      UserPopup,
    },
    setup(props,{ emit }) {
      const store = useStore();
      const router = useRouter();
      const { proxy } = getCurrentInstance();

      const state = reactive({
        detail:"",
        showLogin:false,
        showCreateUser:false,
      })

      const name = computed(() => {
        if(props.searchWord){
          let name = ""
          const reg = RegExp(props.searchWord,"ig");
          name = state.detail.name.replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`)
          return name;
        }else{
          return state.detail.name;
        }
      })

      const init = async () => {
        if(props.item.data){
          state.detail = props.item;
        }else{
          const res = await proxy.$axios.community.get_community_detail({
            account_id:store.getters.accountId || "",
            community_id:props.item.community_id,
          });
          if(res.success) {
            state.detail = res.data;
          }
        }
        // if(props.searchWord){
        //   const reg = RegExp(props.searchWord,"ig");
        //   state.detail.name = state.detail.name.replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`)
        // }
      };

      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      return {
        ...toRefs(state),
        name,
        init,
        showLoginMask,
        closeLoginMask,

      }
    },
    mounted(){
      this.init();
    }
  }
  
</script>

<style lang="scss" scoped>
  .community-item{
    margin-top:20px;
    margin-right:20px;
    width: 335px;
    max-width:100%;
    height: 392px;
    background: #28282D;
    border-radius: 24px;
    overflow: hidden;
    position:relative;
    cursor:pointer;
    &.community-item-popup{
      margin-top:0;
      background: #000000;
      transform:translateX(-1px);
      .avatar-border{
        background: #000000;
      }
    }
    .cover{
      width: 100%;
      height: 160px;
      object-fit: cover;
    }
    .avatar-border{
      width: 88px;
      height: 88px;
      background:#28282D;
      border-radius: 20px;
      position:absolute;
      top:126px;
      left:16px;
      display:flex;
      align-items: center;
      justify-content:center;
      .avatar{
        width:80px;
        height:80px;
        border-radius: 16px;
        object-fit: cover;
      }
    }
    .info{
      padding:20px;
      .item-token{
        height:30px;
        display:flex;
        justify-content:end;
        cursor:pointer;
        .token-icon{
          width: 30px;
          height: 30px;
          border-radius:50%;
        }
        .token-symbol{
          margin-left:10px;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
        }
        &.item-token-multiple2{
          .token-icon0{
            position:relative;
            left:10px;
            z-index:3;
          }
        }
        &.item-token-multiple3{
          .token-icon0{
            position:relative;
            left:20px;
            z-index:3;
          }
          .token-icon1{
            position:relative;
            left:10px;
            z-index:2;
          }
        }
      }
      .name{
        font-family: D-DINExp-Bold;
        font-size: 18px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        margin-top:16px;
        line-height: 20px;
      }
      .creator{
        display: inline-block;
        max-width:100%;
        margin-top:4px;
        opacity: 0.5;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        height: 18px;
      }
      .total{
        margin-top:20px;
        display:flex; 
        height: 17px;
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
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: justify;
        line-height: 22px;
        font-weight: 400;
        height:44px;
      }
    }
    
  }
</style>