<template>
  <div class="page"></div>
</template>

<script>
import { reactive, toRefs, getCurrentInstance} from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
export default {
  setup(){
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    const init = async () => {
      //get storage
      let info = JSON.parse(localStorage.getItem('verify_twitter_'+store.getters.accountId))
      if(info.callbackUrl == '/mine?from=verify'){
        const res = await proxy.$axios.profile.verify_twitter({state:route.query.state,code:route.query.code})
        info.editInfo.twitter = res.data.url; //res.
        localStorage.setItem('verify_twitter_'+store.getters.accountId,JSON.stringify(info))
        localStorage.setItem('profile_openEdit_'+store.getters.accountId,true);
        router.push('/mine');
      }else if(info.communityId){
        const res = await proxy.$axios.community.verify_twitter({state:route.query.state,code:route.query.code,community_id:info.communityId})
        info.editInfo.media.twitter = {
          url:res.data.url,
          verified:true
        }
        localStorage.setItem('verify_twitter_'+store.getters.accountId,JSON.stringify(info))
        localStorage.setItem('community_openEdit_'+store.getters.accountId,true);
        router.push('/community-detail/'+info.communityId);
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
