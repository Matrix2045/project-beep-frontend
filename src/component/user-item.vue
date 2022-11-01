<template>
  <div class="user-item" v-if="item">
    <div class="user-info">
      <router-link :to="'/user-profile/'+detail.account_id">
        <img v-if="detail.avatar" class="avatar" :src="$store.getters.getAwsImg(detail.avatar)" @error.once="$event.target.src=detail.avatar"/>
        <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
        <div class="info">
          <div :class="['name','name-'+item.data.type]">
            <div v-if="name" class="name-txt txt-wrap" v-html="name"></div>
            <div v-else class="name-txt txt-wrap" v-html="accountId"></div>
            <!-- CO -->
            <template v-if="detail.data.type=='creator'">
              <el-popover
                placement="bottom-start"
                trigger="hover"
                >
                <template #reference>
                  <div class="user-flag co"></div>
                </template>
                <div class="pop-box pop-tip pop-user-flag">Community Originator</div>
              </el-popover>
            </template>

            <!-- MOD -->
            <template v-else-if="detail.data.type=='mod'">
              <el-popover
                placement="bottom-start"
                trigger="hover"
                >
                <template #reference>
                  <div class="user-flag mod"></div>
                </template>
                <div class="pop-box pop-tip pop-user-flag">Moderator</div>
              </el-popover>
            </template>
          </div>
          <div class="account txt-wrap" v-html="accountId"></div>
          <div class="total">
            <div class="total-item"><span>{{detail.data.follows}}</span>Followers</div>
            <div class="total-item"><span>{{detail.data.following}}</span>Following</div>
            <div class="total-item"><span>{{detail.data.post_count}}</span>Posts</div>
          </div>
        </div>
      </router-link>
      <!-- follow -->
      <div class="follow-button" v-if="detail.account_id !== $store.getters.accountId" >
        <FollowButton 
          :isFollow="item.data.is_follow" 
          :accountId="item.account_id" 
          :background="'#28282D'"
          @follow = "follow"
          :position="'right'"
        />
      </div>
    </div>
    <template v-if="from == 'memberList'">
      <div class="user-tag" v-if="detail.data.type=='creator'">Created community on {{joinTime}}</div>
      <div class="user-tag" v-else>Joined the community on {{joinTime}}</div>
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
    setup(props,{ emit }) {
      const store = useStore();
      const router = useRouter();
      const { proxy } = getCurrentInstance();

      //state
      const state = reactive({
        detail:props.item,
        name:props.item.name || props.item.account_id.split(".testnet")[0],
        accountId:props.item.account_id,
        joinTime:new Date(props.item.data.join_time).toDateString().split(" ").slice(1).join(" ")
      })


      const init = () => {
        if(props.searchWord){
          const reg = RegExp(props.searchWord,"ig");
          state.accountId = state.detail.account_id.replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`);
          if(state.detail.name){
            state.name = state.detail.name.replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`);
          }else{
            state.name = (state.detail.account_id.split(".testnet")[0]).replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`);
          }
        }
      }

      //follow
      const follow = (res) => {
        state.detail.data.follows = res.isFollow ? state.detail.data.follows + 1 : state.detail.data.follows -1;
      }

      return {
        ...toRefs(state),
        init,
        follow,
      }
    },
    mounted(){
      this.init();
    }
  }
</script>

<style lang="scss" scoped>
  .user-item{
    padding: 20px 0;
    background: #28282D;
    border-top:1px solid rgba(255,255,255,0.1);
    &:first-child{
      border:0;
    }
    cursor: pointer;
    .user-info{
      position:relative;
      a{
        display:flex;
        align-items: center;
      }
      .avatar{
        width: 90px;
        height: 90px;
        border-radius:50%;
        object-fit: cover;
      }
      .info{
        margin-left:20px;
        width:300px;
        .name{
          height:20px;
          display:flex;
          align-items: center;
          &.name-creator{
            .name-txt{
              max-width:276px;
            }
          }
          &.name-mod{
            .name-txt{
              max-width:268px;
            }
          }
          .name-txt{
            display:inline-block;
            max-width:300px;
            line-height: 22px;
            font-family: D-DINExp-Bold;
            font-size: 20px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
          }
        }
        .account{
          margin-top:8px;
          opacity: 0.5;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
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
      .follow-button{
        position: absolute;
        top:27px;
        right:0;
      }
    }
    .user-tag{
      margin-top:20px;
      display: inline-block;
      width:auto;
      padding:0 12px 0 34px;
      height: 36px;
      line-height:34px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      font-family: D-DINExp;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 400;
      background:url("@/assets/images/common/icon-time.png") no-repeat 12px center;
      background-size:16px 16px;
    }
  }
</style>