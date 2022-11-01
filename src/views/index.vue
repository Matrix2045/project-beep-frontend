<template>
  <div class="index-box">
    <div class="banner">
      <img src="@/assets/images/index/banner.png">
      <div class="content">
        <div class="title">
          Where the<br/>
          Community Economy<br/>
          Happens
        </div>
        <div class="button-box">
          <router-link to="/communities">
            <div class="button-border">
              <div class="button">Communities</div>
            </div>
          </router-link>
          <a class="button-register" href="https://0smaupbwvz0.typeform.com/to/BYx9MMTZ?typeform-source=popula.io" target="_blank">Launch Your Community</a>
        </div>
      </div>
    </div>
    <!-- line -->
    
    <div class="line" id="line">
      <div class="scroll-area" id="ul_img">
        <img v-for="i in 5" src="@/assets/images/index/line-logo.png">
      </div>
    </div>

    <div class="main">
      <div class="about-popula">
        <div class="title">About Popula</div>
        <div class="intro">
          Popula is the infrastructure devoted to the Web3 Community Economy which enables participants in the Creator Economy to build their internet reputation and monetise through creation and social engagement.
        </div>
        <img src="@/assets/images/index/about.png">
      </div>
      <!-- Dive into Popula -->
      <div class="dive-into">
        <div class="title">Dive into Popula</div>
        <div class="content">
          <div class="info">
            <div class="info-item">
              <div class="mini-title"><span class="dot" style="background: #659DFF;"></span>Communities Platform</div>
              <div class="intro">A user-friendly Web3 community platform to amplify creations and empower social engagement, where the ownership of content, data, and the power of governance truly belong to the user.</div>
            </div>
            <div class="info-item">
              <div class="mini-title"><span class="dot" style="background: #A668FF;"></span>Drips System</div>
              <div class="intro">Popula Drips System issues Non-transferrable tokens to record value-added behaviour within a community and signal member reputation, contribution, and commitment.</div>
            </div>
            <div class="info-item">
              <div class="mini-title"><span class="dot" style="background: #574AFF;"></span>Communitiy Economy Protocol Set</div>
              <div class="intro">By leveraging the Drips System, Popula’s Community Economy Protocol Set aligns the aims and interests of the community to bootstrap growth and creations, helping creators monetise and incentivise member co-creation. </div>
            </div>
          </div>
          <img src="@/assets/images/index/dive-into.png">
        </div>
      </div>
      <!-- How to BEE Popula? -->
      <div class="bee-popula">
        <div class="title">How to Bee Popula?</div>
        <div class="mod">
          <img src="@/assets/images/index/launch-community.png">
          <div class="content">
            <div class="mini-title">Launch a Community</div>
            <div class="intro">Start your Web3 creator journey powered by the Community Economy.</div>
          </div>
        </div>

        <div class="mod">
          <div class="content">
            <div class="mini-title">Post Web3 Content</div>
            <div class="intro">Retain content ownership and keep interactions verifiable.</div>
          </div>
          <img src="@/assets/images/index/post-content.png">
        </div>

        <div class="mod">
          <img src="@/assets/images/index/create.png">
          <div class="content">
            <div class="mini-title">Create an NFT</div>
            <div class="intro">Fuel your creations with liquidity.</div>
          </div>
        </div>


        <div class="mod">
          <div class="content">
            <div class="mini-title">Token-Gating</div>
            <div class="intro">Ensure the exclusivity of your creations.</div>
          </div>
          <img src="@/assets/images/index/token-gating.png">
        </div>

        <div class="mod coming-soon">
          <img src="@/assets/images/index/coming-soon.png">
          <div class="content">
            <div class="mini-title">Join Popula Server</div>
            <a class="btn" target="_blank" href="https://discord.gg/tnWS95Kwdb">
              <img src="@/assets/images/index/logo-discord.png">
            </a>
          </div>
        </div>
      </div>


      <!-- Keep Vibing to Bee Popula-->
      <div class="keep-vibing">
        <img src="@/assets/images/index/keep-vibing.png">
      </div>
    </div>
  </div>
  <!-- footer-->
  <div class="footer">
    <div class="footer-content">
      <div class="content">
        <div class="media-list" >
          <!-- Discord -->
          <el-popover
            popper-class="media-pop"
            placement="bottom-start"
            trigger="hover"
            >
            <template #reference>
              <a class="media-item" target="_blank" href="https://discord.gg/tnWS95Kwdb">
                <img src="@/assets/images/common/logo-discord.png"/>
                <img class="hover" src="@/assets/images/common/logo-discord-hover.png"/>
              </a>
            </template>
            <div class="pop-box pop-tip">Discord</div>
          </el-popover>
          <!-- Twitter -->
          <el-popover
            popper-class="media-pop"
            placement="bottom-start"
            trigger="hover"
            >
            <template #reference>
              <a class="media-item" target="_blank" href="https://twitter.com/beepopula">
                <img src="@/assets/images/common/logo-twitter.png"/>
                <img class="hover" src="@/assets/images/common/logo-twitter-hover.png"/>
              </a>
            </template>
            <div class="pop-box pop-tip">Twitter</div>
          </el-popover>
          <!-- Medium -->
          <el-popover
            popper-class="media-pop"
            placement="bottom-start"
            trigger="hover"
            >
            <template #reference>
              <a class="media-item" target="_blank" href="https://medium.com/beepopula">
                <img src="@/assets/images/common/logo-medium.png"/>
                <img class="hover" src="@/assets/images/common/logo-medium-hover.png"/>
              </a>
            </template>
            <div class="pop-box pop-tip">Medium</div>
          </el-popover>
          <!-- Github -->
          <el-popover
            popper-class="media-pop"
            placement="bottom-start"
            trigger="hover"
            >
            <template #reference>
              <a class="media-item" target="_blank" href="https://github.com/beepopula">
                <img src="@/assets/images/common/logo-github.png"/>
                <img class="hover" src="@/assets/images/common/logo-github-hover.png"/>
              </a>
            </template>
            <div class="pop-box pop-tip">Github</div>
          </el-popover>
        </div>
        <a class="power" href="https://near.org/" target="_blank">
          Powered by
          <img class="logo-near" src="@/assets/images/index/near.png">
        </a>
      </div>
      <div class="txt">@popula 2022</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs, watch, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
