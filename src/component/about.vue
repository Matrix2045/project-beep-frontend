<template>
  <div class="follow-us">
    <div class="font20">Follow us</div>
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
      <!-- Instagram -->
      <!--
      <el-popover
        popper-class="media-pop"
        placement="bottom-start"
        trigger="hover"
        >
        <template #reference>
          <a class="media-item" target="_blank" href="https://www.instagram.com/popula.io/">
            <img src="@/assets/images/common/logo-instagram.png"/>
            <img class="hover" src="@/assets/images/common/logo-instagram-hover.png"/>
          </a>
        </template>
        <div class="pop-box pop-tip">Instagram</div>
      </el-popover>
      -->
    </div>
  </div>
  <!--
  <div class="popula">
    <div class="font20">Popula</div>
    <div class="about-list" >
      <a class="about-item" target="_blank" href="">About Us</a>
      <a class="about-item" target="_blank" href="">Contact Us</a>
      <a class="about-item" target="_blank" href="">Privacy Policy</a>
      <a class="about-item" target="_blank" href="">Cookie Policy</a>
      <p class="about-item gray">@ 2022 popula</p>
    </div>
  </div>-->
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
  .follow-us{
    padding: 20px 20px 30px;
    background: #000000;
    border-radius: 24px;
    .media-list{
      margin-top:30px;
      display: flex;
      justify-content: space-between;
      .media-item{
        display: block;
        cursor:pointer;
        img{
          width: 24px;
          height: 24px;
        }
        img.hover{
          display:none;
        }
        &:hover{
          img{
            display: none;
          }
          img.hover{
            display:block;
          }
        }
      }
    }
  }
  .popula{
    margin-top:20px;
    padding: 20px 20px 30px;
    background: #000000;
    border-radius: 24px;
    .about-list{
      display:flex;
      flex-wrap:wrap;
      margin-top:30px;
      .about-item{
        width:140px;
        margin-bottom:16px;
        line-height: 16px;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;   
        &.gray{
          opacity: 0.5;
          margin-bottom:0;
        }
      }
    }
    
  }
</style>