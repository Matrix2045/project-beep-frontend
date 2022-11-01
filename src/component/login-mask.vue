<template>
    <div v-if="showLogin"> 
        <div class="mask-box" @click="close()"></div>
        <div class="login-mask">
            <img class="close" @click="close()" src="@/assets/images/common/icon-close-mini.png">
            <div class="top-info">
                <img class="icon" src="@/assets/images/common/logo-popula.png">
                <div class="title">Sign in</div>
                <div v-if="tip" class="tip" style="color: #FF6868;">{{tip}}</div>
                <div v-else class="tip">Connect with one of our available wallet providers<br/>or create a new one.</div>
            </div>
            <div class="button-box">
                <div class="login-button-box">
                    <div class="login-button near" @click="loginNear()">Near Wallet</div>
                </div>
                <div class="login-button-box">
                    <div class="login-button sender" @click="loginSender()">Sender Wallet</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useStore } from 'vuex';
import { getCurrentInstance, reactive, toRefs } from "@vue/runtime-core";
export default {
    props:{
        showLogin:{
            type:Boolean,
            value:false
        }
    },
    setup(props,{ emit }) {
        const store = useStore();
        const state = reactive({
            tip:""
        })
        const loginNear = async () => {
            store.dispatch("login")
        }
        const loginSender = async () => {
            if (typeof window.near !== 'undefined' && window.near.isSender){
                const res = await store.dispatch("login", "sender")
                if(res.error == 'No account exist'){
                    state.tip = "Please log in to the sender wallet account first";
                } else if (res.accessKey) {
                    close()
                }
            }else{
                state.tip = "Please install the sender wallet first";
            }
        }
        const close = () => {
            state.tip  = ""
            emit("closeloginmask")
        }
        return {
            ...toRefs(state),
            loginNear,
            loginSender,
            close
        }
    }
}
</script>

<style lang="scss">
.mask-box{
    position: fixed;
    z-index: 3000;
    top: 0;
    left:0;
    right:0;
    bottom:0;
    background:rgba(0,0,0,0.5);
    cursor:pointer;
}
.login-mask{
    position: fixed;
    z-index: 3001;
    top: 50%;
    left:50%;
    transform: translate(-50%,-50%);
    width: 550px;
    height: 500px;
    border-radius: 30px;
    background: #28282D;
    color: #fff;
    text-align:center;
    font-weight: bold;
    font-size: 24px;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:space-between;
    padding:60px 0;
    .close{
        width:44px;
        height:44px;
        position:absolute;
        top:25px;
        right:25px;
        padding:10px;
        cursor:pointer;
    }
    .top-info{
        .icon{
            display:block;
            width: 90px;
            height: 90px;
            margin:0 auto;
        }
        .title{
            font-family: D-DINExp-Bold;
            font-size: 18px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
            margin-top:20px;
        }
        .tip{
            font-family: D-DINExp;
            font-size: 14px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            margin-top:12px;
            line-height: 18px;
        }
    }
    .login-button-box{
        margin-top:20px;
        width:300px;
        height:60px;
        border-radius:40px;
        background: rgba(255,255,255,0.1);
        padding:2px;
        cursor:pointer;
        &:hover{
            background: #FED23C;
        }
        .login-button{
            width:296px;
            height:56px;
            background: #28282D;
            font-family: D-DINExp;
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 400;
            border-radius:40px;
            display:flex;
            align-items: center;
            justify-content:center;
            &.near{
                background:#28282D url("@/assets/images/common/logo-near.png") no-repeat 16px center;
                background-size:30px;
            }
            &.sender{
                background:#28282D url("@/assets/images/common/logo-sender.png") no-repeat 16px center;
                background-size:30px;
            }
        }
    }
}







</style>