export default {
  setup(){
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
    })

    return {
      ...toRefs(state),
    }
  },
  mounted(){
    this.$router.push({query: {}});
    let left = 0;
    let intervalId = null;
    let ul = document.getElementById("ul_img");
    ul.innerHTML += ul.innerHTML;  
    let lis = ul.getElementsByTagName("img");
    ul.style.width = (lis[0].offsetWidth * lis.length) + "px";  
    function scroll(){
      left -= 1;
      if(left <= -(482+60)) left = 0;
      ul.style.left = left + "px";
      requestAnimationFrame(scroll)
    }
    requestAnimationFrame(scroll)
  }
}
</script>

<style lang="scss" scoped>
  .index-box {
    width: 100%;
    min-height: calc(100vh - 80px);
    margin: 0 auto;
    .banner{
      width:1440px;
      min-width:1440px;
      position: relative;
      margin: 0 auto;
      img{
        width: 100%;
        vertical-align:middle;
      }
      .content {
        position:absolute;
        top:200px;
        left:140px;
        bottom:214px;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        .title{
          font-family: Gilroy-ExtraBold;
          font-size: 60px;
          color: #FFFFFF;
          line-height: 72px;
          font-weight: 900;
        }
        .button-box{
          display:flex;
          .button-register{
            margin-left:30px;
            width:200px;
            height:60px;
            border: 2px solid #FFFFFF;
            border-radius: 30px;
            display:flex;
            align-items: center;
            justify-content:center;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
            cursor: pointer;
            position:relative;
          }
          .button-border{
            width:200px;
            height:60px;
            .button{
              width:196px;
              height:56px;
            }
          }
        }
      }
    }
    .line{
      width:100%;
      height: 40px;
      background: #FFFFFF;
      position: relative;
      overflow: hidden;
      .scroll-area {
        position: absolute;
        top: 9px;
        left: 0;
        height:22px;
        overflow: hidden;
        img{
          width:482px;
          float: left;
          margin-right:60px;
        }
      }
    }
    .main{
      width:1040px;
      padding:150px 0;
      margin: 0 auto;
      .title{
        font-family: Gilroy-Black;
        font-size: 50px;
        color: #FFFFFF;
        font-weight: 900;
        text-align: center;
        line-height:63px;
      }
      .about-popula{
        .intro{
          margin-top:20px;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          text-align: center;
          line-height: 22px;
          font-weight: 400;
        }
        img{
          margin-top:70px;
          width:100%;
        }
      }
      .dive-into{
        margin-top:150px;
        .content{
          margin-top:70px;
          display:flex;
          justify-content:space-between;
          .info{
            display:flex;
            flex-direction: column;
            justify-content:space-between;
            width:440px;
            .info-item{
              .mini-title{
                font-family: D-DINExp-Bold;
                font-size: 18px;
                color: #FFFFFF;
                font-weight: 700;
                line-height:19px;
                display:flex;
                align-items:center;
                .dot{
                  display:block;
                  margin-right:20px;
                  width:8px;
                  height:8px;
                  border-radius:50%;
                  background: #659DFF;
                }
              }
              .intro{
                margin-top:13px;
                font-family: D-DINExp;
                font-size: 14px;
                color: rgba(255,255,255,0.6);
                line-height: 20px;
                font-weight: 400;
              }
            }
          }
          img{
            width:462px;
            height:396px;
          }
        }
      }
      .bee-popula{
        margin-top:150px;
        .title{
          margin-bottom:70px;
        }
        .mod{
          display:flex;
          align-items: center;
          justify-content:space-between;
          margin-bottom:150px;
          &.coming-soon{
            .btn{
              margin-top:40px;
              width: 180px;
              height: 60px;
              background: #4154E4;
              border-radius: 30px;
              display:flex;
              align-items: center;
              justify-content:center;
              &:hover{
                background: #3445C6;
              }
              img{
                width:110px;
              }
            }
          }
          .content{
            width:350px;
            .mini-title{
              font-family: D-DINExp-Bold;
              font-size: 28px;
              color: #FFFFFF;
              font-weight: 700;
              line-height:30px;
            }
            .intro{
              margin-top:16px;
              font-family: D-DINExp;
              font-size: 16px;
              color: rgba(255,255,255,0.6);
              line-height: 24px;
              font-weight: 400;
            }
          }
          img{
            width:500px;
          }
        }

      }
      .keep-vibing{
        img{
          width:100%;
        }
      }
    }
  }
  .footer{
    background: #17171A;
    .footer-content{
      width:1440px;
      padding:0 200px;
      margin:0 auto;
      .content{
        height: 120px;
        display: flex;
        align-items: center;
        justify-content:space-between;
        .media-list{
          display: flex;
          justify-content: space-between;
          .media-item{
            display: block;
            cursor:pointer;
            margin-right:40px;
            img{
              width: 24px;
              height: 24px;
            }
            img.hover{
              display:none;
            }
            &:hover{
              img{
                display:none;
              }
              img.hover{
                display:block;
              }
            }
          }
        }
        .power{
          height:20px;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          font-weight: 400;
          line-height:16px;
          display:flex;
          align-items: center;
          .logo-near{
            margin-left:10px;
            width:60px;
          }
        }
        
      }
      .txt{
        padding:20px 0;
        border-top:1px solid rgba(255,255,255,0.1);
        font-family: D-DINExp;
        font-size: 14px;
        line-height:16px;
        color: rgba(255,255,255,0.6);
        font-weight: 400;
        text-align: center;
      }
    }
    
  }
</style>
