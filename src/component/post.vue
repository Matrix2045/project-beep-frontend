<template>
  <div class="post" :id="'post'+location" :key="location">
    <div class="post-form-box">
      <div class="post-form">
        <!-- text -->
        <div
          class="div-input"
          ref="postInput"
          contenteditable
          @keydown.capture="onCheck"
          @keyup.capture="onChange"
          @focus="checkLogin"
          @click="onClick"
          @paste="onPaste"
        />
        <div v-if="!postForm.text" class="placeholder">Share your story with the community.</div>
        
        <div class="pop-user-box" :id="'pop-user'+location">
          <div v-show="showUserList" ref="popUser" class="user-list-box">
            <div class="user-list" v-if="isLoaingUserList || userList.length>0">
              <div class="loading-box" v-if="isLoaingUserList">
                <img class="white-loading" src="@/assets/images/common/loading.png"/>
              </div>
              <template v-else-if="userList.length>0">
                <template v-for="user in userList">
                  <template v-if="user.name || user.avatar">
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
            </div>
          </div>
        </div>
        <!-- avatar -->
        <img class="avatar" v-if="$store.getters.isLogin && $store.state.profile.avatar" :src="$store.getters.getAwsImg($store.state.profile.avatar)" @error.once="$event.target.src=$store.state.profile.avatar"/>
        <img class="avatar" v-else src="@/assets/images/common/user-default.png"/>


        <!-- images -->
        <div class="images" >
          <div :class="['image-item',index%3==2?'mr0':'']" v-for="(img,index) in images" :key="index" @click="imagePreview(index)">
            <template v-if="img || postForm.imgs[index]">
              <div class="delete-image" @click.stop="handleRemove(index)"></div>
              <img v-if="img" :src="img">
              <img v-else :src="$store.getters.getAwsImg(postForm.imgs[index])" @error.once="$event.target.src=postForm.imgs[index]">
            </template>
          </div>
        </div>
      </div>


      <el-input v-model="postForm.text" @focus="checkLogin()"  placeholder="Share your story with the community." rows="1" :autosize="true" maxlength="1000"  type="textarea" :show-word-limit="postForm.text.trim().length>0" />

    </div>
    <div class="edit">
      <!-- community -->
      <div :id="'pop-community'+location" class="community-select" v-if="false && location!='detail' && location!='detail-suspend'">
        <!-- community selected -->
        <div class="community-selected" @click="showCommunityBox()">
          <template v-if="postForm.community.communityId">
            <img v-if="postForm.community.avatar" :src="$store.getters.getAwsImg(postForm.community.avatar)" @error.once="$event.target.src=postForm.community.avatar">
            <img v-else src="@/assets/images/community/default-avatar.png">
            <div class="txt-wrap">{{postForm.community.name}}</div>
          </template>
          <template v-else>
            Community
          </template>
        </div>
        <template v-if="location!='detail' && location!='detail-suspend'">
          <!-- community select -->
          <div class="pop-box pop-intro pop-community-select" v-if="showCommunity && isLoadingCommunity">
            <div class="loading">
              <img class="white-loading" src="@/assets/images/common/loading.png"/>
            </div>
          </div>
          <div class="pop-box pop-intro pop-community-select" v-else-if="showCommunity && joinedCommunities.length>0">
            <div class="title">Choose Community</div>
            <div class="intro">Choose the community you want to share with.</div>
            <div class="joined-list" >
              <template v-for="item in joinedCommunities">
                <div v-if="item.name" :class="['joined-item',item.community_id == postForm.community.communityId ? 'active' : '']" @click="selectCommunity(item)">
                  <img v-if="item.avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                  <img v-else src="@/assets/images/community/default-avatar.png">
                  <div class="txt-wrap">{{item.name}}</div>
                </div>
              </template>
            </div>
          </div>
          <!-- community join -->
          <div class="pop-box pop-intro pop-community-join" v-else-if="showCommunity">
            <div class="title">Choose Community</div>
            <div class="intro">You  haven't  joined  the  community  yet. Please  join  or  create  it.</div>
            <div class="button-box">
              <div class="mini-button-border button-cancel" @click="showCommunity=false">
                <div class="mini-button">Cancel</div>
              </div>
              <router-link :to="'/communities'">
                <div class="mini-button-border">
                  <div class="mini-button">Go</div>
                </div>
              </router-link>
            </div>
          </div>
        </template>
      </div>

      <!-- img-emoji-box -->
      <div class="img-emoji-box">
        <!-- upload-image -->
        <div class="icon-image" @click="uploadImage()"></div>
        <el-upload
          :id="'upload-image'+location"
          class="upload-image"
          action=""
          accept="image/png, image/jpeg, image/jpg, image/gif"
          multiple
          :show-file-list="false"
          list-type="picture-card"
          :http-request="uploadImg"
          :before-upload="beforeUpload"
          >
        </el-upload>
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
      </div>

      <!-- Token-gated -->
      <div :id="'pop-token'+location" class="post-type">
        <div class="token-gated" @click="chooseType()">
          <template v-if="postForm.accessDrips>0">
            <img class="drip-icon" src="@/assets/images/drip/icon-drip.png"/>
            {{postForm.accessDrips * 10 / 10}}
          </template>
          <img v-else class="tokengated-icon" src="@/assets/images/post/icon-tokengated.png"/>
        </div>
        <div class="pop-box pop-intro pop-token-gated" v-if="showTokenBox">
          <div class="title">Token-Gated</div>
          <div class="intro">Minimum Drips required to unlock the content.</div>
          <div class="title" style="margin-top:30px;">Drips</div>
          <el-input class="drip-input" :controls="false" type="number" v-model="accessDrips"></el-input>
          <div class="button-box">
            <div class="mini-button-border button-cancel" @click="showTokenBox=false;accessDrips=postForm.accessDrips;">
              <div class="mini-button">Cancel</div>
            </div>
            <div class="mini-button-border" @click="postForm.accessDrips = accessDrips;showTokenBox=false;">
              <div class="mini-button">Confirm</div>
            </div>
          </div>
        </div>
      </div>


      <!--  NFT -->
      <!-- <div :id="'pop-nft'+location" class="nft-check">
        <el-popover placement="bottom-start" trigger="hover">
          <template #reference>
            <div :class="['nft-check-button',postForm.isNft ? 'active' : '']" @click="chooseNft()"></div>
          </template>
          <div class="pop-box pop-intro">
            <div class="title">Post as NFT</div>
            <div class="intro">This post will be minted as an NFT on NEAR protocol and cannot be edited after minting.</div>
          </div>
        </el-popover>
      </div> -->

      <!-- reply button -->
      <el-popover placement="bottom" :fallback-placements="[ 'top']"   trigger="click" >
        <template #reference>
          <div :id="'pop-notice'+location" :class="['mini-button-border','button-post',!postForm.text.trim() && postForm.imgs.length<=0 ?'disabled' : '']">
            <div :id="'pop-button'+location" class="mini-button" @click="post()">
              <img v-if="isPosting" class="white-loading" src="@/assets/images/common/loading.png"/>
              <template v-else>Post</template>
            </div>
          </div>
        </template>
        <!-- post notice -->
        <div class="pop-box pop-intro pop-notice" v-if="showNotice">
          <div class="title">Notice</div>
          <div class="intro">This action will be recorded as a transaction on Near Protocol. Transaction details can be viewed in <a href="https://wallet.testnet.near.org/" target="_blank">Recent Activity</a></div>
          <div class="button-box">
            <div class="mini-button-border button-cancel" @click="showNotice=false">
              <div class="mini-button">Cancel</div>
            </div>
            <div class="mini-button-border" @click="confirmPost()">
              <div class="mini-button">Confirm</div>
            </div>
          </div>
        </div>
      </el-popover>

      <!-- post button -->
      <!-- <div :id="'pop-notice'+location" :class="['mini-button-border','button-post',!postForm.text.trim() && postForm.imgs.length<=0 ?'disabled' : '']">
        <div :id="'pop-button'+location" class="mini-button" @click="post()">
          <img v-if="isPosting" class="white-loading" src="@/assets/images/common/loading.png"/>
          <template v-else>Post</template>
        </div>
        <div class="pop-box pop-intro pop-notice" v-if="showNotice">
          <div class="title">Notice</div>
          <div class="intro">This action will be recorded as a transaction on Near Protocol. Transaction details can be viewed in <a href="https://wallet.testnet.near.org/" target="_blank">Recent Activity</a></div>
          <div class="button-box">
            <div class="mini-button-border button-cancel" @click="showNotice=false">
              <div class="mini-button">Cancel</div>
            </div>
            <div class="mini-button-border" @click="confirmPost()">
              <div class="mini-button">Confirm</div>
            </div>
          </div>
        </div>
      </div> -->


    </div>
    <div v-if="unJoinCommunity" class="post-mask">
      <img class="lock" src="@/assets/images/post-item/icon-lock.png"/>
      <div class="text">Need to join community</div>
    </div>
  </div>

  <div class="pop-nft-mask" v-if="showNftBox" @click.self="showNftBox=false">
    <div class="pop-box pop-intro pop-nft-info">
      <div class="title-box">
        <div class="title">Post as NFT</div>
        <!--
        <a class="more" target="_blank" href="">Find out more</a>
        -->
      </div>
      <div class="intro">This post will be minted as an NFT on NEAR protocol and cannot be edited after minting.</div>
      <div class="title-box mt40">
        <div class="title">Choose your cover</div>
        <div class="cover-type">
          <div :class="['auto-generated', !postForm.nft.cover ? 'active' : '']" @click="postForm.nft.isAutoGenerated=true;postForm.nft.cover = '';nftCover = '';">Auto-generated</div>
          <div class="upload-cover" @click="uploadCover">Upload</div>
          <el-upload
            :id="'upload-cover'+location"
            class="upload-cover-input"
            action=""
            accept="image/png, image/jpeg, image/jpg, image/gif"
            multiple
            :show-file-list="false"
            list-type="picture-card"
            :http-request="uploadCov"
            :before-upload="beforeUpload"
            >
          </el-upload>
        </div>
      </div>
      <div class="cover-preview">
        <!-- <img v-if="postForm.nft.cover" :src="$store.getters.getAwsImg(postForm.nft.cover)" @error.once="$event.target.src=postForm.nft.cover" />
        <img v-else :src="postForm.nft.defaultCover"/> -->
        <img v-if="nftCover" :src="nftCover" />
        <img v-else :src="nftDefaultCover"/>
      </div>
      <div class="title mt40">Public offering</div>
      <div class="intro" v-if="postForm.nft.isPublicSale">Public offering gives you the option to set the 
