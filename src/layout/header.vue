<template>
  <div class="page-header-box">
    <div class="page-header">
      <div class="left-mode">
        <router-link to="/">
          <div class="logo">
            <img src="@/assets/images/header/logo.png">
          </div>
        </router-link>
        <el-input class="search-box" v-model="searchWord" @change="search()"/>
      </div>

      <div class="right-nav">
        <router-link to="/communities">
          <div :class="['right-nav-item','nav-hover',$route.path.indexOf('/communities')>-1 ? 'action' : '']"><span>Communities</span></div>
        </router-link>
        <!-- <router-link to="/explore">
          <div :class="['right-nav-item','nav-hover',$route.path == '/explore' ? 'action' : '']"><span>Explore</span></div>
        </router-link> -->
        <a v-if="false" class="right-nav-item nav-hover" target="_blank" href="https://www.notion.so/bepopula/FAQs-81506fb8e8ab4a68b837aee0decfb888"><span>Learn</span></a>
        
        
        <template v-if="store.getters.isLogin">
          <el-popover
            popper-class="pot-pop"
            placement="bottom"
            trigger="hover"
            @show="initPot()"
            >
            <template #reference>
              <div :class="['pot',uncollectedDrips>0 ?'has-pot':'',dripActive?'active':'']"></div>
            </template>
            <div class="pot-box">
              <div class="uncollected-drips">{{numFormat(uncollectedDrips)}}</div>
              Unclaimed Drips
              <div class="collect-btn collected" v-if="isCollected || uncollectedDrips <= 0">
                <template v-if="isCollected"> Claimed </template>
                <template v-else> Claim </template>
              </div>
              <div class="collect-btn" v-else-if="uncollectedDrips > 0" @click="collectDrips()">
                <template v-if="isCollecting">
                  <img class="white-loading" src="@/assets/images/common/loading.png"/>
                </template>
                <template v-else> Claim </template>
              </div>
              <router-link to="/dashboard">
                <div class="dashboard-entry">My Drip Pots<p class="arrow"></p></div>
              </router-link>
            </div>
          </el-popover>
        </template>
        <div v-else class="pot" @click="showLoginMask"></div>

        <router-link to="/notice">
          <div :class="['notice',hasNotice && $route.path.indexOf('/notice') == -1 ?'has-notice':'']" v-if="store.getters.isLogin" ></div>
        </router-link>
        <div v-if="!store.getters.isLogin" class="user-login mini-button-border">
          <div class="mini-button" @click="showLoginMask">Sign in</div>
        </div>
        <div v-else class="right-nav-item user-photo">
          <el-popover
            popper-class="user-menu-box"
            placement="bottom"
            :width="200"
            trigger="click"
            >
            <template #reference>
              <img v-if="store.state.profile.avatar" class="user-photo-img" :src="$store.getters.getAwsImg($store.state.profile.avatar)" @error.once="$event.target.src=$store.state.profile.avatar"/>
              <img v-else class="user-photo-img" src="@/assets/images/common/user-default.png"/>
            </template>
            <div class="user-menu-list">
              <div class="user-menu-item account" @click="triggerCopy">
                <div>{{ store.getters.accountId }}</div>
              </div>
              <router-link to="/mine">
                <div class="user-menu-item profile">Profile</div>
              </router-link>
              <div class="user-menu-item" @click="logout">Sign Out</div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
  <!-- #copy_text  display:none;  -->
  <div ref="copy_text"  id="copy_text" @click="handleCopyFun"></div>
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
import { copyText } from 'vue3-clipboard';
import { ref,reactive, getCurrentInstance, toRefs , watch } from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
import DripContract from "@/contract/DripContract";
import { numFormat} from "@/utils/util.js";
import LoginMask from "@/component/login-mask.vue";
import BN from 'bn.js';
export default {
  components: {
    LoginMask
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const dripContract = new DripContract(store.state.account);

    const state = reactive({
      oldSearchWord:"",
      searchWord:"",
      showLogin:false,
      dripActive:false,
      uncollectedDrips:0,
      isCollecting:false,
      isCollected:false,
      hasNotice:false,
    })

    const init = async () => {
      await initPot()
      if(state.uncollectedDrips>0){
        store.commit("setDripActive", !store.state.dripActive);
      }
      if(route.path.indexOf('/notice') == -1){
        const res = await initNotice();
        if(res.success && res.data.count>0){
          state.hasNotice  = true;
        }
      }
    }

    watch(
			() => route.path,
			() => {
        if(route.path.indexOf('/search') == -1){
          state.searchWord = ""
          state.oldSearchWord = ""
          store.commit("setSearchWord", state.searchWord);
        }
        if(route.path.indexOf('/notice') == -1){
          state.hasNotice  = false;
          initNotice().then(res=>{
            if(res.success && res.data.count>0){
              state.hasNotice  = true;
            }
          })
        }
        initPot()
			}
		);

    watch(
			() => store.state.dripActive,
			() => {
        if(state.dripActive){
          return;
        }
        state.dripActive = true;
        setTimeout(()=>{
          state.dripActive = false;
        },3000)
			}
		);

    const initNotice = async () => {
      return await proxy.$axios.profile.get_user_new_notifications({
        account_id:store.getters.accountId,
        last_time:localStorage.getItem("notice_last_time_"+store.getters.accountId) || '',
      })
    }

    const initPot = async () => {
      if(store.getters.isLogin){
        const res = await proxy.$axios.drip.get_user_points({
          account_id:store.getters.accountId || "",
        });
        if(res.success){
          state.uncollectedDrips = res.data.claim_drips;
        }
      }
    }

    const collectDrips = async () => {
      if(state.isCollecting){return}
      state.isCollecting = true;

  
      const comm_res = await proxy.$axios.drip.get_user_community_points_list({
        account_id:store.getters.accountId || "",
        page:0,
        limit:100000
      });
      
      if(comm_res.success && comm_res.data && comm_res.data.length>length){
        const data = comm_res.data;
        const len = Math.ceil(comm_res.data.length/10);
        const params = [];
        for(let i = 0;i<len;i++){
          const collects = [];
          let deposit  = 0;
          for(let j = 0;j<10;j++){
            const comm_item = data[i*10+j];
            if(comm_item){
              collects.push(comm_item._id);
              if(comm_item.total_drips==0){
                deposit = new BN(deposit).add(new BN('8000000000000000000000'))
              }
            }
          }
          params.push({collects,deposit});
        }

        const res = await dripContract.collect(params);
        if(res.status == 'pending' || res.status == 'success'){
          state.isCollecting = false;
          state.page = 0;
          init();
          state.isCollected = true;
        }else if (res.status == 'fail'){
          state.isCollecting = false;
          proxy.$Message({
            message:'claim failed',
            type: "error",
          });
        }
      }

      // const collects = [];
      // const comm_res = await proxy.$axios.community.get_joined_community_list({
      //   account_id:store.getters.accountId,
      //   page:0,
      //   limit:1000
      // });
      // if(comm_res.success) {
      //   comm_res.data.forEach(item=>{
      //     collects.push(item.community_id);
      //   })
      // }

      // //collect
      // const res = await dripContract.collect({collects:collects});
      // if(res.status == 'pending' || res.status == 'success'){
      //   state.isCollecting = false;
      //   state.uncollectedDrips = 0;
      //   state.isCollected = true;
      // }else if (res.status == 'fail') {
      //   state.isCollecting = false;
      //   proxy.$Message({
      //     message:'claim failed',
      //     type: "error",
      //   });
      // }
    }

    const search = () => {
      if(state.oldSearchWord == state.searchWord || !state.searchWord ){return}
      state.oldSearchWord = state.searchWord
      store.commit("setSearchWord", state.searchWord);
      router.push("/search");
    }

    const switchModel = () => {
      store.commit("setTheme", store.state.theme === "black" ? "light" : "black");
    };

    const showLoginMask = () => {
      state.showLogin = true
    }

    const closeLoginMask = () => {
      state.showLogin = false
    }

    const login = async () => {
      await store.dispatch("test", "sender")
    }

    const logout = async () => {
      await store.dispatch("logout");

    }

    const copy_text = ref()
    const triggerCopy = () => {
      copy_text.value.click()
    }
    const handleCopyFun = () => {
      copyText(store.getters.accountId, undefined, (error, event) => {
        if (error) {
          proxy.$Message({
            message: "error",
            type: "error",
          });
        } else {
          proxy.$Message({
            message: "copy success",
            type: "success",
          });
        }
      })
    }

    return {
      numFormat,
      ...toRefs(state),
      init,
      search,
      initPot,
      collectDrips,
      switchModel,
      store,
      login,
      logout,
      copy_text,
      triggerCopy,
      handleCopyFun,
      showLoginMask,
      closeLoginMask
    };
  },
  mounted(){
    this.init();
  }
};
</script>

