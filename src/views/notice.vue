<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <div class="title">Notifications</div>
        <div class="no-result"  v-if="isEnd && list.length==0">
          <img src="@/assets/images/common/emoji-null.png"/>
          No data
        </div>

        <!-- list -->
        <div v-else-if="list.length>0" class="list">
          <template v-for="item in list">
            <!-- reply -->
            <div v-if="item.notice_type == 'reply'" class="content-item">
              <router-link :to="'/detail/'+item.comment.comment_post_id+'?comment='+item.comment.target_hash">
                <div class="user">
                  <el-popover placement="bottom" :fallback-placements="[ 'top']"  trigger="hover" @show="item.showUser=true" @hide="item.showUser=false">
                    <template #reference>
                      <router-link :to="'/user-profile/'+item.account_id">
                        <img v-if="item.user && item.user.avatar" class="avatar" :src="$store.getters.getAwsImg(item.user.avatar)" @error.once="$event.target.src=item.user.avatar"/>
                        <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                      </router-link>
                    </template>
                    <template v-if="item.showUser">
                      <UserPopup :account="item.account_id"/>
                    </template>
                  </el-popover>


                  <div class="user-info">
                    <router-link :to="'/user-profile/'+item.account_id">
                      <div class="name txt-wrap">
                        {{ (item.user && item.user.name) ? item.user.name : item.account_id}}
                      </div>
                    </router-link> <br/>
                    <el-popover placement="bottom-start"  trigger="hover">
                      <template #reference>
                        <div class="createtime">{{item.time.showTime}}</div>
                      </template>
                      <div class="pop-box pop-tip">{{item.time.hoverTime}}</div>
                    </el-popover>
                  </div>
                </div>
                <div class="reply-user">Replying to you</div> 
                <pre v-if="item.postType != 'encrypt' || item.isAccess" class="text"><div v-html="item.text"></div></pre>
                <div v-else class="default-content">
                  Hold at least {{item.accessDrips}} Drips in this community to unlock this content.
                </div>
                <!-- <div v-if="item.postType == 'encrypt'">{{item.accessDrips}}</div> -->
              </router-link>
            </div>

            <!-- @ -->
            <template v-else-if="item.notice_type == 'at'">
              <div v-if="item.post" class="content-item">
                <router-link :to="'/detail/'+item.post.target_hash">
                  <div class="user">
                    <el-popover placement="bottom" :fallback-placements="[ 'top']"  trigger="hover" @show="item.showUser=true" @hide="item.showUser=false">
                      <template #reference>
                        <router-link :to="'/user-profile/'+item.account_id">
                          <img v-if="item.user && item.user.avatar" class="avatar" :src="$store.getters.getAwsImg(item.user.avatar)" @error.once="$event.target.src=item.user.avatar"/>
                          <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                        </router-link>
                      </template>
                      <template v-if="item.showUser">
                        <UserPopup :account="item.account_id"/>
                      </template>
                    </el-popover>

                    <div class="user-info">
                      <router-link :to="'/user-profile/'+item.account_id">
                        <div class="name txt-wrap">
                          {{(item.user && item.user.name) ? item.user.name : item.account_id}}
                        </div>
                      </router-link> <br/>
                      <el-popover placement="bottom-start"  trigger="hover">
                        <template #reference>
                          <div class="createtime">{{item.time.showTime}}</div>
                        </template>
                        <div class="pop-box pop-tip">{{item.time.hoverTime}}</div>
                      </el-popover>
                    </div>
                  </div>
                  <div class="reply-user"><span>@you</span></div> 
                  <pre v-if="item.postType != 'encrypt' || item.isAccess" class="text"><div v-html="item.text"></div></pre>
                  <div v-else class="default-content">
                    Hold at least {{item.accessDrips}} Drips in this community to unlock this content.
                  </div>
                </router-link>
                <!-- <div v-if="item.postType == 'encrypt'">{{item.accessDrips}}</div> -->
              </div>
              <div v-else class="content-item">
                <router-link :to="'/detail/'+item.comment.comment_post_id+'?comment='+item.comment.target_hash">
                  <div class="user">
                    <el-popover placement="bottom-start"  trigger="hover" @show="item.showUser=true" @hide="item.showUser=false">
                      <template #reference>
                        <router-link :to="'/user-profile/'+item.account_id">
                          <img v-if="item.user && item.user.avatar" class="avatar" :src="$store.getters.getAwsImg(item.user.avatar)" @error.once="$event.target.src=item.user.avatar"/>
                          <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                        </router-link>
                      </template>
                      <template v-if="item.showUser">
                        <UserPopup :account="item.accountiId"/>
                      </template>
                    </el-popover>

                    <div class="user-info">
                      <router-link :to="'/user-profile/'+item.account_id">
                        <div class="name txt-wrap">
                          {{(item.user && item.user.name) ? item.user.name : item.account_id}}
                        </div>
                      </router-link> <br/>
                      <el-popover placement="bottom-start"  trigger="hover">
                        <template #reference>
                          <div class="createtime">{{item.time.showTime}}</div>
                        </template>
                        <div class="pop-box pop-tip">{{item.time.hoverTime}}</div>
                      </el-popover>
                    </div>
                  </div>
                  <div class="reply-user"><span>@you</span></div> 
                  <pre v-if="item.postType != 'encrypt' || item.isAccess" class="text"><div v-html="item.text"></div></pre>
                  <div v-else class="default-content">
                    token-gated content
                  </div>
                </router-link>
                <!-- <div v-if="item.postType == 'encrypt'">{{item.accessDrips}}</div> -->
              </div>
            </template>

            <!-- like -->
            <div v-else-if="item.notice_type == 'like'" class="like-item">
              <router-link :to="item.url">
                <div class="avatar-list">
                  <template v-for="(user,index) in item.data.likes">
                    <template v-if="index<10">
                      <img v-if="user.data.avatar" class="avatar" :src="$store.getters.getAwsImg(user.data.avatar)" @error.once="$event.target.src=user.data.avatar"/>
                      <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                    </template>
                  </template>

                  <div class="hide-list">
                    <template v-for="(user,index) in item.data.likes">
                      <template v-if="index<10">
                        <el-popover placement="bottom-start"  trigger="hover" @show="user.showUser=true" @hide="user.showUser=false">
                          <template #reference>
                            <router-link :to="'/user-profile/'+user.account_id">
                              <div class="hide-item"></div>
                            </router-link>
                          </template>
                          <template v-if="user.showUser">
                            <UserPopup :account="user.account_id"/>
                          </template>
                        </el-popover>
                      </template>
                    </template>
                  </div>
                </div>
                <div class="intro">
                  <template v-if="item.data.count==1">
                    <router-link :to="'/user-profile/'+item.data.likes[0]['data']['account_id']">
                      <span>{{item.data.likes[0]['data']['name'] || item.data.likes[0]['data']['account_id']}}</span>
                    </router-link>
                  </template>
                  <template v-if="item.data.count==2">
                    <router-link :to="'/user-profile/'+item.data.likes[0]['data']['account_id']">
                      <span>{{item.data.likes[0]['data']['name'] || item.data.likes[0]['data']['account_id']}}</span>
                    </router-link>
                    and 
                    <router-link :to="'/user-profile/'+item.data.likes[1]['data']['account_id']">
                      <span>{{item.data.likes[1]['data']['name'] || item.data.likes[1]['data']['account_id']}}</span>
                    </router-link>
                  </template>
                  <template v-if="item.data.count>2">
                    <router-link :to="'/user-profile/'+item.data.likes[0]['data']['account_id']">
                      <span>{{item.data.likes[0]['data']['name'] || item.data.likes[0]['data']['account_id']}}</span>
                    </router-link>
                    and {{item.data.count-1}} others
                  </template>
                  liked your 
                  <template v-if="item.post">post</template>
                  <template v-else>reply</template>
                </div>
      
                <pre class="text"><div v-html="item.text"></div></pre>
              </router-link>
              <!-- <div v-if="item.postType == 'encrypt'">{{item.accessDrips}}</div> -->
            </div>

            <!-- follow -->
            <div v-else-if="item.notice_type=='follow'" class="follow-item">
              <router-link :to="'/mine'">
                <div class="avatar-list">
                  <template v-for="(user,index) in item.data.follow">
                    <template v-if="index<10">
                      <img v-if="user.data.avatar" class="avatar" :src="$store.getters.getAwsImg(user.data.avatar)" @error.once="$event.target.src=user.data.avatar"/>
                      <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                    </template>
                  </template>

                  <div class="hide-list">
                    <template v-for="(user,index) in item.data.follow">
                      <template v-if="index<10">
                        <el-popover placement="bottom-start"  trigger="hover" @show="user.showUser=true" @hide="user.showUser=false">
                          <template #reference>
                            <router-link :to="'/user-profile/'+user.account_id">
                              <div class="hide-item"></div>
                            </router-link>
                          </template>
                          <template v-if="user.showUser">
                            <UserPopup :account="user.account_id"/>
                          </template>
                        </el-popover>
                      </template>
                    </template>
                  </div>
                </div>
                <div class="intro">
                  <template v-if="item.data.count==1">
                    <router-link :to="'/user-profile/'+item.data.follow[0]['data']['account_id']">
                      <span>{{item.data.follow[0]['data']['name'] || item.data.follow[0]['data']['account_id']}}</span>
                    </router-link>
                  </template>
                  <template v-if="item.data.count==2">
                    <router-link :to="'/user-profile/'+item.data.follow[0]['data']['account_id']">
                      <span>{{item.data.follow[0]['data']['name'] || item.data.follow[0]['data']['account_id']}}</span>
                    </router-link>
                    and 
                    <router-link :to="'/user-profile/'+item.data.follow[1]['data']['account_id']">
                      <span>{{item.data.follow[1]['data']['name'] || item.data.follow[1]['data']['account_id']}}</span>
                    </router-link>
                  </template>
                  <template v-if="item.data.count>2">
                    <router-link :to="'/user-profile/'+item.data.follow[0]['data']['account_id']">
                      <span>{{item.data.follow[0]['data']['name'] || item.data.follow[0]['data']['account_id']}}</span>
                    </router-link>
                    and {{item.data.count-1}} others
                  </template>
                  followed you
                </div>
              </router-link>
            </div>
          </template>
        </div>

        <!-- loading -->
        <div class="loading-box" v-if="isLoading">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </div>

      </div>
      <!-- right -->
      <div class="right">
        <!-- About -->
        <!-- <About/> -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs, watch, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import { formatAmount, parseAmount, getTimer} from "@/utils/util.js";
