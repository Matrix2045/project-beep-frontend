<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- Pot Overview-->
        <div class="community-info">
          <img v-if="community.avatar"  class="avatar" :src="$store.getters.getAwsImg(community.avatar)" @error.once="$event.target.src=community.avatar">
          <img v-else  class="avatar" src="@/assets/images/community/default-avatar.png">
          {{community.name}}
        </div>
        <div class="pot-overview">
          <div class="pot-info">
            <div class="drips-collected">{{numFormat(dripsCollected)}}</div>
            Drips Claimed
            <div class="drips-rank"><span>#{{dripsRank > 9999 ? '9999+' : numFormat(dripsRank,true)}}</span> in Popula</div>
            <div class="drips-info">
              <div class="drips-item"><span>{{numFormat(availableDrips)}}</span>Available Drips</div>
              <div class="drips-item"><span>{{numFormat(consumedDrips)}}</span>Consumed Drips</div>
            </div>
          </div>
          <div class="pot-collect">
            <img class="pot-icon" src="@/assets/images/drip/drip.png"/>
            <div class="uncollected-drips">{{numFormat(uncollectedDrips)}}</div>
            Unclaimed Drips
            <div v-if="isCollected || uncollectedDrips<=0" class="collect-btn collected">
              <template v-if="isCollected">Claimed</template>
              <template v-else> Claim </template>
            </div>
            <div v-else class="collect-btn" @click="collectDrips()">
              <template v-if="isCollecting">
                <img class="white-loading" src="@/assets/images/common/loading.png"/>
              </template>
              <template v-else> Claim </template>
            </div>
          </div>
        </div>
        <!-- Drips History-->
        <div class="title">
          Drips History
          <div class="filter-menu">
            <div :class="['filter-menu-item',currentTab == 'full_history' ? 'active' : '']" @click="changeTab('full_history')">Full History</div>
            <div :class="['filter-menu-item',currentTab == 'drips_in' ? 'active' : '']" @click="changeTab('drips_in')">Drips in</div>
            <div :class="['filter-menu-item',currentTab == 'drips_out' ? 'active' : '']" @click="changeTab('drips_out')">Drips out</div>
          </div>
        </div>
        <!-- no-result-->
        <div class="no-result"  v-if="isEnd && list[currentTab]['length'] == 0">
          <img src="@/assets/images/common/emoji-null.png"/>
          No data
        </div>
        <template v-else>
          <div class="drips-history">
            <div class="drips-history-head">
              <div class="head-item">Drips</div>
              <div class="head-item">Action</div>
              <div class="head-item">Time</div>
              <div class="head-item">Transactions</div>
            </div>
            <div class="drips-history-body">
              <div class="history-item-box" v-for="item in list[currentTab]" @click="jumpContent(item)">
                <div class="history-item">
                  <div class="drips">{{numFormat(item.points)}}</div>
                  <div class="activity">
                    <div class="text txt-wrap">{{formatActivity(item.type)}}</div>
                  </div>
                  <div class="time">{{getTimer(item.create_at)['time']}}</div>
                  <div class="transactions">
                    <div class="tx" @click.stop="jumpTx(item)">Tx</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- loading -->
            <div class="loading-box" v-if="isLoading">
              <img class="white-loading" src="@/assets/images/common/loading.png"/>
            </div>
          </div>
          <div class="no-more" v-if="isEnd">No more</div>
        </template>
      </div>
      <!-- right -->
      <div class="right">
        
        <!-- About -->
        <!-- <About/> -->
      </div>
    </div>
  </div>
  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from 'vuex';
