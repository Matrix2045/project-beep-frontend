<template>
  <div class="page"></div>
</template>

<script>
import { reactive, toRefs,} from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
import MainContract from "@/contract/MainContract";
import * as bs58 from 'bs58';
import { setShareInfo } from '../utils/util';
export default {
  setup(){
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const mainContract = new MainContract(store.state.account);

    const init = async () => {
      const shareInfoCode = route.params.id
      const shareInfo = await setShareInfo(shareInfoCode)
      const hierarchies = shareInfo.args.hierarchies
      //router
      const len = hierarchies.length;
      if(len==1){ //post
        router.push(`/detail/${hierarchies[0]['target_hash']}`)
      }else if(len>1){ //comment
        router.push(`/detail/${hierarchies[0]['target_hash']}?comment=${hierarchies[len-1]['target_hash']}`)
      }
    }
    init()

    return {
    }
  }
}
</script>

<style lang="scss" scoped>
  .page{
    height:100vh;
    background-color: #17171A;
  }
</style>