import About from '@/component/about.vue';
import UserPopup from '@/component/user-popup.vue';
export default {
  components: {
    About,
    UserPopup
  },
  setup(){
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
      isLoading:false,
      list:[],
      page:0,
      limit:10,
      isEnd:false,
    })

    const init = () => {
      getList()
      
    }

    const getList = async () => {
      if(state.isLoading){return;}

      state.isLoading = true;
      const res = await proxy.$axios.profile.get_user_notifications({
        account_id:store.getters.accountId,
        page:state.page,
        limit:state.limit
      });
      if(res.success){
        if(state.page==0){
          localStorage.setItem("notice_last_time_"+store.getters.accountId,res.last_time);
        }
        if(res.data.length==0){
          state.isEnd = true;
        }
        state.page = state.page + 1;
        state.list = state.list.concat(await handleData(res.data));
      }
      state.isLoading = false;
    }

    const handleData = async (data) => {
      const list = [];
      const length = Math.min(data.length,50);
      for(let i = 0;i<length;i++){//data.length
        const item = data[i];
        if(item.type == 'follow'){
          item.notice_type = 'follow'
        }else if(item.data.likes.length>0){ //like
          item.notice_type = 'like'
          //url
          if(item.type=="comment" || item.type == 'mainPost'){
            item.url = `/detail/${item.comment.comment_post_id}?comment=${item.comment.target_hash}`
          }else{
            item.url = `/detail/${item.post.target_hash}`
          }
          //text
          if(item.type == 'comment'){
            if(item.comment.type== 'encrypt'){
              item.postType = 'encrypt'
              item.accessDrips =  item.comment.access.conditions ? formatAmount(item.comment.access.conditions[0]['DripCondition']['amount_to_access'],24) : 0;
              const info = await checkAccess(item);
              if(info.isAccess){
                item.text = info.text;
                item.isAccess = info.isAccess
              }
            }else{
              item.text = item.comment.text;
            }
          }else if(item.type == 'post'){
            if(item.post.type== 'encrypt'){
              item.postType = 'encrypt'
              const info = await checkAccess(item);
              if(info.isAccess){
                item.text = info.text;
                item.isAccess = info.isAccess
              }
            }else{
              item.text = item.post.text ? item.post.text : (item.post.imgs.length>0 ? '[Images]' : '') ;
            }
          }else{
            continue;
          }
          
        }else if(item.data.At && item.data.At.length>0){ //@
          item.notice_type = 'at'
          //time
          item.time = getTimer(item.create_at)
          //user
          item.user = {}
          const res = await proxy.$axios.profile.get_user_info({
            account_id:item.comment ? item.comment.account_id : item.post.account_id,
            current_account_id: store.getters.accountId || ''
          });
          if(res.success){
            item.user = res.data;
          }
          //text
          if(item.type == 'comment'){
            if(item.comment.type== 'encrypt'){
              item.postType = 'encrypt'
              item.accessDrips =  item.comment.access.conditions ? formatAmount(item.comment.access.conditions[0]['DripCondition']['amount_to_access'],24) : 0;
              const info = await checkAccess(item);
              if(info.isAccess){
                item.text = info.text;
                item.isAccess = info.isAccess
              }
            }else{
              item.text = item.comment.text;
            }
          }else if(item.type == 'post'){
            if(item.post.type== 'encrypt'){
              item.postType = 'encrypt'
              item.accessDrips =  item.post.access.conditions ? formatAmount(item.post.access.conditions[0]['DripCondition']['amount_to_access'],24) : 0;
              const info = await checkAccess(item);
              if(info.isAccess){
                item.text = info.text;
                item.isAccess = info.isAccess
              }
            }else{
              item.text = item.post.text ? item.post.text : (item.post.imgs.length>0 ? '[Images]' : '') ;
            }
          }else{
            continue;
          }
        }else{ //reply
          item.notice_type = 'reply'
          //time
          item.time = getTimer(item.create_at)
          //user
          item.user = {}
          const res = await proxy.$axios.profile.get_user_info({
            account_id:item.comment ? item.comment.account_id : item.post.account_id,
            current_account_id: store.getters.accountId || ''
          });
          if(res.success){
            item.user = res.data;
          }
          //text
          if(item.type == 'comment'){
            if(item.comment.type == 'encrypt'){
              item.postType = 'encrypt'
              item.accessDrips =  item.comment.access.conditions ? formatAmount(item.comment.access.conditions[0]['DripCondition']['amount_to_access'],24) : 0;
              const info = await checkAccess(item);
              if(info.isAccess){
                item.text = info.text;
                item.isAccess = info.isAccess
              }
            }else{
              item.text = item.comment.text;
            }  
          }else{
            continue;
          }   
        }
        list.push(item);
      }
      return list;
    }

    const checkAccess = async (item) => {
      //decrypt
      const postId = item.type == 'post' ? item.post.target_hash : item.comment.target_hash;
      const res = await proxy.$axios.post.get_decode_content({
        post_id:postId,
        account_id:store.getters.accountId
      });
      if(res.success){
        return {
          text:res.data.text ? res.data.text : '[Images]',
          isAccess:true
        }
      }
      return {isAccess:false}
    }

    //handleScroll
    const handleScroll = async () => {
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd){
        await getList();
      }
    }

    return {
      ...toRefs(state),
      init,
      handleScroll
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
    .title{
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      line-height:22px;
    }
    .loading-box{
      width:690px;
      margin-top:20px;
      min-height:100px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .list{
      width:690px;
      padding:0 20px;
      margin-top:20px;
      background: #28282D;
      border-radius: 24px;
      >div:last-child{
        border:0;
      }
      .content-item{
        padding:20px 0;
        border-bottom:1px solid rgba(255,255,255,0.1);
        cursor: pointer;
        .user{
          height:40px;
          display:flex;
          align-items: center;
          position: relative;
          .avatar{
            width: 40px;
            height: 40px;
            border-radius:50%;
            object-fit: cover;
          }
          .user-info{
            margin-left:12px;
            width:300px;
            .name{
              display:inline-block;
              width:auto;
              max-width:300px;
              font-family: D-DINExp-Bold;
              height: 18px;
              line-height:18px;
              font-size: 18px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              position: relative;
            }
            .createtime{
              display:inline-block;
              width:auto;
              max-width:300px;
              margin-top:4px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              cursor:pointer;
            }
          }
        }
        .reply-user{
          margin:10px 0;
          font-family: D-DINExp;
          font-size: 16px;
          color: rgba(255,255,255,0.50);
          letter-spacing: 0;
          line-height: 17px;
          font-weight: 400;
          span{
            color: #FED23C;
            cursor: pointer;
          }
        }
        .text{
          margin-top:10px;
          font-family: D-DINExp;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: justify;
          line-height: 26px;
          font-weight: 400;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .default-content{
          padding: 120px 0 64px;
          background: #36363C url('@/assets/images/post-item/icon-lock-gray.png') no-repeat center 64px;
          background-size:40px 40px;
          border-radius: 10px;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          text-align: center;
          font-weight: 400;
          line-height:16px;
          margin-top:20px;
        }
      }
      .like-item,.follow-item{
        border-bottom:1px solid rgba(255,255,255,0.1);
        padding: 20px 0;
        cursor: pointer;
        .avatar-list{
          display: flex;
          height:40px;
          position: relative;
          &:after{
            display: block;
            content:"";
            position:absolute;
            top:0;
            left:0;
            right:0;
            bottom:0;
            background:url('@/assets/images/notice/mask.png') no-repeat left top;
            background-size:100% 100%;
          }
          .avatar{
            width:40px;
            height:40px;
            border-radius:50%;
            object-fit: cover;
            margin-right:16px;
          }
          .hide-list{
            position:absolute;
            top:0;
            left:0;
            height:40px;
            display: flex;
            z-index:2;
            .hide-item{
              width:40px;
              height:40px;
              border-radius:50%;
              margin-right:16px;
            }
          }
        }
        .intro{
          margin-top:16px;
          height: 20px;
          font-family: D-DINExp;
          font-size: 16px;
          color: rgba(255,255,255,0.50);
          letter-spacing: 0;
          line-height: 20px;
          font-weight: 400;
          display:flex;
          align-items: center;
          padding-left:24px;
          background:url('@/assets/images/notice/icon-like.png') no-repeat left center;
          background-size:20px 20px;
          a{
            display:inline-block;
            height: 20px;
          }
          span{
            display:inline-block;
            max-width: 100px;
            color: rgba(255,255,255,1);
            margin:0 4px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            word-break: break-word;
          }
        }
        .text{
          margin-top:16px;
          padding:16px 20px;
          background: #111113;
          border-radius: 10px;
          font-family: D-DINExp;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: justify;
          line-height: 24px;
          font-weight: 400;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
      .follow-item{
        .intro{
          background:url('@/assets/images/notice/icon-users.png') no-repeat left center;
          background-size:20px 20px;
        }
      }

    }
    .no-result{
      margin-top:20px;
    }
  }
}
</style>