import DripContract from "@/contract/DripContract";
import { getTimer, numFormat} from "@/utils/util.js";
import About from '@/component/about.vue';
import LoginMask from "@/component/login-mask.vue";
export default {
  components: {
    About,
    LoginMask,
  },
  setup(){
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const dripContract = new DripContract(store.state.account);

    //state
    const state = reactive({
      community:{
        avatar:'',
        name:''
      },
      dripsCollected:0,
      dripsRank:0,
      availableDrips:0,
      consumedDrips:0,
      uncollectedDrips:0,
      isCollecting:false,
      isCollected:false,
      
      currentTab:'',
      list:{
        'full_history':[],
        'drips_in':[],
        'drips_out':[]
      },
      page:1,
      isEnd:false,
      isLoading:false,

      showLogin:false,
    });

    const init = async () => {
      initCommunity();
      initDrips();
      
      changeTab('full_history');

      // const drips = await dripContract.getDrips({
      //   account_id:store.getters.accountId,
      //   contract_id: route.params.id,//null, 
      //   token_source: null  
      // });
      // console.log(drips/1000000000000000000000000,'---drips---');
    }

    const initCommunity = async () => {
      const res = await proxy.$axios.community.get_community_detail({
        account_id:store.getters.accountId || "",
        community_id:route.params.id,
      });
      if(res.success) {
        state.community = res.data;
      }
    }

    const initDrips = async () => {
      const res = await proxy.$axios.drip.get_user_community_points_detail({
        account_id:store.getters.accountId || "",
        community_id:route.params.id,
      });
      if(res.success && res.data){
        state.dripsCollected = res.data.total_drips || 0;
        state.dripsRank = res.data.rank || 0;
        state.availableDrips = res.data.available_drips || 0;
        state.consumedDrips = res.data.consume_drips || 0;
        state.uncollectedDrips = res.data.claim_drips || 0;
        if(state.uncollectedDrips>0){
          state.isCollected = false;
        }
      }
    }


    //changeTab
    const changeTab = async (tab) => {
      if(state.currentTab == tab) return;
      //reset data
      state.currentTab = tab;
      state.list[state.currentTab] = [];
      state.page = 0;
      state.isEnd = false;
      //request
      initDrips();
      state.list[state.currentTab] = await getList();
    }

    //getCommunities
    const getList = async () => {
      state.isLoading = true;
      //await
      const res = await proxy.$axios.drip.get_community_points_list({
        account_id:store.getters.accountId || "",
        community_id:route.params.id,
        type:state.currentTab,
        page:state.page,
        limit:20
      });
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
        const res = await getList();
        state.list[state.currentTab] = state.list[state.currentTab].concat(res);
      }
    }

    //jumpContent
    const jumpContent = (item) => {
      if(item.type == 'drips_in_for_a_post'){
        router.push(`/detail/${item.operation.target_hash}`);
      }else if(item.type == 'drips_in_for_a_like' || item.type == 'drips_in_for_a_share' || item.type == 'drips_delivered_by_a_like' || item.type == 'drips_delivered_by_a_share'){
        if(item.operation.hierarchies.length==0){
          console.log(`/detail/${item.operation.target_hash}`,'666');
          router.push(`/detail/${item.operation.target_hash}`);
        }else{
          router.push(`/detail/${item.operation.hierarchies[0]['target_hash']}?comment=${item.operation.target_hash}`);
        }
      }else if(item.type == 'drips_in_for_a_comment'){
        router.push(`/detail/${item.operation.post_id}?comment=${item.operation.target_hash}`);
      }else if(item.type == 'drips_delivered_by_a_comment'){
        router.push(`/detail/${item.operation.target_hash}?comment=${item.target_hash}`);
      }else if(item.type == 'drips_delivered_by_a_sub_comment_comment'){
        router.push(`/detail/${item.operation.hierarchies[0]['target_hash']}?comment=${item.target_hash}`);
      }
    }

    //jumpTx
    const jumpTx = (item) => {
      window.open(store.state.nearConfig.explorerUrl+'/transactions/'+item.tx_hash,'__blank');
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    const formatActivity = (str) => {
      let desc = str;
      if(desc == 'drips_delivered_by_a_sub_comment_comment'){
        desc = 'drips_delivered_by_a_comment'
      }
      let res = desc.replaceAll('_',' ');
      res = res[0].toUpperCase() + res.slice(1); 
      return res;
    }

    //collectDrips
    const collectDrips = async () => {
      if(state.isCollecting){return}
      state.isCollecting = true;
      
      //collect
      const res = await dripContract.collect([{collects:[route.params.id],deposit:state.dripsCollected==0 ? '8000000000000000000000':'0'}]);
      if(res.status == 'pending' || res.status == 'success'){
        state.isCollecting = false;
        state.isCollected = true;
        setTimeout(()=>{
          initDrips();
        },1000)

      }else if (res.status == 'fail') {
        state.isCollecting = false;
        proxy.$Message({
          message:'claim failed',
          type: "error",
        });
      }
    }

    return {
      getTimer,
      numFormat,
      ...toRefs(state),
      init,
      changeTab,
      handleScroll,
      jumpContent,
      jumpTx,
      showLoginMask,
      closeLoginMask,
      formatActivity,
      collectDrips

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
    padding-right:20px;
    .community-info{
      display: flex;
      align-items: center;
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      height:30px;
      line-height:30px;
      margin-bottom:20px;
      .avatar{
        margin-right:12px;
        width:30px;
        height:30px;
        border-radius:6px;
      }
    }
    .title{
      display: flex;
      align-items: center;
      justify-content:space-between;
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      height:28px;
      line-height:28px;
      margin-bottom:20px;
      .filter-menu {
        margin-top: 0;
        .filter-menu-item{
          padding-top:0;
        }
      }
    }
    .pot-overview{
      margin-bottom:60px;
      display: flex;
      justify-content:space-between;
      .pot-info{
        padding:30px;
        width:450px;
        height:245px;
        background: #28282D;
        border-radius: 24px;
        font-size: 14px;
        color: rgba(255,255,255,0.50);
        letter-spacing: 0;
        text-align: center;
        font-weight: 400;
        line-height:16px;
        .drips-collected{
          font-family: D-DINExp-Bold;
          font-size: 20px;
          color: #FED23C;
          letter-spacing: 0;
          text-align: center;
          font-weight: 700;
          line-height:22px;
          margin-top:4px;
        }
        .drips-rank{
          margin-top:20px;
          height:20px;
          display:flex;
          justify-content: center;
          align-items: center;
          span{
            margin-right:6px;
            font-family: D-DINExp-Bold;
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
          }
        }
        .drips-info{
          margin-top:30px;
          padding:30px;
          border-top:1px solid rgba(255,255,255,0.2);
          display:flex;
          justify-content:space-between;
          .drips-item{
            width:40%;
            display:flex;
            flex-direction: column;
            align-items: center;
            span{
              font-family: D-DINExp-Bold;
              font-size: 20px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: center;
              font-weight: 700;
              line-height:22px;
              margin-bottom:4px;
            }
          }
        }
      }
      .pot-collect{
        padding:30px;
        display: flex;
        flex-direction: column;
        align-items:center;
        width:220px;
        height:245px;
        background: #28282D;
        border-radius: 24px;
        font-family: D-DINExp;
        font-size: 14px;
        color: rgba(255,255,255,0.50);
        letter-spacing: 0;
        text-align: center;
        font-weight: 400;
        line-height:16px;
        .pot-icon{
          width:50px;
          height:50px;
          vertical-align: middle;
        }
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
          margin-top:45px;
          width:144px;
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
      }
    }
    .drips-history{
      background: #28282D;
      border-radius: 24px;
      overflow: hidden;
      .drips-history-head{
        padding:0 30px;
        height:56px;
        display: flex;
        align-items:center;
        .head-item{
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          &:nth-child(1){
            width:15%;
          }
          &:nth-child(2){
            width:40%;
          }
          &:nth-child(3){
            width:30%;
          }
          &:nth-child(4){
            width:15%;
            text-align: right;
          }
        }
      }
      .drips-history-body{
        .history-item-box{
          padding:0 30px;
          &:hover{
            background: rgba(255,255,255,0.06);
          }
          .history-item{
            border-top:1px solid rgba(255,255,255,0.1);
            height:70px;
            display: flex;
            align-items:center;
            cursor: pointer;
            .drips{
              width:15%;
              font-family: D-DINExp;
              font-size: 16px;
              color: #7FD576;
              letter-spacing: 0;
              font-weight: 400;
            }
            .activity{
              width:40%;
              font-family: D-DINExp;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              .text{
                max-width:270px;
              }

            }
            .time{
              width:30%;
              font-family: D-DINExp;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
            }
            .transactions{
              width:15%;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              text-align: right;
              font-weight: 400;
              
              .tx{
                display: inline-block;
                padding:10px 16px 10px 20px;
                background:url('@/assets/images/common/icon-jump.png') no-repeat right center;
                background-size:12px;
                cursor: pointer;
                text-decoration:underline;
              }
            }
          }
        }
      }
    }
    .loading-box{
      height:50px;
      display:flex;
      align-items: center;
      justify-content:center;
    }
  }
  .right{

  }
}
</style>
