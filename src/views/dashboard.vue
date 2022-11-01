<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- Pot Overview-->
        <div class="title">Pot Overview</div>
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
        <!-- My Pots-->
        <div class="title">My Pots</div>
        <!-- no-result-->
        <div class="no-result"  v-if="isEnd && myPots.length == 0">
          <img src="@/assets/images/common/emoji-null.png"/>
          No data
        </div>
        <!-- My Pots -->
        <template v-else>
          <div class="my-pots">
            <div class="my-pots-head">
              <div class="head-item">Community</div>
              <div class="head-item">Drips Claimed</div>
              <div class="head-item">Available Drips</div>
              <div class="head-item">Unclaimed Drips</div>
            </div>
            <div class="my-pots-body">
              <div class="pot-item-box" v-for="item in myPots">
                <div class="pot-item" @click="jumpCommunity(item._id)">
                  <div class="community">
                    <img v-if="item.avatar"  class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                    <img v-else  class="avatar" src="@/assets/images/community/default-avatar.png">
                    <div class="name txt-wrap">{{item.name}}</div>
                  </div>
                  <div class="drips-collected">{{numFormat(item.total_drips)}}</div>
                  <div class="available-drips">{{numFormat(item.available_drips)}}</div>

                  <div class="uncollected-drips">
                    <div class="count">{{numFormat(item.claim_drips)}}</div>
                    <div v-if="item.isCollected" class="collect-btn collected">Claimed</div>
                    <div v-else-if="item.claim_drips>0" class="collect-btn" @click.stop="collectDrips(item)">
                      <template v-if="item.isCollecting">
                        <img class="white-loading" src="@/assets/images/common/loading.png"/>
                      </template>
                      <template v-else> Claim </template>
                    </div>
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
import { numFormat} from "@/utils/util.js";
import DripContract from "@/contract/DripContract";
import About from '@/component/about.vue';
import LoginMask from "@/component/login-mask.vue";
import BN from 'bn.js';
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
      dripsCollected:0,
      dripsRank:0,
      availableDrips:0,
      consumedDrips:0,
      uncollectedDrips:0,
      isCollecting:false,
      isCollected:false,
      myPots:[],
      page:0,
      isEnd:false,
      isLoading:false,
      showLogin:false,

    });

    const init = async () => {
      
      initDrips();
      state.myPots = await getList();
      
    }

    const initDrips = async () => {
      const res = await proxy.$axios.drip.get_user_points({
        account_id:store.getters.accountId || "",
      });
      if(res.success && res.data){
        state.dripsCollected = res.data.total_drips || 0;
        state.dripsRank = res.data.rank || 0;
        state.availableDrips = res.data.available_drips || 0;
        state.uncollectedDrips = res.data.claim_drips || 0;
      }
    }
    


    //getCommunities
    const getList = async () => {
      state.isLoading = true;
      //await
      const res = await proxy.$axios.drip.get_user_community_points_list({
        account_id:store.getters.accountId || "",
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
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.page>0){
        const res = await getList();
        state.myPots = state.myPots.concat(res);
      }
    }

    const jumpCommunity = (id) => {
      router.push(`/community-dashboard/${id}`);
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    //collectDrips
    const collectDrips = async (item=null) => {
      //collects
      if(item){
        if(item.isCollecting){return}
        item.isCollecting = true;
        const collects = [item._id];
        //collect
        const res = await dripContract.collect([{collects:collects,deposit:item.total_drips==0 ? '8000000000000000000000':'0'}]);
        if(res.status == 'pending' || res.status == 'success'){
          item.isCollecting = false;
          item.total_drips += item.claim_drips;
          item.available_drips += item.claim_drips;
          item.claim_drips = 0;
          item.isCollected = true;
          setTimeout(()=>{
            initDrips();
          },1000)
        }else if (res.status == 'fail') {
          item.isCollecting = false;
          proxy.$Message({
            message:'claim failed',
            type: "error",
          });
        }
      }else{
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
            setTimeout(()=>{
              init();
            },1000)
            state.isCollected = true;
          }else if (res.status == 'fail'){
            state.isCollecting = false;
            proxy.$Message({
              message:'claim failed',
              type: "error",
            });
          }
        }
        

        // const collects = []//["v5-app.bhc8521.testnet","test-2.community-genesis2.bhc8521.testnet"];
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

        //collect
        // const res = await dripContract.collect({collects:collects});
        // if(res.status == 'pending' || res.status == 'success'){
        //   state.isCollecting = false;
        //   // state.uncollectedDrips = 0;
        //   // state.myPots.forEach(item=>{
        //   //   item.claim_drips = 0;
        //   // })
        //   state.page = 0;
        //   init();
        //   state.isCollected = true;
        // }else if (res.status == 'fail') {
        //   state.isCollecting = false;
        //   proxy.$Message({
        //     message:'claim failed',
        //     type: "error",
        //   });
        // }
      }
    
    }

    return {
      numFormat,
      ...toRefs(state),
      init,
      handleScroll,
      jumpCommunity,
      showLoginMask,
      closeLoginMask,
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
    .title{
      display: flex;
      align-items: center;
      justify-content:space-between;
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      height:22px;
      line-height:22px;
      margin-bottom:20px;
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
    .my-pots{
      background: #28282D;
      border-radius: 24px;
      overflow: hidden;
      .my-pots-head{
        padding:0 30px;
        height:56px;
        display: flex;
        align-items:center;
        .head-item{
          width:25%;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          &:last-child{
            text-align:right;
          }
        }
      }
      .my-pots-body{
        .pot-item-box{
          padding:0 30px;
          cursor: pointer;
          &:hover{
            background: rgba(255,255,255,0.06);
          }
          .pot-item{
            border-top:1px solid rgba(255,255,255,0.1);
            height:70px;
            display: flex;
            align-items:center;
            >div{
              width:25%;
              &.community{
                display: flex;
                align-items:center;
                .avatar{
                  width:30px;
                  height:30px;
                  border-radius: 6px;
                }
                .name{
                  margin-left:12px;
                  font-family: D-DINExp;
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 400;
                  max-width:85px;
                }
              }
              &.drips-collected,&.available-drips{
                font-family: D-DINExp;
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 400;
              }
              &.uncollected-drips{
                display: flex;
                align-items: center;
                justify-content: flex-end;
                .count{
                  font-family: D-DINExp;
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  text-align: center;
                  font-weight: 400;
                }
                .collect-btn{
                  margin-left:12px;
                  width:60px;
                  height:22px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 11px;
                  font-family: D-DINExp;
                  font-size: 12px;
                  border: 1px solid #FED23C;
                  color: #FED23C;
                  letter-spacing: 0;
                  text-align: right;
                  font-weight: 400;
                  .white-loading{
                    width:12px;
                    height:12px;
                  }
                  &.collected{
                    border: 1px solid rgba(255,255,255,0.3);
                    color:rgba(255,255,255,0.3);
                  }
                }
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
