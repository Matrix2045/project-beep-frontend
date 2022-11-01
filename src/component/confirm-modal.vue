<template>
  <div class="elastic-layer confirm-modal-box" @click.self="cancel">
    <div :class="['confirm-modal','confirm-modal-'+$props.title.toLowerCase()]">
      <div class="title">{{$props.title}} ?</div>
      <div class="intro">{{$props.intro}}</div>
      <div class="button-box">
        <div class="button-border button-cancel" @click="cancel">
          <div class="button">Cancel</div>
        </div>
        <div class="button-border" @click="confirm()">
          <div class="button">
            <img  v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>Ok</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, toRefs, watch, getCurrentInstance  } from "vue";
  import { useStore } from 'vuex';
  export default {
    components: {
    },
    props:{
      title:{
        type:String,
        value:''
      },
      intro:{
        type:String,
        value:''
      },
    },
    setup(props,{ emit }) {
      const store = useStore();
      const { proxy } = getCurrentInstance();

      //state
      const state = reactive({
        isLoading:false
      })

      const cancel = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit("cancel");
      }

      const confirm = () => {
        if(state.isLoading){
          return;
        }
        state.isLoading = true;
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit("confirm");
      }


      return {
        ...toRefs(state),
        cancel,
        confirm
      };
    },
    mounted(){
      
    },
  }
</script>


<style lang="scss">
  .confirm-modal-box{
    z-index:99999;
    background: rgba(0, 0, 0, 0.3);
  }
  .confirm-modal{
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    width: 500px;
    z-index:99;
    padding:50px;
    background: #28282D;
    border-radius: 24px;
    border-radius: 10px;
    font-family: D-DINExp;
    font-size: 14px;
    color: #FFFFFF;
    font-weight: 400;

    .title{
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: center;
      line-height: 28px;
      font-weight: 700;
    }
    .intro{
      margin-top:17px;
      font-family: D-DINExp;
      font-size: 16px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0;
      text-align: center;
      line-height: 24px;
      font-weight: 400;
      word-break: break-word;
      cursor: default;
    }
    .button-box{
      display:flex;
      justify-content:space-between;
      margin-top:50px;
      .button-border{
        width:190px;
        height:50px;
        border-radius:25px;
        &:hover::after{
          display:none;
        }
        .button{
          background: #28282D;
          width:186px;
          height:46px;
          border-radius:25px;
        }
      }
      
      .button-cancel{
        background:rgba(255,255,255,0.2);
        &::after{
          display:none;
        }
      }
    }
    &.confirm-modal-delete{
      .button-border{
        background: #FF6868; 
        &:hover::after{
          display:none;
        }
      }
      .button-cancel{
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
  

</style>
