<template>

  <el-popover placement="bottom" :fallback-placements="[ 'top']"   trigger="click" >
    <template #reference>
      <div :id="'pop-like-notice'+item.targetHash" :class="['like',likeActive?'like-active':'',isLiked?'liked':'']" @click.stop="changeLike()">
        <template v-if="likeCount">{{formatCount(likeCount)}}</template>
      </div>
    </template>
    <!-- like notice -->
    <div class="pop-box pop-intro pop-notice" v-if="showNotice">
      <div class="title">Notice</div>
      <div class="intro">This action will be recorded as a transaction on Near Protocol. Transaction details can be viewed in <a href="https://wallet.testnet.near.org/" target="_blank">Recent Activity</a></div>
      <div class="button-box">
        <div class="mini-button-border button-cancel" @click.stop="showNotice=false">
          <div class="mini-button">Cancel</div>
        </div>
        <div class="mini-button-border" @click.stop="confirmLike()">
          <div class="mini-button">Confirm</div>
        </div>
      </div>
    </div>
  </el-popover>

  <!-- <div :id="'pop-like-notice'+item.targetHash" :class="['like',likeActive?'like-active':'',isLiked?'liked':'']" @click.stop="changeLike()">
    <template v-if="likeCount">{{formatCount(likeCount)}}</template>
    <div class="pop-box pop-intro pop-notice" v-if="showNotice">
      <div class="title">Notice</div>
      <div class="intro">This action will be recorded as a transaction on Near Protocol. Transaction details can be viewed in <a href="https://wallet.testnet.near.org/" target="_blank">Recent Activity</a></div>
      <div class="button-box">
        <div class="mini-button-border button-cancel" @click.stop="showNotice=false">
          <div class="mini-button">Cancel</div>
        </div>
        <div class="mini-button-border" @click.stop="confirmLike()">
          <div class="mini-button">Confirm</div>
        </div>
      </div>
    </div>
  </div> -->


  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
  import { reactive, toRefs, watch, getCurrentInstance  } from "vue";
  import { useStore } from 'vuex';
  import MainContract from "@/contract/MainContract";
  import CommunityContract from "@/contract/CommunityContract";
  import { formatCount} from "@/utils/util.js";
  import LoginMask from "@/component/login-mask.vue";
  export default {
    components: {
      LoginMask
    },
    props:{
      type:{
        type:String,
        value:''
      },
      item:{
        type:Object,
        value:{}
      },
      unJoinCommunity:{
        type:Boolean,
        value:false
      },
    },
    setup(props,{ emit }) {
      const store = useStore();
      const { proxy } = getCurrentInstance();
      const mainContract = new MainContract(store.state.account);

      //state
      const state = reactive({
        likeCount:props.item.likeCount,
        isLiked:props.item.isLiked,
        targetHash:props.item.targetHash,
        communityId:props.item.communityId,
        isLiking:false,
        showLogin:false,
        showNotice:false,
        likeActive:false,
      })

      watch(
        () => props.item,
        (newVal) => {
          state.targetHash = newVal.targetHash
        },
        { deep:true}

      );

      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      const confirmLike = () => {
        state.showNotice = false;
        localStorage.setItem("likeAlerted",true)
        changeLike();
      }

      const changeLike = async (item) => {
        if(!state.targetHash){
          proxy.$Message({
            message: "Wait a minute, the content is uploading.",
            type: "error",
          });
          return;
        }
        
        if(store.getters.isLogin){
          if(props.unJoinCommunity){
            proxy.$Message({
              message: "Only community members can operate, please join the community first",
              type: "warn",
            });
            return;
          }
          //notice
          if(!localStorage.getItem("likeAlerted")){
            state.showNotice = true;
            return;
          }
          if(state.isLiking) {
            return;
          }
          state.isLiking = true;
          //params
          let params = {}
          if(props.type == 'post'){
            params= {
              hierarchies : [
                {
                  target_hash : props.item.targetHash,
                  account_id : props.item.accountId,
                }
              ]
            };
          }else if(props.type == 'comment'){
            params = {
              hierarchies : [
                ...props.item.hierarchies,
                {
                  target_hash : props.item.targetHash,
                  account_id : props.item.accountId,
                }
              ]
            }
          }else{
            throw new Error("please check content type");
          }
          
          //contract 
          let res = ''
          if(state.communityId){
            const communityContract = await CommunityContract.new(state.communityId);
            res = state.isLiked ? await communityContract.unlike(params) : await communityContract.like(params) 
          }else{
            res = state.isLiked ? await mainContract.unlike(params) : await mainContract.like(params)
          }
          if (res.status == 'pending' || res.status == 'success') {
            state.likeCount = state.isLiked ? Number(state.likeCount)-1 : Number(state.likeCount)+1;
            state.likeActive = true;
            if(!state.isLiked){
              store.commit("setDripActive", !store.state.dripActive);
            }
            setTimeout(()=>{
              state.likeActive = false;
              state.isLiked  = !state.isLiked;
              state.isLiking = false;
              if(props.type == 'comment'){
                emit('changeLike',{likeCount:state.likeCount,isLiked:state.isLiked});
              }
            },400)
          } else if (res.status == 'fail') {
            state.isLiking = false;
            const message = state.isLiked ? 'Unlike Failed' : 'Like Failed';
            proxy.$Message({
              message,
              type: "error",
            });
          }
        }else{
          state.showLogin = true
        }
      }

      return {
        ...toRefs(state),
        showLoginMask,
        closeLoginMask,
        confirmLike,
        changeLike,
        formatCount
      };
    },
    mounted(){
      document.addEventListener('click',(e) => {
        const pop_notice = document.getElementById('pop-like-notice'+ this.$props.item.targetHash);
        if(this.showNotice && pop_notice &&　!pop_notice.contains(e.target)) {
            this.showNotice = false;
        }
      })
    },
  }
</script>


<style lang="scss">
  .like{
    margin-left:30px;
    padding-left:30px;
    font-family: D-DINExp;
    font-size: 14px;
    line-height:24px;
    color: #FFFFFF;
    letter-spacing: 0;
    text-align: right;
    font-weight: 400;
    background:url("@/assets/images/post-item/icon-unlike.png") no-repeat left center;
    background-size:24px 24px;
    /*
    background: url('@/assets/images/test/like_icon.png') no-repeat left center;
    background-size: auto 45px;
    */
    position:relative;
    cursor:pointer;
    &:hover{
      background-image:url("@/assets/images/post-item/icon-unlike-hover.png");
    }
    &.liked{
      background-image:url("@/assets/images/post-item/icon-like.png");
    }
    .pop-notice{
      .title{
        text-align: left;
      }
    }
  }

  .like-active {
    animation-timing-function: steps(13);
    animation-name: plus-one;
    animation-duration: 0.4s;
    animation-iteration-count: 1;
    display: inline-block;
    animation-fill-mode: forwards;
  }

  @keyframes plus-one {
    0% {
      background-position: 6px center;
      background-size:12px 12px
    }
    75% {
      background-position: -2px center;
      background-size:28px 28px
    }
    100% {
      background-position: left center;
      background-size:24px 24px
    }
  }

</style>