<style lang="scss" scoped>
.page-header-box{
  position:fixed;
  z-index:50;
  width:100%;
  height:80px;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.9);
  .page-header {
    margin: 0 auto;
    width:1440px;
    min-width:1440px;
    height:80px;
    padding:0 160px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    
    .left-mode{
      height:80px;
      display:flex;
      align-items: center;
      .logo {
        cursor: pointer;
        width:96px;
        img{
          width:100%;
        }
      }
    }


    .right-nav {
      display:flex;
      align-items:center;
      height:80px;
      font-family: D-DINExp;
      font-size: 16px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 400;
      .right-nav-item {
        cursor: pointer;
        line-height:62px;
        padding:0 20px;
        z-index:3;
        position:relative;
        span{
          line-height:62px;
          position:relative;
          z-index:3;
        }
        &.nav-hover {
          &::before{
            display:none;
            content:"";
            position:absolute;
            top:0;
            left:0;
            right:0;
            bottom:0;
            background:url('@/assets/images/header/selected-bg.png') no-repeat center center;
            background-size:contain;
            opacity: 0;
            z-index:1;
          }
          &:hover{
            font-family: D-DINExp-Bold;
            font-weight: 700;
            &::before{
              display:none;
              transition: opacity 0.5s linear;
              opacity: 1;
            }
          }
        }

        &.action{
          // background:url('@/assets/images/header/action_bg.png') no-repeat center center;
          // background-size:contain;
          font-family: D-DINExp-Bold;
          font-weight: 700;
          &::before{
            display:none;
          }
        }

        &.user-photo {
          position: relative;
          padding:0;
          .user-photo-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin:0 0 0 30px;
          }
        }

        .theme-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: $bak-color;
          transition: .5s;
          position: relative;
          &-img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            transition: .5s;
          }
        }
      }


      .pot{
        width:48px;
        height:48px;
        background:url('@/assets/images/drip/icon-drip.png') no-repeat center center;
        background-size:24px;
        margin-left:0;
        cursor: pointer;
        position:relative;
        &.has-pot{
          background-image:url('@/assets/images/drip/icon-drip-uncollected.gif');
          background-size:24px;
          &.active{
          // background-image:url('@/assets/images/drip/icon-drip-uncollected-strong.gif');
          // background-size:48px;
            &::after{
              display: block;
              content:"";
              position: absolute;
              top:50%;
              left:50%;
              transform: translate(-50%, -50%);
              width:24px;
              height:24px;
              border:2px solid #FED23C;
              border-radius: 50%;
              opacity:0;
              -webkit-animation:dripCircle 3s ease-in-out;
              animation:dripCircle 3s ease-in-out;
            }
            @-webkit-keyframes dripCircle{
              33%{ width:24px; height:24px; border:2px solid #FED23C;opacity:0;}
              50%{ width:48px; height:48px; border:2px solid #FED23C;opacity:1;}
              100%{ width:48px; height:48px; border:2px solid #FED23C;opacity:0;}
            }
            @keyframes dripCircle{
              33%{ width:24px; height:24px; border:2px solid #FED23C;opacity:0;}
              50%{ width:48px; height:48px; border:2px solid #FED23C;opacity:1;}
              100%{ width:48px; height:48px; border:2px solid #FED23C;opacity:0;}
            }
          }
        }
        // @-webkit-keyframes dripCircle{
        //   0%{opacity:1;}
        //   99%{ opacity:1;}
        //   100%{ opacity:0;}
        // }
        // @keyframes dripCircle{
        //   0%{opacity:1;}
        //   99%{ opacity:1;}
        //   100%{ opacity:0;}
        // }
      }
      .notice{
        width:24px;
        height:24px;
        background:url('@/assets/images/notice/icon-notice.png') no-repeat center center;
        background-size:cover;
        margin-left:18px;
        cursor: pointer;
        &.has-notice{
          background-image:url('@/assets/images/notice/icon-notice-unread.png');
        }
      }

      .user-login{
        cursor: pointer;
        margin-right: 0;
        margin-left:43px;
        .mini-button{
          background: #16181D;
        }
      }

    }
  }
  .page-header-phone,.menu-box{
    display:none;
  }
}
</style>

<style lang="scss" >
  .el-input.search-box{
    margin-left:100px;
    width: 300px;
    height: 40px;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    input{
      width: 100%;
      height: 40px;
      line-height:40px;
      background: transparent url("@/assets/images/header/icon-search.png") no-repeat 20px center ;
      background-size:16px 16px;
      padding:0 15px 0 46px;
      border:0;
      font-family: D-DINExp;
      font-size: 14px;
      color: #FFFFFF;
      font-weight: 400;
    }
  }

  .user-menu-box {
    width: 193px!important;
    font-weight: normal;
    color: #969dae !important;
    border: 0 !important;
    padding: 0 !important;
    .user-menu-list{
      background:#000!important;
      border-radius: 10px!important;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
    }
    .user-menu-item {
      padding:0 20px;
      height:50px;
      line-height:48px;
      box-sizing:border-box;
      cursor: pointer;
      font-family: D-DINExp;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 400;
      overflow:hidden;
      &:hover {
        background-color: rgba(40,40,45,0.5);
      }
      &:first-child{
        border-top-left-radius:10px;
        border-top-right-radius:10px;
      }
      &:last-child{
        border-bottom-left-radius:10px;
        border-bottom-right-radius:10px;
      }
      &.profile{
        border-radius:0;
      }
      &.account{
        font-family: D-DINExp;
        font-size: 14px;
        color: rgba(255,255,255,0.5);
        letter-spacing: 0;
        font-weight: 400;
        div{
          border-bottom: 1px solid rgba(255,255,255,0.3);
        }
      }
    }
    .el-popper__arrow{
      &::before{
        border:0 !important;
        background:#000 !important;
        transform: rotate(-135deg) !important;
      }
    }
  }

  .pot-box{
    display: flex;
    flex-direction: column;
    align-items:center;
    width:200px;
    padding:30px 20px 0;
    background: #000000;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
    border-radius: 10px;
    font-family: D-DINExp;
    font-size: 14px;
    color: rgba(255,255,255,0.50);
    letter-spacing: 0;
    text-align: center;
    font-weight: 400;
    line-height:16px;
    .uncollected-drips{
      margin:10px 0 4px;
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: center;
      font-weight: 700;
      line-height:22px;
    }
    .collect-btn{
      margin-top:20px;
      width:92px;
      height:40px;
      display: flex;
      align-items: center;
      justify-content:center;
      border-radius:40px;
      border:2px solid #FED23C;
      font-family: D-DINExp-Bold;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: center;
      font-weight: 700;
      cursor: pointer;
      &:hover{
        border:2px solid rgba(254,210,60,0.5);
      }
      &.collected{
        border:2px solid rgba(255,255,255,0.2);
        color:rgba(255,255,255,0.2);
      }
    }
    .dashboard-entry{
      margin-top:30px;
      display:flex;
      align-items: center;
      justify-content: center;
      padding:20px 0;
      border-top:1px solid rgba(255,255,255,0.2);
      width:100%;
      font-family: D-DINExp;
      font-size: 14px;
      color: #FFFFFF;
      font-weight: 400;
      cursor: pointer;
      .arrow{
        margin-left:20px;
        width:14px;
        height:14px;
        background:url('@/assets/images/common/icon-arrow-right.png') no-repeat center center;
        background-size:14px;
      }
      
    }

  }
</style>
