<template>
  <div class="canvas-box">
    <canvas id="mycanvas" width="788" height="788" style="width:394px; height:394px"></canvas>
    <!-- <img id="img1" src="@/assets/images/post/nft-bg1.png">
    <img id="img2" src="@/assets/images/post/nft-bg2.png">
    <img id="img3" src="@/assets/images/post/nft-bg3.png">
    <img id="img4" src="@/assets/images/post/nft-bg4.png">
    <img id="mask" src="@/assets/images/post/nft-bg-mask.png"> -->
  </div>
</template>

<script>
import { ref, reactive, toRefs, watch} from "vue";
import { useStore } from 'vuex';
export default {
  props:{
    text:{
      type:String,
      value:""
    }
  },
  setup(props,{ emit }) {
    const store = useStore();
    const init = () => {
      const canvas = document.getElementById("mycanvas")
      const context = canvas.getContext('2d')
      // const image = document.getElementById('img'+Math.ceil(Math.random()*4),);
      // const mask = document.getElementById('mask');
      // image.onload = function(){
      //   // context.globalAlpha = 0.74;
      //   context.drawImage(image,-6,0,800,788)
      //   // context.drawImage(mask,0,0,788,788)
      //   // context.globalAlpha = 1;
      //   context.textAlign = "center"
      //   context.font = "36px  D-DINExp-Bold bolder"
      //   context.fillStyle = '#FFFFFF'
      //   context.fillText(`@${store.getters.accountId}`,400,328)
      //   context.font = "28px  D-DINExp normal"
      //   canvasTextAutoLine(props.text,canvas,400,392,32)
      //   canvas.toBlob((blob)=>{
      //     emit('setDefaultCover',{
      //       url:canvas.toDataURL('image/jpeg',1),
      //       file:blob,
      //     })
      //   })

      // }

      
      const bgArr = ['#7133FF','#5D5FFF','#17D0AF','#FB62C7','#4A44FF','#6291FB','#15BEE9','#FF9669'];
      context.fillStyle = bgArr[Math.ceil(Math.random()*8)];
      context.fillRect(0,0, 788, 788);
      context.textAlign = "center"
      context.font = "36px  D-DINExp-Bold bolder"
      context.fillStyle = '#FFFFFF'
      context.fillText(`@${store.getters.accountId}`,400,328)
      context.font = "28px  D-DINExp normal"
      canvasTextAutoLine(props.text,canvas,400,392,32)
      canvas.toBlob((blob)=>{
        emit('setDefaultCover',{
          url:canvas.toDataURL('image/jpeg',1),
          file:blob,
        })
      })
      
    }
    const canvasTextAutoLine = (str,canvas,initX,initY,lineHeight) => {
      var ctx = canvas.getContext("2d"); 
      var lineWidth = 0;
      var lastSubStrIndex= 0; 
      let line_num = 1;
      for(let i=0;i<str.length;i++){ 
        lineWidth+=ctx.measureText(str[i]).width; 
        if(line_num>5){
          break;
        }
        if(lineWidth>720){
          ctx.fillText(str.substring(lastSubStrIndex,i),initX,initY);
          initY+=lineHeight;
          lineWidth=0;
          lastSubStrIndex=i;
          line_num += 1;
        } 
        if(i==str.length-1){
          ctx.fillText(str.substring(lastSubStrIndex,i+1),initX,initY);
        }
      }
    }

    return {
      init,
    }
  },
  mounted(){
    this.init()
  }

}
</script>

<style lang="scss" scoped>
  .canvas-box{
    display:none;
    img{
      display:none;
    }
  }
</style>