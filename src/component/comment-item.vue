<template>
  <div :class="['comment-item-box',from+'-comment-item-box',item.isShare ? 'highlight' : '']" v-if="!isBlocked && !hasDelete">
    <div class="comment-item">
      <!-- user -->
      <div class="user" v-if="$props.item.data">
        <!-- avatar -->
        <el-popover placement="bottom" :fallback-placements="[ 'top']"  trigger="hover" @show="showUser=true" @hide="showUser=false">
          <template #reference>
            <router-link :to="'/user-profile/'+item.account_id">
              <img v-if="user.avatar" class="avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
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
              <div class="name-txt txt-wrap">{{user.name || item.account_id}}</div>
            </router-link>
            <!-- CO -->
            <template v-if="$props.community.account_id == item.account_id">
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
            <!-- PO -->
            <template v-if="$props.post.account_id == item.account_id">
              <el-popover
                placement="bottom-start"
                trigger="hover"
                >
                <template #reference>
                  <div class="user-flag op"></div>
                </template>
                <div class="pop-box pop-tip pop-user-flag">Original Poster</div>
              </el-popover>
            </template>
          </div>
          <template v-if="$props.item.reply_target_hash || $props.item.extra?.reply_target_hash">
            <div class="reply-icon"></div>
            <div class="name" >
              <router-link :to="'/user-profile/'+$props.item.data.reply">
                <div class="name-txt txt-wrap">{{$props.item.data.reply_name || $props.item.data.reply}}</div>
              </router-link>
              <!-- CO -->
              <template v-if="$props.community.account_id == $props.item.data.reply">
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
              <!-- PO -->
              <template v-if="$props.post.account_id == $props.item.data.reply">
                <el-popover
                  placement="bottom-start"
                  trigger="hover"
                  >
                  <template #reference>
                    <div class="user-flag op"></div>
                  </template>
                  <div class="pop-box pop-tip pop-user-flag">Original Poster</div>
                </el-popover>
              </template>
            </div>
          </template>
        </div>

        <!-- edit -->
        <el-popover placement="bottom"  trigger="click" popper-class="edit-popper">
          <template #reference>
            <div class="edit-button"></div>
          </template>
          <div class="pop-box pop-edit">
            <!-- self -->
            <template v-if="user.account_id == $store.getters.accountId">
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
      </div>

      <!-- text -->
      <div class="text text-ellipsis-wrapper">
        <div ref="textBox" :class="['txt','txt-wrap5',needWrap ? '' : 'hidebtn', showall? 'showall' : '']" :style="textStyleObject">
          <!--<pre>{{text}}</pre>-->
          <label class="btn" @click.stop="showall = !showall"></label>
          <pre ref="textDom"><div v-html="text" @click.stop="textJump"></div></pre>
        </div>
      </div>
      
      <!-- info-bottom -->
      <div class="info-bottom">
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
          <Like :item="like" :unJoinCommunity="$props.unJoinCommunity" :type="'comment'" @changeLike="changeLike"/>
        </div>
      </div>

      <!-- comment -->
      <div class="comment-box" v-if="$props.item.isComment">
        <Comment 
          :targetHash="item.target_hash" 
          :parentAccount="item.account_id"
          :replyUser="user.name || item.account_id"
          :hierarchies="item.hierarchies"
          :communityId="item.receiver_id" 
          :postType="post.type" 
          :from="'child'"
          :focus="focusComment"
          @addNewComment="addNewComment"
        />
      </div>


      <!-- childComments -->
      <div class="child-comments" v-if="commentCount > 0 && $props.item.hierarchies.length == 1">
        <template v-if="defaultChild">
          <CommentItem 
            :from="childComments.length > 0 ? 'child' : 'share'"
            :community="$props.community" 
            :post="$props.post" 
            :item="defaultChild"
            @addNewComment="addNewComment"
            @changeListStatus="changeListStatus(defaultChild,$event)"/>
        </template>
        <div ref="childBox">
          <template v-for="(child,index) in childComments" :key="child.create_at">
            <template v-if="child.isNewComment">
              <CommentItemNew 
              :from="'child'"
              :community="$props.community" 
              :post="$props.post" 
              :item="child"
              @addNewComment="addNewComment"
              @changeListStatus="changeListStatus(child,$event)"/>
            </template>
            <template v-else-if="!defaultChild || child.target_hash != defaultChild.target_hash">
              <CommentItem 
                :from="'child'"
                :community="$props.community" 
                :post="$props.post" 
                :item="child"
                :unJoinCommunity="$props.unJoinCommunity"
                @addNewComment="addNewComment"
                @changeListStatus="changeListStatus(child,$event)"/>
            </template>
          </template>
        </div>
        <!-- loading -->
        <div class="loading-box" v-if="isLoading">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </div>
        <div class="collapse-btn-box">
          <div class="collapse-btn load-more" v-if="!isLoading && childComments.length < commentCount && (defaultChild && commentCount - 1 > 0 || !defaultChild)"  @click="loadMoreComments()">
            <template v-if="defaultChild && commentCount - 1 > 0">View more replies ({{commentCount - childComments.length - 1}})</template>
            <template v-else-if="!defaultChild">View more replies ({{commentCount - childComments.length}})</template>
          </div>
          <div class="collapse-btn hide-list" v-if="!isLoading && childComments.length > 0"  @click="hideComments()">Hide</div>
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
import { formatAmount, getTimer, formatCount} from "@/utils/util.js";
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
    from:{
      type:String,
      value:""
    },
    community:{
      type:Object,
      value:{}
    },
    post:{
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
      //user
      user:props.item.data.user || props.user || {},
      showUser:false,
      //time
      time:{
        showTime:"",
        hoverTime:""
      },
      //text
      text:"",
      needWrap:true,
      //share & like & comment
      detail:{},
      shareCount:props.item.data.share_count,
      like:{
        hierarchies:props.item.hierarchies,
        accountId:props.item.account_id,
        likeCount:props.item.data.like_count,
        isLiked:props.item.data.is_like,  
        targetHash:props.item.target_hash,
        communityId:(props.item.receiver_id == store.state.nearConfig.MAIN_CONTRACT || props.item.receiver_id == store.state.nearConfig.NFT_CONTRACT) ? "" : props.item.receiver_id,
      },
      commentCount:props.item.data.comment_count,
      //child comment
      childComments:[],
      defaultChild:props.item.child,
      isLoading:false,
      isEnd:false,
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

    //toggleState
    watch(
      () => props.item.toggleState,
      (newVal) => {
        //childComments close
        state.childComments.forEach(i=>{
          i.isComment = false;
        })
      }
    )

    const init = async() => {
      //filter blockList
      if(isInBlockList()) return;
      state.isBlocked = false;

      //time
      state.time = getTimer(props.item.create_at)
      //text
      let text = "";
      if(props.item.type != 'encrypt'){
        text = props.item.text
      }else{
        //decrypt
        const res = await proxy.$axios.post.get_decode_content({
          post_id:props.item.target_hash,   //postId=>commentId
          account_id:store.getters.accountId
        });
        if(res.success){
          text = res.data.text;
        }
      }
      state.text = text;
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

    //click to reply
    const reply = () => {
      if(checkLogin()){
        if(props.unJoinCommunity){
          proxy.$Message({
            message: "Only community members can operate, please join the community first",
            type: "warn",
          });
          return;
        }

        state.focusComment=true;
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
      if(props.item.hierarchies.length === 1){ //level1
        state.childComments.unshift(item);
        emit('comment'); //commentCount
      }else{
        emit("addNewComment",item)
      }
    }

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
            {target_hash:props.item.target_hash,account_id : props.item.account_id},
          ],
          inviter_id:store.getters.accountId || '',
          contract_id: props.item.receiver_id
        }
      })
      const signature = bs58.encode(Buffer.from(parmsJson));
      return `${window.location.protocol}//${window.location.host}/share/${signature}`;
    }

    const shareRecord = () => {}

    //share -> handleCopy
    const copy_text = ref()
    const triggerCopy = async (str,isShare) => {
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

    //changeLike
    const changeLike = (res) => {
      state.like.likeCount = res.likeCount;
      state.like.isLiked = res.isLiked;
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


    const textJump = (e) => {
      if(e.target.className=='atFont'){
        e.preventDefault();
        router.push(`/user-profile/${e.target.textContent.trim().slice(1)}`)
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
        let res = ''
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
          res = await mainContract.report(params); 
        }else{
          const communityContract = await CommunityContract.new(props.item.receiver_id);
          res = await communityContract.report(params);
        }
        if (res.status == 'pending' || res.status == 'success') {
          state.showReportModal = false;
          // proxy.$Message({
          //   message: "report success",
          //   type: "success",
          // });
        } else {
          state.showReportModal = false;
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

    const loadMoreComments = async () => {
      state.isLoading = true;
      const res = await proxy.$axios.comment.get_comment_tree({
        post_id: props.item.target_hash,
        account_id:store.getters.accountId || '',
        limit:(state.childComments.length==0 && state.commentCount>10) ? 3 : (state.childComments.length == 3 ? 7 : 10), 
        comment_id:state.childComments.length>0 ? state.childComments[state.childComments.length-1]['_id'] : null,
      });
      if(res.success){
        state.childComments = state.childComments.concat(res.data);
        state.isLoading = false;
      }
    }

    const childBox = ref();
    const hideComments = () => {
      state.childComments = [];
      const childCommentsHeight = childBox.value.getBoundingClientRect().height;
      if(childCommentsHeight>window.innerHeight){
        document.body.scrollTop = document.documentElement.scrollTop = document.documentElement.scrollTop - childBox.value.getBoundingClientRect().height;
      }
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
      changeLike,
      showLoginMask,
      closeLoginMask,
      textJump,
      del,
      deleteConfirm,
      report,
      reportConfirm,
      block,
      blockConfirm,
      shareTwitter,
      childBox,
      loadMoreComments,
      hideComments,
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
    padding:0 20px;
    &:first-child{
      .comment-item{
        border:0;
      }
    }
    &.child-comment-item-box,&.share-comment-item-box{
      margin-top:30px;
      padding:0;
      .comment-item{
        border:0;
      }
      .comment-item{
        padding:0;
        position:relative;
        &::after{
          display:block;
          content:'';
          position:absolute;
          width:2px;
          height:calc(100% - 40px - 16px + 30px);
          top:48px;
          left:19px;
          background: rgba(255,255,255,0.1);
          border-radius:4px;
        }
      }
      &:last-child{
          .comment-item{
            &::after{
              display:none;
            }
          }
      }
    }
    &.share-comment-item-box{
      .comment-item{
        &::after{
          display:none;
        }
      }
    }
    &.highlight{
      border-top-left-radius: 24px;
      border-top-right-radius:24px;
      -webkit-animation:shareBackground 10s linear 1;
      animation:shareBackground 10s linear 1;
      &:only-child{
        border-radius: 24px;
      }
    }
    @-webkit-keyframes shareBackground{
      0%{ background:rgba(255,255,255,0.06);}
      100%{ background:transparent;}
    }
    @keyframes shareBackground{
        0%{ background:rgba(255,255,255,0.06);}
        100%{ background:transparent;}
    }

  }
  .comment-item{
    padding:30px 0;
    border-top:1px solid rgba(255,255,255,0.1);
    .user{
      height:40px;
      display:flex;
      align-items: center;
      position: relative;
      .avatar{
        width: 40px;
        height: 40px;
        border-radius:50%;
        cursor: pointer;
        object-fit: cover;
      }
      .user-info{
        margin-left:12px;
        display:flex;
        align-items: center;
        .name{
          height: 18px;
          display:flex;
          align-items: center;
          .name-txt{
            max-width: 200px;
            font-family: D-DINExp-Bold;
            height: 18px;
            line-height:18px;
            font-size: 18px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            cursor: pointer;
          }
        }
        .reply-icon{
          margin:0 6px;
          width:12px;
          height:12px;
          background:url("@/assets/images/post-item/icon-reply.png") no-repeat center center;
          background-size:12px;
        }
      }
      .edit-button{
        position: absolute;
        top:-3px;
        right:0;
        cursor: pointer;
        width:30px;
        height:30px;
        background:url("@/assets/images/post-item/icon-more.png") no-repeat center center;
        background-size:24px;
      }
    }
    .text{
      padding-left:52px;
      margin-top:20px;
      font-family: D-DINExp;
      font-size: 16px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: justify;
      line-height: 26px;
      font-weight: 400;
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
      .info-left{
        display:flex;
        margin-left:52px;
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
      .loading-box{
        height:50px;
        display:flex;
        align-items: center;
        justify-content:center;
      }
      .collapse-btn-box{
        display:flex;
        align-items: center;
        .collapse-btn{
          margin-top:20px;
          display:inline-block;
          font-family: D-DINExp;
          font-size: 14px;
          line-height:20px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          margin-right:30px;
          padding-right:20px;
          cursor: pointer;
          &.load-more{
            background:url("@/assets/images/post-item/icon-open.png") no-repeat right center;
            background-size:12px;
          }
          &.hide-list{
            background:url("@/assets/images/post-item/icon-hide.png") no-repeat right center;
            background-size:12px;
          }
        }
      }
      
    }
  }
</style>
