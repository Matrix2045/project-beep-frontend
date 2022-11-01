<template>
  <div :class="['comment','comment-reply-'+$props.from]" @click.stop="">
    <!-- text -->
    <div class="input-box">
      <div
        class="div-input"
        ref="commentInput"
        contenteditable
        @keydown.capture="onCheck"
        @keyup.capture="onChange"
        @focus="checkLogin"
        @click="onClick"
        @paste="onPaste"
      />
      <div v-if="!text" class="placeholder">Add a comment.</div>
      <div class="pop-user-box">
        <div v-show="showUserList" ref="popUser" class="user-list">
          <div class="loading-box" v-if="isLoaingUserList">
            <img class="white-loading" src="@/assets/images/common/loading.png"/>
          </div>
          <template v-else-if="userList.length>0">
            <template v-for="user in userList">
                <template v-if="user.data">
                  <el-popover placement="bottom-start"  trigger="hover" @show="user.showCreateUser=true" @hide="user.showCreateUser=false">
                    <template #reference>
                      <div class="user-item" @click="onSelectSubmit(user)">
                        <img v-if="user.avatar" class="user-avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
                        <img v-else  class="user-avatar" src="@/assets/images/common/user-default.png"/>
                        <div class="user-info">
                          <div class="user-name  txt-wrap" v-if="user.name">{{user.name}}</div>
                          <div class="user-account  txt-wrap">{{user.account_id}}</div>
                        </div>
                      </div>
                    </template>
                    <template v-if="user.showCreateUser">
                      <UserPopup :account="user.account_id" @login="showLogin=true"/>
                    </template>
                  </el-popover>
                </template>
                <template v-else>
                  <div class="user-item" @click="onSelectSubmit(user)">
                    <img v-if="user.avatar" class="user-avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
                    <img v-else  class="user-avatar" src="@/assets/images/common/user-default.png"/>
                    <div class="user-info">
                      <div class="user-name  txt-wrap" v-if="user.name">{{user.name}}</div>
                      <div class="user-account  txt-wrap">{{user.account_id}}</div>
                    </div>
                  </div>
                </template>
            </template>
          </template>
          <div v-else class="nobody">Nobody yet.</div>
        </div>
      </div>

      <div class="edit">
        <el-input v-model="text" @focus="checkLogin()" rows="1"  :autosize="true"  placeholder="Add a comment." maxlength="300"  type="textarea" :show-word-limit="text.trim().length>0" />
        <!-- emoji -->
        <div class="emoji-box" style="position:relative;">
          <discord-picker
            :value="value"
            gif-format="md"
            @update:value="value = $event"
            @emoji="setEmoji"
            @gif="setGif"
            :apiKey="'LIVDSRZULELA'"
          />
        </div>
        <!-- reply button -->
        <el-popover placement="bottom" :fallback-placements="[ 'top']"   trigger="click" >
          <template #reference>
            <div :class="['mini-button-border','button-reply',!text.trim() ? 'disabled' : '']">
              <div class="mini-button" @click="reply()">
                <img v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
                <template v-else>Reply</template>
              </div>
            </div>
          </template>
          <!-- comment notice -->
          <div class="pop-box pop-intro pop-notice" v-if="showNotice">
            <div class="title">Notice</div>
            <div class="intro">This action will be recorded as a transaction on Near Protocol. Transaction details can be viewed in <a href="https://wallet.testnet.near.org/" target="_blank">Recent Activity</a></div>
            <div class="button-box">
              <div class="mini-button-border button-cancel" @click.stop="showNotice=false">
                <div class="mini-button">Cancel</div>
              </div>
              <div class="mini-button-border" @click="confirmReply()">
                <div class="mini-button">Confirm</div>
              </div>
            </div>
          </div>
        </el-popover>


        <!-- <div :id="'pop-reply-notice'+targetHash" :class="['mini-button-border','button-reply',!text.trim() ? 'disabled' : '']">
          <div class="mini-button" @click="reply()">
            <img v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>Reply</template>
          </div>
          <div class="pop-box pop-intro pop-notice" v-if="showNotice">
            <div class="title">Notice</div>
            <div class="intro">This action will be recorded as a transaction on Near Protocol. Transaction details can be viewed in <a href="https://wallet.testnet.near.org/" target="_blank">Recent Activity</a></div>
            <div class="button-box">
              <div class="mini-button-border button-cancel" @click.stop="showNotice=false">
                <div class="mini-button">Cancel</div>
              </div>
              <div class="mini-button-border" @click="confirmReply()">
                <div class="mini-button">Confirm</div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
    <div v-if="unJoinCommunity" class="comment-mask">
      <img class="lock" src="@/assets/images/post-item/icon-lock.png"/>
      <div class="text">Need to join community</div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
