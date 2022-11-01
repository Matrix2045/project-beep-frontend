<template>
  <div class="elastic-layer">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="0"
      :initial-slide="index"
      navigation
      @swiper="setListSwiper"
      >
      <swiper-slide  v-for="(item, index) in imgs"  :key="index" @click.self="close">
          <img :src="$store.getters.getAwsImg(item)" @error.once="$event.target.src=item" :style="'transform:scale('+(ratioList[ratioIndex]/100)+')'"/>
      </swiper-slide>
    </swiper>

    <div class="edit-button close" @click="close"></div>
    <div class="scale-button">
      <div :class="['edit-button','larger',ratioIndex>=15 ? 'disabled' : '']" @click="larger()"></div>
      <div :class="['edit-button','smaller',ratioIndex<=0 ? 'disabled' : '']" @click="smaller()"></div>
    </div>
  </div>
</template>

<script>
  import { ref,reactive, toRefs , onMounted } from "vue";
  import { Swiper, SwiperSlide } from "swiper/vue";
  import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
  import "swiper/css";
  import 'swiper/css/navigation';

  export default {
    components: {
      Swiper,
      SwiperSlide,
    },
    props: {
      imgs:{
        type:Array,
        value:[]
      },
      index:{
        type:Number,
        value:0
      }
    },
    setup(props,{ emit }) {
      const state = reactive({
        ratioList:[25,33,50,67,75,80,90,100,110,125,150,175,200,250,300,400],
        ratioIndex:7
      })

      const close = () => {
        emit("closePreview")
      }

      const larger = () => {
        state.ratioIndex = state.ratioIndex+1 > state.ratioList.length-1 ? state.ratioList.length-1 : state.ratioIndex+1;
      }

      const smaller = () => {
        state.ratioIndex = state.ratioIndex-1 < 0 ? 0 : state.ratioIndex-1;
      }

      return {
        ...toRefs(state),
        modules: [Navigation],
        close,
        larger,
        smaller
      };
    }
  }
</script>

<style lang="scss" scoped>
  .scale-button{
    position: absolute;
    bottom:30px;
    right:30px;
    z-index:10;
    .larger{
      background: rgba(0,0,0,0.30) url("@/assets/images/common/icon-larger.png") no-repeat center center;
      background-size:24px 24px;
      border: 1px solid rgba(255,255,255,0.3);
      cursor: pointer;
    }
    .smaller{
      margin-top:20px;
      background: rgba(0,0,0,0.30) url("@/assets/images/common/icon-smaller.png") no-repeat center center;
      background-size:24px 24px;
      border: 1px solid rgba(255,255,255,0.3);
      cursor: pointer;
    }
    .disabled{
      opacity: .35;
      cursor: auto;
      pointer-events: none;
    }
  }

  .swiper {
    width:100vw;
    height:100vh;
    overflow: hidden;
    .swiper-slide {
      display:flex;
      justify-content:center;
      align-items: center;
      width:100vw!important;
      height:100vh;
      overflow: hidden;
      img{
        width:100%;
        height:100%;
        border-radius: 24px;
        object-fit:contain;
      }
    }
  }
  :deep(.swiper){
    .swiper-button-next,.swiper-button-prev{
      position:fixed;
      width:50px;
      height:50px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.3);
      &::after{
        display:none;
      }
      &::before{
        display:block;
        content:"";
        width:50px;
        height:50px;
        background: rgba(0,0,0,0.30) url("@/assets/images/post-item/icon-prev.png") no-repeat center center;
        background-size:24px 24px;
      }
    }
    .swiper-button-prev{
      left:30px;
    }
    .swiper-button-next{
      right:30px;
      &::before{
        background: rgba(0,0,0,0.30) url("@/assets/images/post-item/icon-next.png") no-repeat center center;
        background-size:24px 24px;
      }
    }
  }

  .edit-button.close{
    background: rgba(0,0,0,0.30) url("@/assets/images/common/icon-close.png") no-repeat center center;
    background-size:24px 24px;
    border: 1px solid rgba(255,255,255,0.3);
  }
</style>