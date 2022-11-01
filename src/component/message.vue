<template>
  <div class="mvp-27s-message-box" ref="messageBoxRef">
    <div class="mvp-27s-message-item">
      <div class="icon success" v-if="msg.type === 'success'">
        <img src="@/assets/images/common/message-success.png">
      </div>
      <div class="icon error" v-if="msg.type === 'error'">
        <img src="../assets/images/common/message-error.svg">
      </div>
      <div class="icon warn" v-if="msg.type === 'warn'">
        <img src="../assets/images/common/message-warn.png">
      </div>
      <div class="mvp-27s-message-text" v-html="msg.message">
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick, onMounted, ref } from 'vue';
export default {
  props: {
    msg: {
      type: Object,
      value: {
        message: "success",
        type: "error"
      }
    }
  },
  setup(props) {
    let messageBoxRef = ref(null);
    
    onMounted(() => {
      setTimeout(() => {
        messageBoxRef.value.parentNode.removeChild(messageBoxRef.value);
      }, 2500);
    })

    return {
      messageBoxRef,
    }
  },
}
</script>

<style lang="scss" scoped>
@keyframes message_show {
  from {
    transform: translate(-50%, 0);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 80px);
    opacity: 1;
  }
}
@keyframes message_hide {
  from {
    transform: translate(-50%, 80px);
    opacity: 1;
    
  }
  to {
    transform: translate(-50%, 0);
    opacity: 0;
  }
}
.mvp-27s-message-box {
  position: fixed;
  top: 0;
  left: 50%;
  display: flex;
  justify-content:center;
  align-items: center;
  overflow: hidden;
  padding: 5px;
  z-index: 100;
  animation: message_show .5s, message_hide .5s 2s;
  animation-fill-mode: forwards;
  width:688px;
  height:168px;
  /*background:url("@/assets/images/oldCommon/toast_shadow.png") no-repeat center center;*/
}
.mvp-27s-message-item {
  width:auto;
  display: flex;
  align-items: flex-start;
  padding: 20px 30px;
  background: rgba(0,0,0,0.8);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
  border-radius: 16px;

  .icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    border-radius: 50%;
    &.error {
      background: #F56C6C;
      img{
        width:16px;
      }
    }
  }
}
.mvp-27s-message-text {
  line-height: 28px;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 14px;
  line-height:24px;
  max-width:500px;
}



@media screen and (max-width: 816px) {
  .mvp-27s-message-box {
    width:100%;
    height:110px;
    background-size:100% 100%;
  }
  .mvp-27s-message-item {
    width:85%;
    height:45px;
    border-radius: 15px;
  }
}
</style>