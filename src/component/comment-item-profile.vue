<template>
  <div class="comment-item-box" v-if="!isBlocked && !hasDelete">
    <div :class="['comment-item']" @click.self="redirectPage(`/detail/${item.hierarchies[0]['target_hash']}?comment=${item.target_hash}`)">
      <!-- user -->
      <div class="user" v-if="$props.item.data">
        <!-- avatar -->
        <el-popover placement="bottom" :fallback-placements="[ 'top']"  trigger="hover" @show="showUser=true" @hide="showUser=false">
          <template #reference>
            <router-link :to="'/user-profile/'+item.account_id">
              <img v-if="userInfo.avatar" class="avatar" :src="$store.getters.getAwsImg(userInfo.avatar)" @error.once="$event.target.src=userInfo.avatar"/>
              <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
            </router-link>
          </template>
          <template v-if="showUser">
            <UserPopup :account="item.account_id" @login="showLogin=true"/>
          </template>
        </el-popover>

        <!-- userinfo -->
        <div class="user-info">
          <div class="name">
            <router-link :to="'/user-profile/'+item.account_id">
              <div class="name-txt txt-wrap">{{userInfo.name || item.account_id}}</div>
            </router-link>
          </div>
          <template v-if="item.reply_target_hash || item.extra?.reply_target_hash">
            <div class="reply-icon"></div>
            <div class="name" >
              <router-link :to="'/user-profile/'+item.data.reply">
                <div class="name-txt txt-wrap">{{item.data.reply_name || item.data.reply}}</div>
              </router-link>
            </div>
          </template>
        </div>
      </div>

      <!-- edit -->
      <el-popover placement="bottom"  trigger="click" popper-class="edit-popper">
        <template #reference>
          <div class="edit-button"></div>
        </template>
        <div class="pop-box pop-edit">
          <!-- self -->
          <template v-if="item.account_id == $store.getters.accountId">
            <div class="pop-edit-item" @click.stop="del()">
              <img class="icon16" src="@/assets/images/post-item/icon-delete.png"/>
              Delete
            </div>
          </template>
          <!-- other people -->
          <template v-else>
            <div class="pop-edit-item" @click.stop="report()">
              <img class="icon16" src="@/assets/images/post-item/icon-report.png"/>
              Report
            </div>
            <div class="pop-edit-item" @click.stop="block()">
              <img class="icon16" src="@/assets/images/post-item/icon-block.png"/>
              Block
            </div>
          </template>
          <a class="pop-edit-item" :href="$store.state.nearConfig.explorerUrl+'/transactions/'+item.transaction_hash" target="_blank">
            <img class="icon16" src="@/assets/images/post-item/icon-link.png"/>
            Tx
          </a>
        </div>
      </el-popover>
      

      <!-- text -->
      <div v-if="item.type=='encrypt' && !isAccess" class="default-content">
        Hold at least {{accessDrips}} Drips in this community to unlock this content.
      </div>
      <div v-else class="text text-ellipsis-wrapper">
        <div ref="textBox" :class="['txt','txt-wrap5',needWrap ? '' : 'hidebtn', showall? 'showall' : '']" :style="textStyleObject">
          <!--<pre>{{text}}</pre>-->
          <label class="btn" @click.stop="showall = !showall"></label>
          <pre ref="textDom"><div v-html="text" @click.stop="textJump"></div></pre>
        </div>
      </div>
      
      <!-- info-bottom -->
      <div class="info-bottom" @click.self="redirectPage(`/detail/${item.hierarchies[0]['target_hash']}?comment=${item.target_hash}`)">
        <div class="info-left">
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <div class="createtime">{{time.showTime}}</div>
            </template>
            <div class="pop-box pop-tip">{{time.hoverTime}}</div>
          </el-popover>
        </div>
        <div class="info-right">
          <!-- share -->
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <div class="share" @click.stop="">
                <template v-if="shareCount">{{formatCount(shareCount)}}</template>
              </div>
            </template>
            <div class="pop-box pop-edit">
              <div class="pop-edit-item" @click.stop="shareTwitter()">
                <img class="icon16" src="@/assets/images/post-item/icon-twitter-mini.png"/>
                Twitter
              </div>
              <div class="pop-edit-item" @click.stop="triggerCopy(post.target_hash,true)">
                <img class="icon16" src="@/assets/images/post-item/icon-link.png"/>
                Copy link
              </div>
            </div>
          </el-popover>
          <!-- reply -->
          <div :class="['comment',addCount ? 'add-count' : '']" @click.stop="reply()">
            <template v-if="commentCount>0">{{formatCount(commentCount)}}</template>
          </div>
          <!-- like -->
          <Like :item="like" :unJoinCommunity="$props.unJoinCommunity" :type="'comment'"/>
        </div>
      </div>

      <!-- comment -->
      <div class="comment-box" v-if="$props.item.isComment">
        <Comment 
          :targetHash="item.target_hash" 
          :parentAccount="item.account_id"
          :replyUser="userInfo.name || item.account_id"
          :hierarchies="item.hierarchies"
          :communityId="item.receiver_id" 
          :postType="item.type"
          :from="'list'"
          :focus="focusComment"
          @addNewComment="addNewComment"
        />
      </div>

      <!-- childComments -->
      <div class="child-comments" v-if="childComments.length > 0">
        <div ref="childBox">
          <template v-for="child in childComments" :key="child.create_at">
            <CommentItemNew 
              :from="'child'"
              :community="{}" 
              :post="{}" 
              :item="child"
              @addNewComment="addNewComment"
              @changeListStatus="changeListStatus(child,$event)"
              />
          </template>
        </div>
      </div>
    </div>


    <!-- #copy_text  display:none;  -->
    <div :data-clipboard-text="copyText" ref="copy_text"  :id="'copy_text'+item.target_hash" @click="handleCopyFun"></div>

    <!-- login-mask -->
    <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>


    <!-- ConfirmModal -->
    <template v-if="showReportModal">
      <ConfirmModal :title="'Report'" :intro="'I think this comments has offended me.'" @cancel="showReportModal=false" @confirm="reportConfirm"/>
    </template>
    <template v-if="showDeleteModal">
      <ConfirmModal :title="'Delete'" :intro="'This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.'" @cancel="showDeleteModal=false" @confirm="deleteConfirm"/>
    </template>
    <template v-if="showBlockModal">
      <ConfirmModal :title="'Block'" :intro="'This will hide this comments from your posts as well as hide them from your view on your explore and other threads.'" @cancel="showBlockModal=false" @confirm="blockConfirm"/>
    </template>
  </div>
