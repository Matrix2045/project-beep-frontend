<template>
  <!-- nft-detail layer-->
  <div class="elastic-layer" @click.self="closeLayer()">
    <div class="edit-button close" @click="closeLayer()"></div>
    <div class="nft-detail">
      <img class="media" :src="checkNftMedia(item.metadata.media)"/>
      <div class="info">
        <el-popover placement="bottom"  trigger="hover" popper-class="nft-share-popper">
          <template #reference>
            <div class="share-btn"></div>
          </template>
          <div class="pop-box pop-edit">
            <div class="pop-edit-item" @click="shareTwitter()">
              <img class="icon16" src="@/assets/images/post-item/icon-twitter-mini.png"/>
              Twitter
            </div>
            <div class="pop-edit-item" @click="triggerCopy('',true)">
              <img class="icon16" src="@/assets/images/post-item/icon-link.png"/>
              Copy link
            </div>
          </div>
        </el-popover>
        <!-- name & description -->
        <div class="name txt-wrap">{{item.metadata.title}}</div>
        <div class="description">
          <div class="mini-title">Description</div>
          <div class="desc txt-wrap2">{{item.metadata.description}}</div>
        </div>
        <!-- cpoies & price -->
        <div class="copies-price">
          <div class="copies-price-item">
            <div class="mini-title">Copies</div>
            <div class="copies-price-item-text">{{item.metadata.copies}}</div>
          </div>
          <div class="copies-price-item">
            <div class="mini-title">Price</div>
            <div class="copies-price-item-text price-text">SALE</div>
          </div>
        </div>
        <!-- user -->
        <div class="user">
          <img v-if="user.avatar" class="avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
          <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
          <div class="account  txt-wrap">{{item.owner_id}}</div>
        </div>
        <!-- royalty -->
        <!--
        <div class="royalty">
          <div class="mini-title">Royalties</div>
          <div class="text">None</div>
        </div>
        -->
        <!-- Token Info -->
        <div class="token-info">
          <div class="mini-title">Token Info</div>
          <div class="token-item">
            <div class="token-item-name">Smart Contract</div>
            <div class="token-item-address">
              <div class="address txt-wrap">{{item.contract_id}}</div>
              <div class="copy-btn" @click.stop="triggerCopy(item.contract_id)"></div>
            </div>
          </div>
          <div class="token-item">
            <div class="token-item-name">File Link</div>
            <div class="token-item-address">
              <div class="address txt-wrap">{{item.metadata.media}}</div>
              <div class="copy-btn" @click.stop="triggerCopy(item.metadata.media)"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <!-- #copy_text  display:none;  -->
    <div :data-clipboard-text="copyText" ref="copy_text"  id="copy_text" @click="handleCopyFun"></div>
  </div>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  import { getAccountSign } from '../utils/util';
  import { copyText } from 'vue3-clipboard';
  import * as bs58 from 'bs58';
  export default {
    props:{
      user:{
        type:Object,
        value:{}
      },
      item:{
        type:Object,
        value:{}
      }
    },
    setup(props,{emit}) {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      const { proxy } = getCurrentInstance();
      const state = reactive({
        isLoading:false,
        copyText:'',
        
      })

      const init = async () => {
        const res = await store.state.viewAccount.viewFunction(props.item.contract_id, "nft_payout", {token_id: props.item.token_id,balance:"50",max_len_payout:50}); 
      }
      init();

      const closeLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit('close');
      }

      //share -> handleCopy
      const copy_text = ref()
      const triggerCopy = async (str,isShare=false) => {
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

      const shareTwitter = () => {
        window.open('https://twitter.com/intent/tweet?text='+getShareLink());
      }

      //ShareLink 
      const getShareLink = () => {
        const parmsJson = JSON.stringify({
          contract_id : props.item.contract_id,
          token_id : props.item.token_id
        })
        const signature = bs58.encode(Buffer.from(parmsJson));
        return `${window.location.protocol}//${window.location.host}/user-profile/${props.user.account_id}?nft=${signature}`;
      }

      const checkNftMedia = (url) => {
        if(url.indexOf('http://')<0 && url.indexOf('https://')<0){
          return `${store.state.nearConfig.IPFS}/ipfs/${url}`
        }else{
          return url;
        }
      }

      return {
        ...toRefs(state),
        closeLayer,
        copy_text,
        triggerCopy,
        handleCopyFun,
        shareTwitter,
        checkNftMedia,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .elastic-layer{
    background: rgba(0,0,0,0.9);
    .nft-detail{
      width:990px;
      height:600px;
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      background: #28282D;
      border-radius: 24px;
      padding:20px;
      display:flex;
      justify-content:space-between;
      .media{
        width:560px;
        height:560px;
        border-radius:10px;
        object-fit: cover;
      }
      .info{
        width:370px;
        position:relative;
        height:560px;
        overflow-y: scroll;
        .mini-title{
          font-family: D-DINExp-Bold;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          font-weight: 700;
          line-height:16px;
        }
        .share-btn{
          position:absolute;
          top:0;
          right:0;
          width:36px;
          height:36px;
          border-radius: 50%;
          background:rgba(255,255,255,0.12) url("@/assets/images/post-item/icon-share.png") no-repeat center center;
          background-size:16px 16px;
          cursor: pointer;
        }
        .name{
          font-family: D-DINExp-Bold;
          font-size: 24px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          line-height:36px;
        }
        .description{
          margin-top:12px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding:16px;
          .desc{
            margin-top:10px;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 20px;
            font-weight: 400;
          }
        }
        .copies-price{
          margin-top:12px;
          display:flex;
          justify-content:space-between;
          .copies-price-item{
            width:179px;
            height:74px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            padding:16px;
            display:flex;
            flex-direction: column;
            justify-content:space-between;
            .copies-price-item-text{
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              line-height:16px;
              &.price-text{
                text-decoration: line-through;
              }
            }

          }
        }
        .user{
          display:flex;
          align-items: center;
          margin-top:12px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding:16px;
          height:60px;
          .avatar{
            width:30px;
            height:30px;
            border-radius: 50%;
          }
          .account{
            margin-left:12px;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            font-weight: 400;
          }
        }
        .royalty{
          display:flex;
          flex-direction: column;
          justify-content:space-between;
          margin-top:12px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding:16px;
          height:74px;
          .text{
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 400;
            line-height:16px;
          }
        }
        .token-info{
          margin-top:12px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding:16px;
          .token-item{
            margin-top:10px;
            display:flex;
            justify-content:space-between;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 400;
            line-height:16px;
            .token-item-address{
              display:flex;
              .address{
                max-width:166px;
              }
              .copy-btn{
                width:24px;
                height:16px;
                padding-left:8px;
                cursor: pointer;
                background:url("@/assets/images/common/icon-copy.png") no-repeat right center;
                background-size:16px;
              }
            }
          }
        }
        
      }
    }
  }
</style>
<style lang="scss">
  .nft-share-popper{
    margin-left:-52px!important;
  }
</style>