quantity and price of your NFTs, which can then be sold on the market.</div>
      <div class="intro" v-else>Non-public offering means this post will be minted as an NFT and stored in your wallet.</div>
      <div :class="['btn-sale',postForm.nft.isPublicSale ? 'open' : '']" @click="postForm.nft.isPublicSale = !postForm.nft.isPublicSale"></div>
      <div class="sale-info" v-if="postForm.nft.isPublicSale">
        <div class="sale-item">
          <div>copies</div>
          <el-input min=1 step=1 :controls="false" type="number" v-model="postForm.nft.copies" />
        </div>
        <div class="sale-item sale-price">
          <div>mint price</div>
          <el-input :min="0" :controls="false" type="number" v-model="postForm.nft.mintPrice" />
        </div>
      </div>
      <div class="button-border button-post-nft">
        <div class="button" @click="postNft()">
          <img v-if="isPosting" class="white-loading" src="@/assets/images/common/loading.png"/>
          <template v-else>Mint</template>
        </div>
      </div>

    </div>
    <!-- Canvas -->
    <Canvas :text="postForm.text" @setDefaultCover="setDefaultCover"/>
  </div>

  <!-- Image Preview -->
  <template v-if="showPreview">
    <ImagePreview :imgs="images" :index="index"  @closePreview = "closePreview" ></ImagePreview>
  </template>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
  import { ref, reactive, toRefs , getCurrentInstance, nextTick } from "vue";
  import { useStore } from 'vuex';
  import { useRouter } from "vue-router";
  import MainContract from "@/contract/MainContract";
  import NftContract from "@/contract/NftContract";
  import CommunityContract from "@/contract/CommunityContract";
  import { getMetadata } from "@/contract/TokenContract.js";
  import { parseAmount,getParam,generatePhrase } from '@/utils/util';
  import { upload } from "@/utils/upload.js";
  import * as StackBlur from 'stackblur-canvas';
  import LoginMask from "@/component/login-mask.vue";
  import DiscordPicker from 'vue3-discordpicker';
  import ImagePreview from '@/component/image-preview.vue';
  import UserPopup from '@/component/user-popup.vue';
  import Canvas from '@/component/canvas.vue';
  import * as nearAPI from 'near-api-js';
  import js_sha256 from 'js-sha256';
  import axios from 'axios';
  import { compress, compressAccurately } from 'image-conversion'
  export default {
    components: {
      LoginMask,
      DiscordPicker,
      ImagePreview,
      UserPopup,
      Canvas
    },
    props:{
      location:{
        type:String,
        value:""
      },
      community:{
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
      const nftContract = new NftContract(store.state.account);

      //state
      const state = reactive({
        postForm: {
          text: "",
          imgs: [],
          // blur_imgs:[],
          community:{
            communityId:"",
            name:"",
            avatar:""
          },
          isPrivate:false,
          accessDrips:0,
          isNft:false,
          nft:{
            isAutoGenerated:true,
            defaultCover:"",
            defaultCoverFile:null,
            cover:"",
            coverBase64:"",
            isPublicSale:false,
            mintPrice:10,
            copies:1000,
          }
        },
        images:[],
        nftCover:'',
        nftDefaultCover:'',

        defaultCommunity:{},
        focusNode:null,
        focusOffset:null,
        start_index:null,
        end_index:null,
        isLoaingUserList:false,
        showUserList:false,
        userList:[],
        //community
        joinedCommunities:[],
        showCommunity:false,
        isLoadingCommunity:false,
        //token
        showTokenBox:false,
        accessDrips:0,
        //nft
        showNftBox:false,
        //image preview
        showPreview:false,
        index:0,
        //other
        showLogin:false,
        showNotice:false,
        isPosting:false
      })

      const init = async () => {
        //community
        if(props.community){
          const defaultCommunity = {
            communityId:props.community.community_id,
            avatar:props.community.avatar,
            name:props.community.name || props.community.community_id
          }
          state.postForm.community = defaultCommunity
          state.defaultCommunity = defaultCommunity
        }else{
          const res = await proxy.$axios.community.get_community_detail({
            account_id:"",
            community_id: store.state.nearConfig.MAIN_CONTRACT,
          });
          if(res.success) {
            state.defaultCommunity = {
              avatar:res.data.avatar,
              communityId:res.data.community_id,
              name:res.data.name
            }
            state.postForm.community = state.defaultCommunity;
          }
        }
        //nft set
        if(localStorage.getItem('nftSetting')){
          const nftInfo = JSON.parse(localStorage.getItem("nftSetting"));
          state.postForm.nft.copies = nftInfo.copies;
          state.postForm.nft.mintPrice = nftInfo.mint_price;
        }
        

        //usedCommunity update
        const usedCommunities = JSON.parse(localStorage.getItem("usedCommunities")) || [];
        const updateCommunities =  [];
        for(let i = 0;i<usedCommunities.length;i++){
          const community = usedCommunities[i];
          const res = await proxy.$axios.community.get_community_detail({
            account_id:"",
            community_id: community.communityId,
          });
          if(res.success) {
            const comm = {
              avatar:res.data.avatar,
              communityId:res.data.community_id,
              name:res.data.name
            }
            updateCommunities.push(comm);
          }
        }
        localStorage.setItem("usedCommunities",JSON.stringify(updateCommunities));
      }

      //@
      const onCheck = (e) => {
        if(postInput.value.textContent.length>=1000 && e.key != 'Backspace'){
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
        if(postInput.value.textContent.length + text.length >=1000 ){
          if (document.queryCommandSupported('insertText')) {
              document.execCommand('insertText', false, text.slice(0,1000-postInput.value.textContent.length));
          } else {
              document.execCommand('paste', false, text.slice(0,1000-postInput.value.textContent.length));
          }
          e.preventDefault();
        }else{
          if (document.queryCommandSupported('insertText')) {
              document.execCommand('insertText', false, text);
          } else {
              document.execCommand('paste', false, text);
          }
          e.preventDefault();
        }
        onChange(e);
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
        state.postForm.text = postInput.value.textContent;
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

      // const popUser = ref(null);
      let CancelToken = axios.CancelToken;
      const searchUser = async (str) => {
        if(state.cancel){
            state.cancel();
            state.cancel = null;
        }
        const cancelToken = new CancelToken((c) => {
          state.cancel = c;
        })
        state.showUserList = true;
        state.isLoaingUserList = true;

        const res = await proxy.$axios.post.at({
          account_id:str,
        },cancelToken);
        if(res.success){
          state.userList = res.data;
          state.isLoaingUserList = false;
        }
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
      const debounceInput = debounce(searchUser, 300)
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
      const postInput = ref();
      const checkLogin = () => {
        if(!store.getters.isLogin){
          postInput.value.blur();
          state.showLogin = true;
          return false;
        }else{
          return true;
        }
      }
      
      // image upload
      const stateData = reactive({
        imgList:[],
        count:0,
      })
      const uploadImage = () => {
        if(checkLogin()){
          const elUploadInput = document.getElementById('upload-image'+props.location).getElementsByClassName('el-upload__input')[0];
          elUploadInput.click();
        }
      }
      const beforeUpload = (file,fileList) => {
        stateData.count++;
        return new Promise((resolve, reject) => {
          if (file.size / 1024 > 1024 * 5) { //1024 * 10
            compressAccurately(file, 1024 * 5).then(res => {
              resolve(res)
            })
          } else {
            resolve(file)
          } 
        })
      }
      const uploadImg = ({ file }) => {
        //count check
        let inx = -1;
        if(stateData.imgList.length >= 9){
          stateData.count--;
          proxy.$Message({
            message: "You can upload up to 9 photos",
            type: "error",
          });
          return false
        }
        inx = stateData.imgList.length;
        stateData.imgList[inx] = '';
        state.images[inx] = ''

        //upload
        upload(file).then(data=>{
          stateData.count--;
          state.postForm.imgs[inx] = data;
          blobToBase64(inx,file);
        })
      }

      const blobToBase64 = (inx,blob) => {
        const reader = new FileReader();
        reader.addEventListener('load', ()=> {
          if(inx>=0){
            state.images[inx] = reader.result;
          }else if(inx==-1){
            state.nftCover = reader.result;
          }else if(inx==-2){
            state.nftDefaultCover = reader.result;
          }
        });
        reader.readAsDataURL(blob);
      }
      const handleRemove = (index) => {
        stateData.imgList.splice(index,1);
        state.postForm.imgs.splice(index,1);
        state.images.splice(index,1);
      }

      //image preview
      const imagePreview = (index) => {
        state.index = index;
        state.showPreview =true;
      }
      const closePreview = () => {
        state.showPreview =false;
      }

      //emoji
      const setEmoji = (emoji) => {
        if(checkLogin()){
          if(postInput.value.textContent && state.focusNode && state.focusNode.insertData){
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
            postInput.value.innerHTML = postInput.value.innerHTML + emoji;
          }
          state.postForm.text = postInput.value.textContent;

          // selection.addRange(range); 
          // selection.collapseToEnd();
        }
      }
      const setGif = (gif) => {
        state.postForm.text = state.postForm.text + gif;
      }

      //showCommunityBox
      const showCommunityBox = async () => {
        if(checkLogin()){
          state.showCommunity = !state.showCommunity;
          if(state.showCommunity){
            state.isLoadingCommunity = true;
            const res = await proxy.$axios.community.get_joined_community_list({
              account_id:store.getters.accountId,
              page:0,
              limit:10000
            });
            if(res.success) {
              //usedCommunities
              const usedCommunities = JSON.parse(localStorage.getItem("usedCommunities")) || [];
              state.joinedCommunities =  deduplication(usedCommunities.concat(res.data),'community');
            }
            state.isLoadingCommunity = false;
          }
        }
      }
      const selectCommunity = (item) => {
        if(state.postForm.community.communityId != item.community_id){
          state.postForm.community= {
            communityId:item.community_id,
            avatar:item.avatar,
            name:item.name || item.community_id
          }
          state.showCommunity = false;
          //usedCommunities
          let usedCommunities = JSON.parse(localStorage.getItem("usedCommunities")) || [];
          usedCommunities.unshift(item);
          usedCommunities = deduplication(usedCommunities,'community');
          localStorage.setItem("usedCommunities",JSON.stringify(usedCommunities))
        }
      }

      const deduplication = (list,type) => {
        const ids = [];
        const res = [];
        list.forEach(item=>{
          if(ids.indexOf(item.community_id) == -1){
            res.push(item);
            ids.push(item.community_id);
          }
        })
        return res;
      }

      //choose type
      const chooseType = () => {
        if(checkLogin()){
          state.postForm.isPrivate = true;
          state.showTokenBox = !state.showTokenBox;
        }
      }


      //choose Nft
      const chooseNft = () => {
        if(checkLogin()){
          state.postForm.isNft = !state.postForm.isNft;
        }
      }
      const uploadCover = () => {
        if(checkLogin()){
          state.postForm.nft.isAutoGenerated=false;
          const elUploadInput = document.getElementById('upload-cover'+props.location).getElementsByClassName('el-upload__input')[0];
          elUploadInput.click();
        }
      }
      const uploadCov = ({ file }) => {
        //upload
        fileByBase64(file)
        upload(file).then(data=>{
          state.postForm.nft.cover = data;
          blobToBase64(-1,file);
        })
      }
      const fileByBase64 = (file) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
          state.postForm.nft.coverBase64 = e.target.result
        };
      }
      const setDefaultCover = (obj) => {
        // fileByBase64(obj.file)
        state.postForm.nft.defaultCover = obj.url;
        state.postForm.nft.defaultCoverFile = obj.file;
        blobToBase64(-2,obj.file);
      }


      //post
      const post = async () => {
        if((!state.postForm.text && state.postForm.imgs.length<=0) || !checkLogin() || state.isPosting){
          return;
        }
        if(state.postForm.isNft){
          state.showNftBox = true;
          return;
        }
        //notice
        if(!localStorage.getItem("postAlerted")){
          state.showNotice = true;
          return;
        }


        state.isPosting = true;
        //extra
        const at = []
        if(postInput.value.innerHTML){
          const reg = RegExp(/<span[^>]*>([\s\S]*?)<\/span>/,"g");
          let r= '';
          while ((r= reg.exec(postInput.value.innerHTML)) != null) {
            at.push(r[1].trim().substring(1));
          }
        }
        const extra = {at:JSON.stringify(at)}
        //submit
        let result;
        if(state.postForm.accessDrips>0){
          result = await encryptPost(extra);
        }else{
          result = await publicPost(extra);
        }
        handleSuccess(result);
      }

      const publicPost = async (extra) => {
        const params = {   
          args:JSON.stringify({text:postInput.value.innerHTML,imgs:state.postForm.imgs}),
          hierarchies:[],
          extra
        }
        let result = {}
        if(state.postForm.community.communityId == store.state.nearConfig.MAIN_CONTRACT){
          result = await mainContract.addContent(params,store.state.account);
        }else{
          const communityContract = await CommunityContract.new(state.postForm.community.communityId);
          result = await communityContract.addContent(params, state.postForm.community.communityId);
        }
        emit('addNewPost',{
          text:postInput.value.innerHTML,
          imgs:state.postForm.imgs,
          type:'',
          community:{
            community_id:state.postForm.community.communityId,
            avatar:state.postForm.community.avatar,
            name:state.postForm.community.name
          },
          pendingId: result.data,
          //transaction_hash: result.data,
          receiver_id:state.postForm.community.communityId,
          isNewPost:true,
          create_at:new Date().getTime()
        })
        store.commit("setDripActive", !store.state.dripActive);
        return result;
      }

      const encryptPost = async (extra) => {
        const access = {
          relationship: "Or",
          conditions:[{
            DripCondition:{
              amount_to_access:parseAmount(state.postForm.accessDrips,24)
            }
          }]
        }
        const res = await proxy.$axios.post.add_encrypt_content_sign({
          content:{
            text:postInput.value.innerHTML,
            imgs:state.postForm.imgs,
          },
          account_id:store.getters.accountId || ''
        });

        if(res.success){
          // addEncryptPost
          const param2 = {
            access,
            extra,
            hierarchies:[],
            encrypt_args:res.data.encode,//JSON.stringify(res.data.encode),
            nonce:res.data.nonce.toString(),
            sign:res.data.sign,
            // blur_imgs:[...state.postForm.blur_imgs],
            // encrypt_args:JSON.stringify(res.cipher_text), 
            // text_sign:res.text_sign,
            // contract_id_sign:res.contract_id_sign,
          }
          let result = {}
          if(state.postForm.community.communityId == store.state.nearConfig.MAIN_CONTRACT){
            result = await mainContract.addEncryptContent(param2,store.state.account);
          }else{
            const communityContract = await CommunityContract.new(state.postForm.community.communityId);
            result = await communityContract.addEncryptContent(param2,store.state.account,state.postForm.community.communityId);
          }

          emit('addNewPost',{
            text:postInput.value.innerHTML,
            imgs:state.postForm.imgs,
            access,
            type:'encrypt',
            community:{
              community_id:state.postForm.community.communityId,
              avatar:state.postForm.community.avatar,
              name:state.postForm.community.name
            },
            pendingId: result.data,
            //transaction_hash: result.data,
            receiver_id:state.postForm.community.communityId,
            isNewPost:true,
            create_at:new Date().getTime()
          })
          store.commit("setDripActive", !store.state.dripActive);
          return result;
        }else{
          throw new Error("Encrypt Failed: " + res.message);
        }
      }

      const confirmPost = () => {
        state.showNotice = false;
        localStorage.setItem("postAlerted",true)
        post();
      }



      //postNft
      const postNft = async () => {
        //check 
        if((!state.postForm.text && state.postForm.imgs.length<=0) || !checkLogin() || state.isPosting){
          return;
        }
        //check Nft Info
        if(state.postForm.nft.isPublicSale && (!state.postForm.nft.copies || state.postForm.nft.copies<1 || state.postForm.nft.copies%1 !== 0)){
          proxy.$Message({
            message: "Minimum copyies is 1",
            type: "error",
          });
          return;
        }
        if(state.postForm.nft.isPublicSale && (!state.postForm.nft.mintPrice || !state.postForm.nft.mintPrice < 0)){
          proxy.$Message({
            message: "Minimum mint price is 0",
            type: "error",
          });
          return;
        }

        // proxy.$Loading.showLoading({title: "Loading"});
        state.isPosting = true;

        //cover
        let cover = state.postForm.nft.isAutoGenerated ? "" : state.postForm.nft.cover;
        let coverBase64 = state.postForm.nft.isAutoGenerated ?  state.postForm.nft.defaultCover : state.postForm.nft.coverBase64;
        if(state.postForm.nft.isAutoGenerated){
          const data = await upload(state.postForm.nft.defaultCoverFile);
          cover = data;
        }
        //record param
        if(state.postForm.nft.isPublicSale){
          localStorage.setItem('nftSetting',JSON.stringify({
            mint_price:state.postForm.nft.mintPrice,
            copies:Number(state.postForm.nft.copies)
          }))
        }
          //create
        const params = {
          creator_id: store.getters.accountId,
          token_metadata: {
            title: "popula",
            description: postInput.value.textContent,
            media: cover,
            media_hash: js_sha256.sha256(coverBase64),
            copies:state.postForm.nft.isPublicSale ? Number(state.postForm.nft.copies) : 1,
            extra:JSON.stringify({...state.postForm.imgs})
          },
          mint_price: state.postForm.nft.isPublicSale ? parseAmount(state.postForm.nft.mintPrice,24) : null, 
          ft_token_id: "near", 
          notify_contract_id: state.postForm.community.communityId
        }
        let deposit = state.postForm.nft.isPublicSale ? '20000000000000000000000' : '40000000000000000000000';
        const result = await nftContract.nftCreateSeries(params,deposit);
    
        //addNewPost
        emit('addNewPost',{
          text:postInput.value.innerHTML,
          imgs:state.postForm.imgs,
          type:'nft',
          community:{
            community_id:state.postForm.community.communityId,
            avatar:state.postForm.community.avatar,
            name:state.postForm.community.name
          },
          pendingId: result.data,
          //transaction_hash: result.data,
          receiver_id:state.postForm.community.communityId,
          isNewPost:true,
          create_at:new Date().getTime(),
          nft:{
            isPublicSale:state.postForm.nft.isPublicSale,
            copies:state.postForm.nft.isPublicSale ? Number(state.postForm.nft.copies) : 1,
            mint_price: state.postForm.nft.isPublicSale ? parseAmount(state.postForm.nft.mintPrice,24) : null, 

          }
        })
        store.commit("setDripActive", !store.state.dripActive);
        resetForm();

        state.showNftBox = false;
        handleSuccess(result);
      }


      //handleSuccess
      const handleSuccess = (res) => {
        resetForm();
        if (res.status == 'pending' || res.status == 'success') {
          state.isPosting = false;
        } else  if (res.status == 'fail') {
          proxy.$Message({
            message: "Oops,something went wrong. Please try again or submit a report.",
            type: "error",
          });
          state.isPosting = false;
        } else {
        }
      }

      const resetForm = () => {
        state.postForm = {
          text: "",
          imgs: [],
          // blur_imgs:[],
          community:state.defaultCommunity,
          isPrivate:false,
          accessDrips:0,
          nft:{
            isAutoGenerated:true,
            defaultCover:"",
            cover:"",
            coverBase64:"",
            isPublicSale:false,
            mintPrice:10,
            copies:1000,
          }
        };
        state.accessDrips = 0;
        state.images = [];
        stateData.imgList = [];
        stateData.count = 0;
        postInput.value.innerHTML = "";
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
        // popUser,
        init,
        onCheck,
        onClick,
        onChange,
        onPaste,
        onSelectSubmit,
        postInput,
        checkLogin,
        uploadImage,
        beforeUpload,
        uploadImg,
        handleRemove,
        imagePreview,
        closePreview,
        setEmoji,
        setGif,
        showCommunityBox,
        selectCommunity,
        chooseType,
        chooseNft,
        uploadCover,
        uploadCov,
        setDefaultCover,
        post,
        postNft,
        confirmPost,
        showLoginMask,
        closeLoginMask,
      };
    },
    mounted(){
      this.init();

      document.addEventListener('click',(e) => {
        const pop_notice = document.getElementById('pop-notice'+this.location);
        if(this.showNotice && pop_notice &&　!pop_notice.contains(e.target)) {
            this.showNotice = false;
        }

        const pop_community = document.getElementById('pop-community'+this.location);
        if(this.showCommunity && pop_community &&　!pop_community.contains(e.target)) {
            this.showCommunity = false;
        }

        const pop_token = document.getElementById('pop-token'+this.location);
        if(this.showTokenBox && pop_token &&　!pop_token.contains(e.target)) {
            this.showTokenBox = false;
        }

        // const pop_nft = document.getElementById('pop-nft'+this.location);
        // // const pop_btn = document.getElementById('pop-button'+this.location);
        // if(this.showNftBox && ((pop_nft &&　!pop_nft.contains(e.target)) || (pop_notice &&　!pop_notice.contains(e.target)))) {
        //     this.showNftBox = false;
        // }

        const pop_user = document.getElementById('pop-user'+this.location);
        if(this.showUserList && pop_user &&　!pop_user.contains(e.target)) {
            this.showUserList = false;
        }

      })
    },

  }
</script>

<style lang="scss" scoped>
  .post{
    width:690px;
    padding:20px;
    background: #28282D;
    border-radius: 24px;
    position:relative;
    :deep(.el-upload) {
      display:none;
    }
    &#postsuspend,&#postdetail-suspend{
      .post-form-box{
        padding:20px 0 20px 20px;
        .post-form{
          max-height: 50vh;
          overflow-y: scroll;
        }
        .div-input{
          padding-right:14px;
          padding-bottom:20px;
        }
        .image-item{
          margin-top:15px;
          margin-bottom: 20px;
        }
        :deep(.el-textarea){
          height:39px;
          padding:15px 20px 0 0;
        }
      }
    }
    .post-form-box{
      border-radius: 10px;
      background: #36363C;
      padding:20px 20px 20px 20px;
      position:relative;
      .div-input{
        position:relative;
        z-index:3;
        padding-left:36px;
        background: transparent;
        font-family: D-DINExp;
        font-size: 16px;
        line-height:24px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        border:0;
        -webkit-user-modify: read-write-plaintext-only;
        padding-bottom:35px;
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
        left:56px;
        opacity: 0.2;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        line-height:24px;
        z-index:1;
      }
      :deep(.el-textarea){
        position:static!important;
        height:24px;
        overflow: hidden;
        textarea{
          background: transparent;
          padding:0;
          padding-left:36px;
          font-family: D-DINExp;
          font-size: 16px;
          line-height:24px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          border:0;
          resize:none;
          text-align:justify;
          display:none;
        }
        .el-input__count{
          display:block;
          text-align:right;
          background:transparent;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          /*position:static;*/
          bottom:20px;
          right:20px;
          line-height:16px;
          position:relative;
          top:8px;
          left:0;
        }
      }
      .pop-user-box{
        position:relative;
        .user-list-box{
          position:absolute;
          top:0;
          left:0;
          z-index:20;
          .user-list{
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
      }
      .avatar{
        width: 24px;
        height: 24px;
        border-radius:50%;
        position:absolute;
        top:20px;
        left:20px;
        object-fit: cover;
      }
      .images{
        display:flex;
        flex-wrap:wrap;
        .image-item{
          width: 180px;
          height: 180px;
          position:relative;
          margin-right:35px;
          margin-bottom:35px;
          background:#28282D;
          border-radius: 10px;
          &::before{
            display:block;
            content:'';
            position:absolute;
            z-index: 1;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background:url('@/assets/images/common/loading.png') no-repeat center;
            background-size:20px;
            -webkit-animation:whiteLoadingRotate 1.1s linear infinite;
            animation:whiteLoadingRotate 1.1s linear infinite;
          }
          @-webkit-keyframes whiteLoadingRotate{
            0%{ -webkit-transform: rotate(0deg);}
            100%{ -webkit-transform: rotate(360deg);}
          }
          @keyframes whiteLoadingRotate{
              0%{ -webkit-transform: rotate(0deg);}
              100%{ -webkit-transform: rotate(360deg);}
          }

          &.mr0{
            margin-right:0;
          }
          .delete-image{
            position:absolute;
            top:-10px;
            right:-10px;
            width: 30px;
            height: 30px;
            background: #28282D url("@/assets/images/common/icon-close-mini.png") no-repeat center center;
            background-size:16px;
            box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.5);
            border-radius:50%;
            cursor: pointer;
            z-index: 3;
          }
          img{
            width: 180px;
            height: 180px;
            border-radius: 10px;
            object-fit: cover;
            position: relative;
            z-index: 2;
          }
        }
      }
    }
    .edit{
      margin-top:20px;
      height:36px;
      display:flex;
      align-items:center;
      .community-select{
        margin-right:30px;
        position: relative;

        height: 36px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        &#pop-communitydetail,&#pop-communitydetail-suspend{
          cursor:default;
        }
        .community-selected{
          width: 144px;
          height: 34px;
          line-height: 34px;
          padding:0 32px 0 10px;
          background:url("@/assets/images/common/icon-arrow-right.png") no-repeat calc(100% - 10px) center;
          background-size:12px 12px;
          display:flex;
          align-items: center;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          cursor: pointer;
          img{
            width: 18px;
            height: 18px;
            border-radius: 4px;
            margin-right:6px;
            object-fit: cover;
          }
        }
        .pop-community-join{
          position:absolute;
          top:46px;
          left:0;
          z-index:99;
          width:320px;
          padding:30px;
          .intro{
            color: #FFFFFF;
          }
        }
        .pop-community-select{
          position:absolute;
          top:46px;
          left:0;
          z-index:99;
          width:400px;
          padding:30px;
          .loading{
            height:100px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .joined-list{
            margin-top:4px;
            display:flex;
            flex-wrap:wrap;
            justify-content:space-between;
            .joined-item{
              padding:0 12px;
              margin-top:16px;
              width: 162px;
              height: 50px;
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 10px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              display:flex;
              align-items: center;
              cursor: pointer;
              &:hover,&.active{
                background: #28282D;
                border: 1px solid #28282D;
              }
              img{
                width: 30px;
                height: 30px;
                border-radius: 8px;
                margin-right:10px;
              }
            }
          }
        }
      }

      .img-emoji-box{
        display:flex;
        .icon-image{
          cursor: pointer;
          margin-right:30px;
          width: 24px;
          height: 24px;
          background:url("@/assets/images/post/icon-image.png") no-repeat center center;
          background-size:24px 24px;
          &:hover{
            background-image:url("@/assets/images/post/icon-image-hover.png");
          }
        }
        .icon-emoji{
          width: 24px;
          height: 24px;
          margin-right:30px;
          cursor: pointer;
          background:url("@/assets/images/post/icon-emoji.png") no-repeat center center;
          background-size:24px 24px;
          &:hover{
            background-image:url("@/assets/images/post/icon-emoji-hover.png"); 
          }
        }
      }
      .post-type{
        position:relative;
        .token-gated{
          height:24px;
          display: flex;
          align-items: center;
          cursor: pointer;
          font-family: D-DINExp-Bold;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          line-height:24px;
          .tokengated-icon{
            width:24px;
          }
          .drip-icon{
            width:24px;
            margin-right:6px;
          }
        }
        .pop-token-gated{
          position:absolute;
          top:46px;
          left:0;
          z-index:99;
          width:460px;
          padding:30px;
          .title{
            line-height: 17px;
          }
          .drip-input{
            margin-top:12px;
            margin-left:0;
            width: 100%;
            height: 50px;
            line-height: 48px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            :deep(.el-input__inner){
              height: 48px;
              line-height: 48px;
              border-radius: 10px;
              background: transparent;
              border:0;
              outline:0;
              font-family: D-DINExp;
              font-size: 16px;
              color: #FFFFFF;
              font-weight: 400;
              padding:0 20px;
            }
          }
          .button-box{
            padding:30px 0 0;
            justify-content: flex-end;
            .mini-button-border{
              margin-left:20px;
            }
          }
        }
      }
      .nft-check{
        margin-left:30px;
        position: relative;
        .nft-check-button{
          width:70px;
          height:30px;
          background:url("@/assets/images/post/btn-nft-close.png") no-repeat;
          background-size:cover;
          cursor: pointer;
          &.active{
            background:url("@/assets/images/post/btn-nft-open.png") no-repeat;
            background-size:cover;
          }
        }
      }
      .button-post{
        cursor:pointer;
        position:absolute;
        right:20px;
      }
    }

    .post-mask{
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
  .pop-nft-mask{
    position: fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background:rgba(0,0,0,0.3);
    z-index:99;
    :deep(.el-upload) {
      display:none;
    }
    .pop-nft-info{
      // position: absolute;
      // top:48px;
      // left:0;
      position: absolute;
      top:50%;
      left:50%;
      transform: translate(-50%,-50%);
      z-index:99;
      width:460px;
      padding:30px;
      .mt40{
        margin-top:40px;
      }
      .title-box{
        display: flex;
        justify-content:space-between;
        align-items:center;
        .more{
          padding-right:18px;
          background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
          background-size:14px 14px;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: right;
          font-weight: 400;
          line-height:17px;
        }
        .cover-type{
          display:flex;
          .auto-generated{
            cursor:pointer;
            padding-left:24px;
            background:url("@/assets/images/post/icon-check.png") no-repeat left center;
            background-size:16px 16px;
            &.active{
              background:url("@/assets/images/post/icon-checked.png") no-repeat left center;
              background-size:16px 16px;
            }
          }
          .upload-cover{
            cursor:pointer;
            margin-left:30px;
            padding-left:24px;
            background:url("@/assets/images/post/icon-upload.png") no-repeat left center;
            background-size:16px 16px;
          }
        }
      }
      .cover-preview{
        margin-top:20px;
        width:400px;
        height:230px;
        background: #0B0B0B;
        border: 1px solid rgba(40,40,40,1);
        border-radius: 10px;
        overflow: hidden;
        img{
          width:400px;
          height:230px;
          object-fit: cover;
        }
      }
      .btn-sale{
        margin-top:16px;
        width:56px;
        height:30px;
        background:url("@/assets/images/post/btn-sale-close.png") no-repeat left center;
        background-size:56px 30px;
        cursor:pointer;
        &.open{
          background:url("@/assets/images/post/btn-sale-open.png") no-repeat left center;
          background-size:56px 30px;
        }
      }
      .sale-info{
        margin-top:20px;
        display:flex;
        justify-content:space-between;
        .sale-item{
          width:192px;
          height:64px;
          padding:0 12px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          display:flex;
          justify-content:space-between;
          align-items: center;
          &.sale-price{
            :deep(.el-input){
              .el-input__inner{
                padding:0 18px 0 0;
                background:transparent url("@/assets/images/common/icon-gas.png") no-repeat 78px center;
                background-size:12px;
              }
            }
          }
          :deep(.el-input){
            width:90px;
            height:40px;
            border-radius: 10px;
            .el-input__inner{
              background: transparent;
              border:0;
              font-family: D-DINExp;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: right;
              font-weight: 400;
            }
          }
        }
      }
      .button-post-nft{
        margin:30px auto 0;
      }
    }
  }
</style>