import { ref, reactive, toRefs , onMounted ,watch, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import MainContract from "@/contract/MainContract";
import CommunityContract from "@/contract/CommunityContract";
import UserPopup from '@/component/user-popup.vue';
import LoginMask from "@/component/login-mask.vue";
import DiscordPicker from 'vue3-discordpicker';
export default {
  props:{
    unJoinCommunity:{
      type:Boolean,
      value:false
    },
    from:{
      type:String,
      value:""
    },
    identifier:{
      type:String,
      value:""
    },
    hierarchies:{
      type:Array,
      value:[]
    },
    parentAccount:{
      type:String,
      value:""
    },
    replyUser:{
      type:String,
      value:""
    },
    targetHash:{
      type:String,
      value:""
    },
    communityId:{
      type:String,
      value:""
    },
    postType:{
      type:String,
      value:""
    },
    focus:{
      type:Boolean,
      value:false
    }
  },
  components: {
    UserPopup,
    LoginMask,
    DiscordPicker
  },
  setup(props,{ emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const mainContract = new MainContract(store.state.account);

    //state
    const state = reactive({
      text:"",
      targetHash: props.targetHash,
      showNotice:false,
      showLogin:false,

      focusNode:null,
      focusOffset:null,
      start_index:null,
      end_index:null,
      isLoaingUserList:false,
      showUserList:false,
      userList:[],

      isLoading:false,
    })

    const commentInput = ref()
    watch(
      () => props.focus,
			() => {
        commentInput.value.focus()
			}
		)

    //init
    const init = () => {
      if(props.focus){
        commentInput.value.focus()
      }
    }
    //@
    const onCheck = (e) => {
      if(commentInput.value.textContent.length>=300 && e.key != 'Backspace'){
        e.preventDefault();
      }
    }
    const onPaste = (e) => {
      let text = '';
      let event = e.originalEvent || e ;
      if (event.clipboardData && event.clipboardData.getData) {
          text = event.clipboardData.getData('text/plain');
      } else if (window.clipboardData && window.clipboardData.getData) {
          text = window.clipboardData.getData('Text');
      }
      if(commentInput.value.textContent.length + text.length >=300 ){
        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text.slice(0,300-commentInput.value.textContent.length));
        } else {
            document.execCommand('paste', false, text.slice(0,300-commentInput.value.textContent.length));
        }
        e.preventDefault();
      }
    }
    const onClick = () => {
      const selection = window.getSelection()
      state.focusNode = selection.focusNode;
      state.focusOffset = selection.focusOffset;
      state.start_index = selection.focusOffset;
    }
    const onChange = async (e) => {
      const selection = window.getSelection()
      const text = selection.extentNode.nodeValue;
      state.text = commentInput.value.textContent;
      state.focusNode = selection.focusNode;
      state.focusOffset = selection.focusOffset;
      let start = Math.max(selection.focusOffset-21,0);
      let start_index = null;

      for(let i = selection.focusOffset-1;i>=start;i--){
        if(text.substring(i,i+1)=="@"){
          start_index = i;
          break;
        }
        if(i!=selection.focusOffset-1 && !(text[i].trim())){
          break;
        }
      }
      

      if(start_index!==null){
        let end = Math.min(start_index+21,text.length);
        let end_index = end;
        const start = Math.max(selection.focusOffset-1,0)
        for(let j = start;j<end;j++){
          if(text[j]==" " || text[j]=="@"){
            end_index = j;
            break;
          }
        }
        const str = text.substring(start_index+1,end_index).trim();
        if(str.length>2){
          state.focusNode = selection.focusNode;
          state.start_index = start_index;
          state.end_index = end_index;
          debounceInput(str);
        }else{
          state.showUserList = false;
        }
      }else{
        state.start_index = selection.focusOffset;
        state.showUserList = false;
      }
    }

    //selectUser @
    const searchUser = async (str) => {
      state.showUserList = true;
      state.isLoaingUserList = true;
      const res = await proxy.$axios.post.at({
        account_id:str,
      });
      if(res.success){
        const list = [];
        const len = Math.min(res.data.length,5)
        for(let i =0;i<len;i++){
          const user = await proxy.$axios.profile.get_user_info({
            account_id:res.data[i]['account_id'],
            current_account_id: store.getters.accountId || ''
          });
          if(user.success){
            list.push(user.data);
            // state.joinedCommunities = state.user.data.joined_communities.slice(0,3)
          }else{
            list.push({account_id:res.data[i]['account_id']});
          }
        }
        state.userList = list;
      }
      state.isLoaingUserList = false;
    }
    const debounce = (fn, delay) => {
      let timeout;
      return function(){
        clearTimeout(timeout)
        timeout = setTimeout(()=>{
          fn.apply(this, arguments)
        },delay)
      }
    }
    const debounceInput = debounce(searchUser, 300);
    const onSelectSubmit = (item) => {
      let selection = window.getSelection();
      let range = window.getSelection().getRangeAt(0);
      
      range.setStart(state.focusNode, state.start_index);
      range.setEnd(state.focusNode, state.end_index);

      range.deleteContents();

      var spanNode1= document.createElement('span');
      var spanNode2 = document.createElement('span');
      spanNode1.className = 'atFont';
      spanNode1.innerHTML = '@' + item.account_id;
      spanNode1.contentEditable = false;
      spanNode2.innerHTML = '&nbsp;';
      var frag = document.createDocumentFragment(),
        node,
        lastNode;
      frag.appendChild(spanNode1);
      while ((node = spanNode2.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      selection.extend(lastNode, 1);
      selection.collapseToEnd();
      //reset
      const sel = window.getSelection();
      state.focusNode = sel.focusNode;
      state.focusOffset = sel.focusOffset;
      state.showUserList = false;
    }

    //checkLogin
    const checkLogin = () => {
      if(!store.getters.isLogin){
        commentInput.value.blur()
        state.showLogin = true;
        return false;
      }else{
        return true;
      }
    }

    //emoji
    const setEmoji = (emoji) => {
      // const selection = commentInput.value.$el.getElementsByTagName('textarea')[0].selectionStart;
      // const left = state.text.substring(0,selection);
      // const right = state.text.substring(selection);
      // console.log(left,emoji,right,);
      // state.text = left + emoji + " " + right;

      if(checkLogin()){
        if(commentInput.value.textContent && state.focusNode && state.focusNode.insertData){
          let selection = window.getSelection();
          let range = selection.getRangeAt(0);
          const container = state.focusNode; 
          const pos = state.focusOffset;
          //insert
          range = document.createRange(); 
          var cons = window.document.createTextNode(emoji); 
          container.insertData(pos, cons.nodeValue); 
          range.setEnd(container, pos + cons.nodeValue.length); 
          range.setStart(container, pos + cons.nodeValue.length); 
          state.focusOffset = pos + cons.nodeValue.length;

          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }else{
          commentInput.value.innerHTML = commentInput.value.innerHTML + emoji;
        }
        state.text = commentInput.value.textContent;

        // selection.addRange(range); 
        // selection.collapseToEnd();
      }
    }
    const setGif = (gif) => {
      state.text = state.text + gif;
    }

    const confirmReply = () => {
      state.showNotice = false;
      localStorage.setItem("replyAlerted",true)
      reply();
    }

    //reply
    const reply = async () => {
      if(!state.text || !checkLogin() || state.isLoading){
        return;
      }
      //notice
      if(!localStorage.getItem("replyAlerted")){
        state.showNotice = true;
        return;
      }
      // proxy.$Loading.showLoading({title: "Loading"});
      state.isLoading = true;

      let params = {};
      //extra
      const at = []
      if(commentInput.value.innerHTML){
        const reg = RegExp(/<span[^>]*>([\s\S]*?)<\/span>/,"g");
        let r= '';
        while ((r= reg.exec(commentInput.value.innerHTML)) != null) {
          at.push(r[1].trim().substring(1));
        }
      }
      params.extra = {at:JSON.stringify(at)}

      //hierarchies
      const parent_hierarchies = props.hierarchies || [];
      if(parent_hierarchies.length==0){//level 1
        params.hierarchies = [
          {
            target_hash: props.targetHash,
            account_id: props.parentAccount
          },
        ]
      }else if(parent_hierarchies.length==1){//level 2
        params.hierarchies = [
          ...parent_hierarchies,
          {
            target_hash : props.targetHash,
            account_id : props.parentAccount,
          }
        ]
      }else if(parent_hierarchies.length==2){//level > 2
        params.hierarchies = [
          ...parent_hierarchies
        ];
        params.extra.reply_target_hash = props.targetHash; //reply_target_hash
      }

      
      //submit
      let result;
      if(props.postType == "encrypt"){
        result = await encryptReply(params);
      }else{
        result = await publicReply(params);
      }
      handleSuccess(result);
    }

    const publicReply = async (_params) => {
      const params = {   
        args:JSON.stringify({text: commentInput.value.innerHTML}), 
        ..._params
      }

      let result = {}
      if(props.communityId != store.state.nearConfig.MAIN_CONTRACT && props.communityId != store.state.nearConfig.NFT_CONTRACT){
        const communityContract = await CommunityContract.new(props.communityId);
        result = await communityContract.addContent(params,store.state.account,props.communityId);
      }else{
        result = await mainContract.addContent(params,store.state.account);
      }
      emit('addNewComment',{
        ..._params,
        reply: _params.extra.reply_target_hash ? props.replyUser : '',
        text:commentInput.value.innerHTML,
        type:'',
        pendingId: result.data,
        //transaction_hash: result.data,
        receiver_id:props.communityId,
        isNewComment:true,
        create_at:new Date().getTime(),
        identifier:props.identifier
      })
      store.commit("setDripActive", !store.state.dripActive);
      return result;
    }

    const encryptReply = async (_params) => {
      //encrypt
      const res = await proxy.$axios.post.add_encrypt_content_sign({
        content:{
          text:commentInput.value.innerHTML
        },
        account_id:store.getters.accountId || ''
      });

      if(res.success){
        // addEncryptComment
        const param2 = {
          ..._params,
          reply: _params.extra.reply_target_hash ? props.replyUser : '',
          encrypt_args:res.data.encode,
          nonce:res.data.nonce.toString(),
          sign:res.data.sign,
        }
     
        let result = {}
        if(props.communityId != store.state.nearConfig.MAIN_CONTRACT && props.communityId != store.state.nearConfig.NFT_CONTRACT){
          // const communityContract = new CommunityContract(store.state.account,props.communityId);
          const communityContract = await CommunityContract.new(props.communityId);
          result = await communityContract.addEncryptContent(param2,store.state.account,props.communityId);
        }else{
          result = await mainContract.addEncryptContent(param2,store.state.account);
        }
        emit('addNewComment',{
          ..._params,
          text:commentInput.value.innerHTML,
          type:'encrypt',
          pendingId: result.data,
          //transaction_hash: result.data,
          receiver_id:props.communityId,
          isNewComment:true,
          create_at:new Date().getTime()
        })
        store.commit("setDripActive", !store.state.dripActive);
        return result;
      }else{
        handleSuccess({status: 'fail'});
      }
    }

    //handleSuccess
    const handleSuccess = (res) => {
      state.text = ""
      if (res.status == 'pending' || res.status == 'success') {
        resetInfo()
        state.isLoading = false;
      } else if (res.status == 'fail') {
        proxy.$Message({
          message: "Oops,something went wrong. Please try again or submit a report.",
          type: "error",
        });
        state.isLoading = false;
      }else {}
    }

    const resetInfo = () => {
      commentInput.value && (commentInput.value.innerHTML = "");
      state.text = "";
      state.focusNode = null;
      state.focusOffset = null;
      state.start_index = null;
      state.end_index = null;
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    return {
      ...toRefs(state),
      commentInput,
      init,
      onCheck,
      onClick,
      onChange,
      onPaste,
      onSelectSubmit,
      checkLogin,
      setEmoji,
      setGif,
      confirmReply,
      reply,
      showLoginMask,
      closeLoginMask,
    };
  },
  mounted(){
    this.init();
    document.addEventListener('click',(e) => {
      const pop_notice = document.getElementById('pop-reply-notice'+ this.$props.targetHash);
      if(this.showNotice && pop_notice &&　!pop_notice.contains(e.target)) {
          this.showNotice = false;
      }
    })
  },
}
</script>

<style lang="scss" scoped>
.comment{
  width: 100%;
  padding:20px;
  background: #28282D;
  border-radius: 24px;
  position:relative;
  &.comment-reply-child,&.comment-reply-list{
    padding:20px 0 0 0;
    .input-box{
      background: #111113;
    }
    :deep(.el-textarea){
      border-radius: 10px;
      background: transparent;
    }
    .edit{
      .button-reply{
        >.mini-button{
          background: #111113;
        }
      }
    }
  }
  &.comment-reply-child{
    margin-left:52px;
    width:calc(100% - 52px);
  }
  .input-box{
    position: relative;
    background: #36363C;
    border-radius: 10px;
  }
  .div-input{
    position: relative;
    font-family: D-DINExp;
    font-size: 16px;
    line-height:24px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    border:0;
    -webkit-user-modify: read-write-plaintext-only;
    padding:20px 14px 76px 20px;
    z-index:3;
  }
  .atFont{
    font-family: D-DINExp;
    font-size: 16px;
    color: #FED23C;
    letter-spacing: 0;
    text-align: justify;
    line-height: 24px;
    font-weight: 400;
  }
  .placeholder{
    position:absolute;
    top:20px;
    left:20px;
    opacity: 0.2;
    font-family: D-DINExp;
    font-size: 14px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    line-height:24px;
    z-index:1;
  }
  .pop-user-box{
    position:relative;
    top:-60px;
    left:20px;
    .user-list{
      position:absolute;
      top:0;
      left:0;
      z-index:20;
      background: #000000;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
      border-radius: 10px;
      width:200px;
      .loading-box{
        height:50px;
        display:flex;
        align-items: center;
        justify-content:center;
      }
      .nobody{
        height:50px;
        display:flex;
        align-items: center;
        justify-content:center;
        opacity: 0.5;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: center;
        line-height: 14px;
        font-weight: 400;
      }
      .user-item{
        height:50px;
        display:flex;
        align-items: center;
        padding:0 20px;
        cursor:pointer;
        &:hover{
          background: rgba(40,40,45,0.5);
        }
        .user-avatar{
          width:30px;
          height:30px;
          border-radius:50%;
        }
        .user-info{
          margin-left:10px;
          .user-name{
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 14px;
            font-weight: 700;
            width:90px;
          }
          .user-account{
            margin-top:2px;
            opacity: 0.5;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 14px;
            font-weight: 400;
            width:90px;
          }
        }
      }
    }
  }

  .edit{
    position:absolute;
    padding:0 20px;
    left:0;
    bottom:20px;
    width:100%;
    height:40px;
    display:flex;
    align-items: center;
    justify-content: flex-end;
    :deep(.el-textarea){
      border-radius: 10px;
      background: transparent;
      max-height:30vh;
      height:20px;
      textarea{
        display:none;
      }
      .el-input__count{
        background:transparent;
        font-family: D-DINExp;
        font-size: 14px;
        line-height:20px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        bottom:0;
        right:20px;
      }
    }
    .emoji-box{
      position:absolute!important;
      top:8px;
      left:20px;
      z-index: 3;
    }
    .button-reply{
      position:relative;
      z-index: 3;
      >.mini-button{
        background: #36363C;
      }
    }
  }

  .comment-mask{
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background: rgba(0,0,0,0.7);
    border-radius: 24px;
    z-index:3;
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content:center;
    .lock{
      width:40px;
      height:40px;
    }
    .text{
      margin-top:12px;
      font-family: D-DINExp;
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0;
      text-align: center;
      font-weight: 400;
      line-height: 16px;
    }
  }
  
}
</style>