</template>

<script>
import { ref, reactive, toRefs , watch, nextTick, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import MainContract from "@/contract/MainContract";
import CommunityContract from "@/contract/CommunityContract";
import { formatAmount, checkCondition, getTimer, formatCount} from "@/utils/util.js";
import { copyText } from 'vue3-clipboard';
import Comment from '@/component/comment.vue';
import CommentItemNew from '@/component/comment-item-new.vue';
import UserPopup from '@/component/user-popup.vue';
import Like from "@/component/like.vue";
import LoginMask from "@/component/login-mask.vue";
import ConfirmModal from '@/component/confirm-modal.vue';
import * as bs58 from 'bs58';
export default {
  components: {
    Comment,
    CommentItemNew,
    UserPopup,
    Like,
    LoginMask,
    ConfirmModal
  },
  props:{
    user:{
      type:Object,
      value:{}
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
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const mainContract = new MainContract(store.state.account);

    const state = reactive({

      post:{
        accountId:'',
        target_hash:props.item.postId,
        methodName:props.item.type=='encrypt'?'add_encrypt_content':'add_content'
      },
      //user
      userInfo:{},
      showUser:false,
      //time
      time:{
        showTime:"",
        hoverTime:""
      },
      isAccess:false,
      accessDrips:0,
      //text
      text:"",
      needWrap:true,
      //gas
      gasUsed:formatAmount(props.item.gas_used,24,4),
      //share & like & comment
      shareCount:props.item.data.share_count,
      like:{
        hierarchies:props.item.hierarchies,
        accountId:props.item.account_id,
        likeCount:props.item.data.like_count,
        isLiked:props.item.data.is_like,
        targetHash:props.item.target_hash,
        communityId:(props.item.receiver_id == store.state.nearConfig.MAIN_CONTRACT || props.item.receiver_id == store.state.nearConfig.NFT_CONTRACT) ? "" : props.item.receiver_id
      },
      //child comment
      commentCount:props.item.data.comment_count,
      //childComments
      childComments:[],
      //report | delete | block
      showReportModal:false,
      showDeleteModal:false,
      showBlockModal:false,
      //other
      showall:false,
      copyText:"",
      showLogin:false,
      isBlocked:true,
      focusComment:false,
      addCount:false,
      hasDelete:false,
      showReplyUser:false,
    })

    //text wrap
    const textBox = ref()
    const textDom = ref()
    watch(
      () => textDom.value,
      (newVal) => {
        if(newVal){
          const textBoxHeight = textBox.value.getBoundingClientRect().height;
          const textDomHeight = textDom.value.getBoundingClientRect().height;
          if(textBoxHeight>=textDomHeight){
            state.needWrap = false;
          }else{
            state.needWrap = true;
          }
        }
      }
    )

    const init = async() => {
      //filter blockList
      if(isInBlockList()) return;
      state.isBlocked = false;

      //time
      state.time = getTimer(props.item.create_at)
      //text
      if(props.item.type !== 'encrypt'){
        state.text = props.item.text;
      }else{
        checkAccess();
      }
      //user
      if(props.item.account_id != props.user.account_id){
        const res = await proxy.$axios.profile.get_user_info({
          account_id:props.item.account_id,
          current_account_id: store.getters.accountId || ''
        });
        if(res.success){
          state.userInfo = res.data;
        }
      }else{
        state.userInfo = props.user;
      }
    }

    const checkAccess = async () => {
      state.accessDrips = formatAmount(props.item.access.conditions[0]['DripCondition']['amount_to_access'],24);
      let check_result = {}
      if(store.getters.accountId!=props.item.account_id){
        check_result = await proxy.$axios.drip.get_user_community_points_detail({
          account_id:store.getters.accountId || "",
          community_id:props.item.receiver_id,
        });
      }
      if((check_result.success && check_result.data.available_drips/10000 >= state.accessDrips) || store.getters.accountId==props.item.account_id){
        //decrypt
        const res = await proxy.$axios.post.get_decode_content({
          post_id:props.item.target_hash,
          account_id:store.getters.accountId || ''
        });
        if(res.success){
          state.text = res.data.text;
          state.isAccess = true;
        }
      }
      state.isChecking = false
    }

    const isInBlockList = () => {
      const commentBlockList = JSON.parse(localStorage.getItem("commentBlockList")) || [];
      let isBlocked = false;
      commentBlockList.forEach(item=>{
        if(item==props.item.target_hash){isBlocked = true;}
      })
      if(isBlocked){
        return true;
      }
      return false;
    }

    //comment
    const reply = () => {
      if(checkLogin()){
        if(props.unJoinCommunity){
          proxy.$Message({
            message: "Only community members can operate, please join the community first",
            type: "warn",
          });
          return;
        }

        if(props.item.type=='encrypt' && !state.isAccess){
          proxy.$Message({message: "You do not have permission to comment on the current post"});
          return;
        }
        state.focusComment=true;
        // state.showCommentBox=!state.showCommentBox;
        if(props.item.isComment){
          emit("changeListStatus",true);
        }else{
          emit("changeListStatus");
        }
        //childComments close
        state.childComments.forEach(i=>{
          i.isComment = false;
        })
      }
    }

    const addNewComment = (item) => {
      emit("changeListStatus",true);
      state.addCount = true;
      setTimeout(()=>{
        state.addCount = false;
        state.commentCount += 1;
      },500)
      state.childComments.unshift(item);
    }


    //changeListStatus
    const changeListStatus = (item,close=false) => {
      emit("changeListStatus",true);
      state.childComments.forEach(i=>{
        if(i==item && !close){
          i.isComment = true;
        }else{
          i.isComment = false;
        }
      })
    }

    //shareLink
    const getShareLink = () => {
      const parmsJson = JSON.stringify({
        type:'content',
        args:{
          hierarchies:[
            ...props.item.hierarchies,
            {target_hash:props.item.target_hash,account_id : props.item.account_id}
          ],
          inviter_id:store.getters.accountId || '',
          contract_id: props.item.receiver_id
        }
      })
      const signature = bs58.encode(Buffer.from(parmsJson));
      return `${window.location.protocol}//${window.location.host}/share/${signature}`;
    }

    const shareRecord = () => {
    }


    //share -> handleCopy
    const copy_text = ref()
    const triggerCopy = (str,isShare) => {
      state.copyText = isShare ? getShareLink() : str;
      nextTick(() => {
        copy_text.value.click();
      });
    }
    const handleCopyFun = () => { 
      copyText(state.copyText, undefined, (error, event) => {
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

    //checkLogin
    const checkLogin = () => {
      if(!store.getters.isLogin){
        state.showLogin = true;
        return false;
      }else{
        return true;
      }
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    //redirectPage
    const redirectPage = (path) => {
      router.push(path);
    };

    const textJump = (e) => {
      if(e.target.className=='atFont'){
        e.preventDefault();
        redirectPage(`/user-profile/${e.target.textContent.trim().slice(1)}`)
      }else{
        redirectPage(`/detail/${props.item.hierarchies[0]['target_hash']}?comment=${props.item.target_hash}`)
      }
    }

    //edit
    const del = async () => {
      if(checkLogin()){
        if(props.unJoinCommunity){
          proxy.$Message({
            message: "Only community members can operate, please join the community first",
            type: "warn",
          });
          return;
        }

        state.showDeleteModal = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
    }
    const deleteConfirm = async () => {
      if(checkLogin()){
        const params = {
          hierarchies : [
            ...props.item.hierarchies,
            {
              target_hash : props.item.target_hash,
              account_id : props.item.account_id,
            }
          ]
        }
        let res = {}
        if(props.item.receiver_id == store.state.nearConfig.MAIN_CONTRACT || props.item.receiver_id == store.state.nearConfig.NFT_CONTRACT){
          res = await mainContract.delContent(params); 
        }else{
          const communityContract = await CommunityContract.new(props.item.receiver_id);
          res = await communityContract.delContent(params);
        }
        if (res.status == 'pending' || res.status == 'success') {
          state.showDeleteModal = false;
          state.hasDelete = true;
          // proxy.$Message({
          //   message: "delete success",
          //   type: "success",
          // });
        } else if (res.status == 'fail') {
          state.showDeleteModal = false;
          proxy.$Message({
            message: "Delete Failed",
            type: "error",
          });
        }
      }
    }

    const report = async () => {
      if(checkLogin()){
        if(props.unJoinCommunity){
          proxy.$Message({
            message: "Only community members can operate, please join the community first",
            type: "warn",
          });
          return;
        }

        state.showReportModal = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
    }
    const reportConfirm = async () => {
      if(checkLogin()){
        const params = {
          hierarchies : [
            ...props.item.hierarchies,
            {
              target_hash : props.item.target_hash,
              account_id : props.item.account_id,
            }
          ]
        }
        let res = ''
        if(props.item.receiver_id == store.state.nearConfig.MAIN_CONTRACT || props.item.receiver_id == store.state.nearConfig.NFT_CONTRACT){
          reset = await mainContract.report(params); 
        }else{
          const communityContract = await CommunityContract.new(props.item.receiver_id);
          res = await communityContract.report(params);
        }
        if (res.status == 'pending' || res.status == 'success') {
          state.showReportModal = false;
          proxy.$Message({
            message: "report success",
            type: "success",
          });
        } else {
          state.showReportModal = false;
          console.log("report error:"+e);
          proxy.$Message({
            message: "Report Failed",
            type: "error",
          });
        }
      }
    }
    const block = async () => {
      if(checkLogin()){
        state.showBlockModal = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
    }
    const blockConfirm = async () => {
      if(checkLogin()){
        const commentBlockList = JSON.parse(localStorage.getItem("commentBlockList")) || [];
        let isBlocked = false;
        commentBlockList.forEach(item=>{
          if(item==props.item.target_hash){isBlocked = true;}
        })
        if(!isBlocked){
          commentBlockList.push(props.item.target_hash);
          localStorage.setItem("commentBlockList",JSON.stringify(commentBlockList));
        }
        state.showBlockModal = false;
        proxy.$Message({type: "success",message: "block success"});
        state.isBlocked = true;
      }
    }

    const shareTwitter = async () => {
      shareRecord();
      window.open('https://twitter.com/intent/tweet?text='+getShareLink());
    }


    return {
      ...toRefs(state),
      init,
      textBox,
      textDom,
      reply,
      addNewComment,
      changeListStatus,
      copy_text,
      triggerCopy,
      handleCopyFun,
      showLoginMask,
      closeLoginMask,
      redirectPage,
      textJump,
      del,
      deleteConfirm,
      report,
      reportConfirm,
      block,
      blockConfirm,
      shareTwitter,
      formatCount
    };
  },
  mounted(){
    this.init();
  }
}
</script>
<style lang="scss" scoped>
  .comment-item-box{
    &:first-child{
      .comment-item{
        border:0;
      }
    }
  }
  .comment-item{
    padding:30px 0;
    border-top:1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    position: relative;
    .user{
      width:auto;
      height:40px;
      display:inline-block;
      .avatar{
        display:inline-block;
        width: 40px;
        height: 40px;
        border-radius:50%;
        cursor: pointer;
        object-fit: cover;
      }
      .user-info{
        display:inline-block;
        margin-left:12px;
        max-width:300px;
        .name{
          height: 40px;
          display:flex;
          align-items: center;
          .name-txt{
            max-width: 300px;
            font-family: D-DINExp-Bold;
            height: 40px;
            line-height:40px;
            font-size: 18px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            cursor: pointer;
          }
        }
      }
    }
    .edit-button{
      position: absolute;
      top:17px;
      right:0;
      cursor: pointer;
      width:30px;
      height:30px;
      background:url("@/assets/images/post-item/icon-more.png") no-repeat center center;
      background-size:24px;
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
    .text{

      margin-top:20px;
      font-family: D-DINExp;
      font-size: 16px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: justify;
      line-height: 26px;
      font-weight: 400;
      cursor: pointer;
      pre{
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: D-DINExp;
        font-size: 16px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: justify;
        line-height: 26px;
        font-weight: 400;
      }
    }
    .info-bottom{
      height:25px;
      margin-top:20px;
      display:flex;
      justify-content:space-between;
      cursor: pointer;
      .info-left{
        display:flex;
       
        .createtime{
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          cursor:pointer;
        }
        
      }
      .info-right{
        display:flex;
        justify-content:space-between;
        >div{
          margin-left:30px;
          padding-left:30px;
          font-family: D-DINExp;
          font-size: 14px;
          line-height:24px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: right;
          font-weight: 400;
          cursor:pointer;
          &.share{
            background:url("@/assets/images/post-item/icon-share.png") no-repeat left center;
            background-size:24px 24px;
            &:hover{
              background-image:url("@/assets/images/post-item/icon-share-hover.png");
            }
          }
          &.comment{
            background:url("@/assets/images/post-item/icon-comment.png") no-repeat left center;
            background-size:24px 24px;
            &:hover{
              background-image:url("@/assets/images/post-item/icon-comment-hover.png");
            }
          }
          &.like{
            background:url("@/assets/images/post-item/icon-unlike.png") no-repeat left center;
            background-size:24px 24px;
            &:hover{
              background-image:url("@/assets/images/post-item/icon-unlike-hover.png");
            }
            &.liked{
              background-image:url("@/assets/images/post-item/icon-like.png");
            }
          }
        }
        
      }
    }
    .child-comments{
      padding-left:52px;
    }
  }
</style>
