<template>
  <div :class="['page-box',$route.name=='home' ? 'page-index' : '']">
    <page-header></page-header>
    <router-view :key="$route.fullPath"></router-view>
    <suspend/>
  </div>
</template>
<script>
import pageHeader from "@/layout/header.vue";
import suspend from "@/component/suspend.vue";

export default {
  components: {
    pageHeader,
    suspend
  },
};
</script>
<style lang="scss">
  body.fixed{
    height:100%;
    overflow:hidden;
  }
  .page-box {
    height: 100%;
    width:100vw;
    min-width:1440px;
    transition: 1s;
    background-color: #17171A;
    overflow-y: hidden;
    overflow-x: hidden;
    padding-bottom:100px;
    min-height: 100vh;
    &.page-index{
      background: #020202;
      padding-bottom:0;
      .page-header-box{
        background:rgba(0,0,0,0.9);
      }
    }
  }

  .main-box{
    padding:110px 200px 100px;
    width:1440px;
    min-width:1440px;
    min-height: calc(100vh - 80px);  
    margin: 0 auto;
    position:relative;
    .main{
      display:flex;
      justify-content:space-between;
      .left {
        width:710px;
      }
      .right {
        width:320px;
      }
    }
  }

  .font20{
    font-family: D-DINExp-Bold;
    font-size: 20px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 700;
  }
  .font18{
    font-family: D-DINExp-Bold;
    font-size: 18px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 700;
  }
  .txt-wrap {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-word;
  }
  .txt-wrap2{
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }
  .icon{
    width:24px;
    height:24px;
  }
  .icon16{
    width:16px;
    height:16px;
  }
  .gas{
    font-family: D-DINExp;
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0;
    text-align: right;
    font-weight: 400;
    display:flex;
    align-items: center;
    padding-right:16px;
    background:url("@/assets/images/common/icon-gas.png") no-repeat center right;
    background-size:12px;
    cursor:pointer;
    &:hover{
      color: rgba(255,255,255,1);
      background-image:url("@/assets/images/common/icon-gas-hover.png");
    }
  }
  .user-flag{
    margin-left:4px;
    width: 20px;
    height: 14px;
    cursor: pointer;
    &.op{
      background:url("@/assets/images/common/op.png") no-repeat right center;
      background-size:20px 14px;
    }
    &.co{
      background:url("@/assets/images/common/co.png") no-repeat right center;
      background-size:20px 14px;
    }
    &.mod{
      width:28px;
      background:url("@/assets/images/common/mod.png") no-repeat right center;
      background-size:28px 14px;
    }
  }

  .no-more{
    margin-top:30px;
    font-family: D-DINExp;
    font-size: 16px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0;
    text-align: center;
    font-weight: 400;
  }

  .filter-menu{
    display:flex;
    margin-top:60px;
    .filter-menu-item{
      margin-right:40px;
      padding:8px 0;
      line-height: 22px;
      font-family: D-DINExp;
      font-size: 20px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0;
      text-align: right;
      font-weight: 400;
      cursor:pointer;
      position: relative;
      &:last-child {
        margin-right:0;
      }
      .unread-count{
        position:absolute;
        top:4px;
        right:-44px;
        width: 44px;
        height: 28px;
        background: #ED1F5A;
        border-radius: 17px;
        font-family: D-DINExp-Bold;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        transform-origin:top left;
        transform:scale(0.5);
        display:flex;
        justify-content:center;
        align-items:center;

      }
      &.active{
        color: rgba(255,255,255,1);
        &:after{
          content: "";
          position: absolute;
          bottom: 0;
          left:50%;
          transform:translateX(-50%);
          width: 30px;
          height: 4px;
          // background-image: linear-gradient(129deg, #F75D23 0%, #E6274E 35%, #5878E5 100%);
          // border-radius: 30px;
          background: #FED23C;
          border-radius: 2px;

        }
      }
    }
  }

  .white-loading{
    display: block;
    width:18px;
    height:18px;
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

  .button-border{
    padding: 2px;
    width: 144px;
    height: 40px;
    border-radius: 40px;
    background:  #FED23C;
    cursor:pointer;
    position:relative;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left:0;
      width: 100%;
      height: 100%;
      transform-origin:center;
      transform:scale(1.1);
      filter: blur(10px) brightness(80%) opacity(.8);
      border-radius: 40px;
      background:  #FED23C;
      z-index: 1;
      transition:opacity 0.7s;
      opacity:0;
    }
    &:hover{
      &::after {
        opacity:0.8;
      }
    }
    .button{
      width: 140px;
      height: 36px;
      border-radius: 36px;
      background: #000000;
      display:flex;
      align-items: center;
      justify-content: center;
      font-family: D-DINExp-Bold;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: center;
      font-weight: 700;
      position:relative;
      z-index:2;
    }
    &.disabled{
      background: rgba(255,255,255,0.1);
      &::after{
        display: none;
      }
      .button{
        color: rgba(255,255,255,0.3);
      }
    }
  }

  .mini-button-border{
    padding: 2px;
    width: 90px;
    height: 40px;
    border-radius: 24px;
    background:  #FED23C;
    cursor:pointer;
    position:relative;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left:0;
      width: 100%;
      height: 100%;
      transform-origin:center;
      transform:scale(1.1);
      filter: blur(10px) brightness(80%) opacity(.8);
      border-radius: 24px;
      background:  #FED23C;
      z-index: 1;
      transition:opacity 0.7s;
      opacity:0;
    }
    &:hover{
      &::after {
        opacity:0.8;
      }
    }
    .mini-button{
      width: 86px;
      height: 36px;
      border-radius: 20px;
      background: #28282D;
      display:flex;
      align-items: center;
      justify-content: center;
      font-family: D-DINExp-Bold;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: center;
      font-weight: 700;
      position:relative;
      z-index:2;
    }
    &.disabled{
      background: rgba(255,255,255,0.1);
      &::after{
        display: none;
      }
      .mini-button{
        color: rgba(255,255,255,0.3);
      }
    }
    &.following{
      .hover-text{
        display:none;
      }
      &::after{
        display:none;
      }
      background: rgba(255,255,255,0.2);
      &:hover{
        background: rgba(255,104,104,0.2);
        .mini-button{
          color: #FF6868;
          .static-text{
            display:none;
          }
          .hover-text{
            display:block;
          }
        }
      }
    }
  }

  .el-popover{
    min-width:40px!important;
    width:auto!important;
    height:auto!important;
    padding:0!important;
    background:transparent!important;
    box-shadow:none!important;
    border:none!important;
    .el-popper__arrow{
      display:none;
    }
  }
  .edit-popper{
    margin-left:-58px!important;
  }
  .pop-box{
    background: #000000;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
    border-radius: 10px;
    font-family: D-DINExp;
    font-size: 14px;
    color: #FFFFFF;
    font-weight: 400;
    &.pop-tip{
      padding:0 20px;
      width: auto;
      height: 40px;
      display:flex;
      justify-content: center;
      align-items: center;
      color:rgba(255,255,255,0.5);
    }
    &.pop-intro{
      width: 320px;
      padding:20px;
      &.pop-notice{
        z-index:99;
        padding:30px;
        .intro{
          a{
            display: inline;
            color: rgba(255,255,255,1);
          }
        }
      }
      &.pop-hash{
        width:198px;
        border: 0;
      }
      .title{
        font-family: D-DINExp-Bold;
        font-size: 16px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
      }
      .intro{
        margin-top:8px;
        font-family: D-DINExp;
        font-size: 14px;
        color: rgba(255,255,255,0.5);
        letter-spacing: 0;
        text-align: left;
        line-height: 22px;
        font-weight: 400;
        word-break: break-word;
        a{
          display: inline;
        }
      }
      .hash-txt{
        margin-top:0;
        font-family: D-DINExp;
        font-size: 14px;
        color: rgba(255,255,255,1);
        letter-spacing: 0;
        font-weight: 400;
        padding-right:22px;
        position: relative;
        text-decoration:underline;
        line-height:16px;
        >a{
          display:block;
          width:136px;
        }
        &:hover{
          color: rgba(255,255,255,0.7);
        }
        .icon-copy{
          width:16px;
          height:16px;
          position:absolute;
          right:0;
          top:50%;
          transform: translateY(-50%);
          cursor:pointer;
        }
      }
    }
    &.pop-edit{
      width:140px;
      background:rgba(0,0,0,1);
      overflow: hidden;
      .pop-edit-item{
        padding:0 25px;
        height: 50px;
        border-radius: 1px;
        display:flex;
        
        align-items:center;
        cursor:pointer;
        .icon16{
          width:16px;
          height:16px;
          margin-right:10px;
        }
        &:hover{
          background: rgba(40,40,45,0.5);
        }
      }
    }
    .button-box{
      display:flex;
      justify-content:space-between;
      padding:30px 32px 0;
      .mini-button{
        background:#000;
      }
      .button-cancel{
        background:rgba(255,255,255,0.2);
        &::after{
          display:none;
        }
      }
    }
  }

  .elastic-layer{
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background: rgba(0,0,0,0.9);
    z-index:99;
    .layer-content{
      overflow-x:hidden;
      overflow-y:scroll;
      padding:60px 10px 60px 0;
      height:100vh;
      width:100%;
    }
    .edit-button{
      width: 50px;
      height: 50px;
      border-radius:50%;
      cursor:pointer;
    }
    .close{
      position:absolute;
      top:30px;
      right:30px;
      background: rgba(255,255,255,0.12) url("@/assets/images/common/icon-close.png") no-repeat center center;
      background-size:24px 24px;
      z-index:10;
    }
  }

  .vue3-emojipicker{
    position:relative;
    z-index:1;
    .mt-4{
      margin-top:0!important;
    }
    .vue3-discord-emojipicker__gifbutton{
      display:none!important;
    }
    header,.bg-grey-700{
      display:none!important;
    }
    .vue3-discordpicker__container{
      border-radius:10px;
      overflow: hidden;
      >.bg-grey-400{
        padding-bottom:20px;
      }
    }
    .vue3-discord-emojipicker{
      box-shadow:none;
    }
    .vue3-discord-emojipicker__emojibutton{
      width: 24px!important;
      height: 24px!important;
      margin-left:0!important;
      margin-right:30px!important;
      cursor: pointer!important;
      background:url("@/assets/images/post/icon-emoji.png") no-repeat center center!important;
      background-size:24px 24px!important;
      &:hover{
        background-image:url("@/assets/images/post/icon-emoji-hover.png")!important; 
        transform:scale(1);
      }
    }
    .vue3-discord-emojipicker{
      right:auto;
      top:42px!important;
      left:0!important;
      transform:translate(0,0)!important;
    }
  }

  .suspend{
    width:70px;
    position:fixed;
    right:40px;
    bottom:100px;
    z-index:98;
    display:flex;
    flex-direction:column;
    align-items:center;
    .back-top{
      display:none;
      width: 50px;
      height: 50px;
      border-radius:50%;
      background: rgba(255,255,255,0.12) url("@/assets/images/common/icon-top.png") no-repeat center center;
      background-size:24px;
      cursor:pointer;
      &:hover{
        background-color:rgba(255,255,255,0.3);
      }
    }

    .button-box{
      margin-top:20px;
      width:70px;
      height:70px;
      cursor:pointer;
      &:hover{
        background:url("@/assets/images/post/bg-post-hover.png") no-repeat center center;
        background-size:100% 100%;
      }
      .button{
        width: 50px;
        height: 50px;
        margin:0 auto;
        display:flex;
        align-items: center;
        justify-content: center;
        background:url("@/assets/images/post/bg-post.png") no-repeat center center;
        background-size:100% 100%;
        img{
          width:24px;
          height:24px;
        }
      }
    }

    .suspend-elastic-layer{
      overflow-y: scroll;
      .post,.comment{
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
      }
    }
  }

  .text-ellipsis-wrapper {
    display: flex;
    overflow: hidden;
    .txt-wrap5 {
      font-size: 16px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: justify;
      line-height: 26px;
      font-weight: 400;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: justify;
      position: relative;
      max-height: 130px;
      transition: .3s max-height;
      &::before {
        content: '';
        height: calc(max(100%,130px) - 26px);
        float: right;
      }
      &::after {
        content: '';
        width: 999vw;
        height: 999vw;
        position: absolute;
        box-shadow: inset calc(100px - 999vw) calc(30px - 999vw) 0 0 #28282D;
        margin-left: -95px;
      }
      .btn{
        position: relative;
        float: right;
        clear: both;
        height:26px;
        margin-left: 20px;
        font-size: 16px;
        line-height: 26px;
        cursor: pointer;
        /* margin-top: -30px; */
        &::before{
          content: '...';
          position: absolute;
          left: -5px;
          font-size: 16px;
          color: #FFFFFF;
          transform: translateX(-100%)
        }
        &::after{
          content:'more';
          font-family: D-DINExp;
          font-size: 16px;
          color: #FED23C;
          font-weight:400;
        }
      }
      &.showall{
        max-height: none;
        &::after{
          visibility: hidden;
        }
        .btn::before{
          visibility: hidden;
        }
        .btn::after{
          content:'fold'
        }
      }
      &.hidebtn{
        &::before,&::after,.btn{
          display:none;
        }
      }
    }
  }

  span.atFont{
    font-family: D-DINExp;
    font-size: 16px;
    color: #FED23C;
    letter-spacing: 0;
    text-align: justify;
    line-height: 24px;
    font-weight: 400; 
  }

  .no-result{
    padding:80px 0;
    background: #28282D;
    border-radius: 24px;
    font-family: D-DINExp;
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0;
    text-align: center;
    font-weight: 400;
    line-height:16px;
    img{
      display:block;
      width: 60px;
      height: 60px;
      margin:0 auto 12px;
    }
  }
  
  .text span.atFont{
    cursor: pointer;
  }

  @keyframes addcount {
    0% {
      opacity: 1;
      transform:scale(1) translate(-50%,0);
    }
    100% {
      opacity: 0;
      transform:scale(1) translate(-50%,-20px);
    }
  }
  .comment{
    position:relative;
    &::before{
      display:none;
      content:"+1";
      padding-left:24px;
      width:100%;
      font-family: D-DINExp;
      font-size: 14px;
      color: #ED1F5A;
      text-align:center;
      position:absolute;
      left:50%;
      transform:translate(-50%,0) scale(1);
      bottom:15px;
      animation: addcount 2s;
    }
    &.add-count{
      &::before{
        display:block;
      }
    }
  }



  ::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,0);
    border-radius: 3px;
    background-color: transparent;
  }
  ::-webkit-scrollbar
  {
    width: 6px;
    border-radius: 3px;
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb
  {
    border-radius: 3px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);
    background: #55555A;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
      -webkit-appearance: none;
  }
  input[type="number"]{
      -moz-appearance: textfield;
  }

</style>