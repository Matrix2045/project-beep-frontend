<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- user-info -->
        <div class="user-info" v-if="user.data">
          <div class="bg-box">
            <img v-if="user.background" class="bg" :src="$store.getters.getAwsImg(user.background)" @error.once="$event.target.src=user.background" />
            <img v-else class="bg" src="@/assets/images/profile/bg.png"/>
          </div>
          <div class="btns">
            <div class="btn edit" v-if="accountId == $store.getters.accountId" @click="showEditLayer()"></div>
            <el-popover placement="bottom-start"  trigger="hover">
              <template #reference>
                <div class="btn share"></div>
              </template>
              <div class="pop-box pop-edit">
                <div class="pop-edit-item" @click="shareTwitter()">
                  <img class="icon16" src="@/assets/images/post-item/icon-twitter-mini.png"/>
                  Twitter
                </div>
                <div class="pop-edit-item" @click="triggerCopy()">
                  <img class="icon16" src="@/assets/images/post-item/icon-link.png"/>
                  Copy link
                </div>
              </div>
            </el-popover>
            
          </div>
          <div class="info">
            <img v-if="user.avatar" class="avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
            <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
            <div class="follow-button" v-if="user.account_id !== $store.getters.accountId">
              <FollowButton 
                :isFollow="user.data.is_follow" 
                :accountId="user.account_id" 
                @follow = "follow"
              />
            </div>
            <div class="name  txt-wrap">{{user.name || user.account_id}}</div>
            <div class="account  txt-wrap">{{user.account_id}}</div>
            <div class="total">
              <div class="total-item" @click="showFollowList('followers')"><span>{{user.data.follows}}</span>Followers</div>
              <div class="total-item" @click="showFollowList('following')"><span>{{user.data.following}}</span>Following</div>
              <div class="total-item" @click="showPostList()"><span>{{user.data.post_count}}</span>Posts</div>
            </div>
            <div class="bio txt-wrap2">{{user.bio}}</div>
            <div class="media-list-box">
              <div class="media-list">

                <!-- Twitter -->
                <a v-if="user.twitter && user.twitter.url" class="media-item" :href="checkUrl(user.twitter.url)" target="_blank">
                  <img class="plat-icon" src="@/assets/images/common/logo-twitter.png"/>
                  <img class="plat-icon hover" src="@/assets/images/common/logo-twitter-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-twitter-grey.png"/>
                </div>

                <!-- Instagram -->
                <a v-if="user.instagram && user.instagram.url" class="media-item" :href="checkUrl(user.instagram.url)" target="_blank">
                  <img class="plat-icon" src="@/assets/images/common/logo-instagram.png"/>
                  <img class="plat-icon hover" src="@/assets/images/common/logo-instagram-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-instagram-grey.png"/>
                </div>

                <!-- YouTube -->
                <a v-if="user.youtube && user.youtube.url" class="media-item" :href="checkUrl(user.youtube.url)" target="_blank">
                  <img class="plat-icon" src="@/assets/images/common/logo-youtube.png"/>
                  <img class="plat-icon hover" src="@/assets/images/common/logo-youtube-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-youtube-grey.png"/>
                </div>

                <!-- TikTok -->
                <a v-if="user.tiktok && user.tiktok.url" class="media-item" :href="checkUrl(user.tiktok.url)" target="_blank">
                  <img class="plat-icon" src="@/assets/images/common/logo-tiktok.png"/>
                  <img class="plat-icon hover" src="@/assets/images/common/logo-tiktok-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-tiktok-grey.png"/>
                </div>

                <!-- Website -->
                <a v-if="user.website && user.website.url" class="media-item" :href="checkUrl(user.website.url)" target="_blank">
                  <img class="plat-icon" src="@/assets/images/common/logo-link.png"/>
                  <img class="plat-icon hover" src="@/assets/images/common/logo-link-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-link-grey.png"/>
                </div>

              </div>
            </div>
          </div>
        </div>
        <!-- filter-menu  -->
        <div class="filter-menu" ref="profileList">
          <div :class="['filter-menu-item',currentTab == 'post' ? 'active' : '']" @click="changeTab('post')">Posts <span v-if="count.post">({{count.post}})</span></div>
          <div :class="['filter-menu-item',currentTab == 'reply' ? 'active' : '']" @click="changeTab('reply')">Replies <span v-if="count.reply">({{count.reply}})</span></div>
          <div :class="['filter-menu-item',currentTab == 'like' ? 'active' : '']" @click="changeTab('like')">Likes <span v-if="count.like">({{count.like}})</span></div>
        </div>
        <!-- list -->
        <div class="list">
          <template v-for="item in list[currentTab]">
            <template v-if="item.post_id">
              <CommentItemProfile 
              :item="item" 
              :user="user"
              :unJoinCommunity="!item.data.is_join"
              @changeListStatus="changeListStatus(item,$event)" />
            </template>
            <template v-else>
              <PostItem 
                :item="item" 
                :unJoinCommunity="!item.data.is_join" 
                @changeListStatus="changeListStatus(item,$event)"/>
            </template>
          </template>
        </div>
        <div class="loading-box" v-if="isLoading">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </div>
        <div class="no-more" v-else-if="isEnd">
          <div class="no-result"  v-if="list[currentTab]['length'] == 0">
            <img src="@/assets/images/common/emoji-null.png"/>
            No data
          </div>
          <template v-else>No more</template>
        </div>
      </div>
      <!-- right -->
      <div class="right">
        <!-- Joine 10 Communities -->
        <div class="right-mod joined-communities" v-if="joinedCommunities.length>0">
          <div class="title">
            <div class="font20">Communities Joined</div>
            <div class="more" @click="showCommunityList()">More</div>
          </div>  
          <div class="communities">
            <div :class="['community',index%3==2 ? 'mr0' : '']" v-for="(item,index) in joinedCommunities">
              <router-link :to="'/community-detail/'+item.community_id">
                <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                <img v-else class="avatar" src="@/assets/images/community/default-avatar.png">
                <div class="name txt-wrap">{{item.name}}</div>
              </router-link>
            </div>
          </div>
        </div>
        <!-- NFTs -->
        <div class="right-mod nft-box" v-if="nfts.length>0">
          <div class="title">
            <div class="font20">NFTs</div>
            <div class="more" @click="showNftList()">More</div>
          </div>  
          <div class="nfts">
            <div :class="['nft',index%3==2 ? 'mr0' : '']" v-for="(item,index) in nfts" @click="showNftLayer(item)">
              <img class="avatar" :src="checkNftMedia(item.metadata.media)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- follow layer -->
    <div class="elastic-layer follow-layer" v-if="showFollows" @click.self="closeFollowList()">
      <div class="edit-button close" @click="closeFollowList()"></div>
      <div class="follow-box">
        <div class="tab-box">
          <div :class="['tab',followCurrentTab == 'followers' ? 'active' : '']" @click="changeFollowTab('followers')">Followers</div>
          <div :class="['tab',followCurrentTab == 'following' ? 'active' : '']" @click="changeFollowTab('following')">Following</div>
        </div>

        <div v-if="isEndFollow && followList[followCurrentTab]['length']==0" class="no-result">
          <img src="@/assets/images/common/emoji-null.png"/>
          No data
        </div>

        <div v-else-if="followList[followCurrentTab]['length']>0" class="follow-list" ref="followDiv" @scroll="followScroll()">
          <div class="follow-item" v-for="user in followList[followCurrentTab]" :key="user.data.account_id">
            <el-popover placement="bottom" :fallback-placements="[ 'top']"  trigger="hover" @show="user.showUser=true" @hide="user.showUser=false">
              <template #reference>
                <router-link :to="'/user-profile/'+user.data.account_id">
                  <img v-if="user.data.avatar" class="avatar" :src="$store.getters.getAwsImg(user.data.avatar)" @error.once="$event.target.src=user.data.avatar" />
                  <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                </router-link>
              </template>
              <template v-if="user.showUser">
                <UserPopup  :account="user.data.account_id" :hideBtn="true"  @login="showLogin=true" />
              </template>
            </el-popover>
            <router-link :to="'/user-profile/'+user.data.account_id">
              <div class="info">
                <div class="name txt-wrap">{{user.data.name || user.data.account_id}}</div>
                <div class="account txt-wrap">{{user.data.account_id}}</div>
              </div>
            </router-link>
          
            <!-- follow -->
            <div class="follow-button" v-if="user.data.account_id !== $store.getters.accountId" >
              <FollowButton 
                :isFollow="user.data.is_follow" 
                :accountId="user.data.account_id" 
                @follow = "follow"
              />
            </div>
          </div>
          <div class="no-more" v-if="isEndFollow">No more</div>
        </div>

        <!-- loading -->
        <div class="loading-box" v-if="isLoadingFollow">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </div>
        
      </div>
    </div>

    <!-- communities layer -->
    <div class="elastic-layer" v-if="showCommunities" @click.self="closeCommunityList()">
      <div class="edit-button close" @click="closeCommunityList()"></div>
      <div class="layer-content" @click.self="closeCommunityList()">
        <div class="elastic-content">
          <div class="title">Joined Communities</div>
          <div id="community-list" class="community-list">
            <div v-for="(item,index) in joinedCommunityList" :class="['community-item',index%3==2 ? 'mr0' : '']">
              <router-link :to="'/community-detail/'+item.community_id">
                <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                <img v-else class="avatar" src="@/assets/images/community/default-avatar.png">
                <div class="name txt-wrap">{{item.name}}</div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- nfts layer -->
    <div class="elastic-layer" v-if="showNfts">
      <div class="edit-button close" @click="closeNftList()"></div>
      <div class="layer-content" @click.self="closeNftList()" ref="nftDiv" @scroll="nftScroll()">
        <div class="elastic-content">
          <div class="title">
            NFTs
            <div class="filter-menu">
              <div :class="['filter-menu-item',nftCurrentTab == 'collected' ? 'active' : '']" @click="changeNftTab('collected')">Collected {{nftCount['collected']}}</div>
              <div :class="['filter-menu-item',nftCurrentTab == 'created' ? 'active' : '']" @click="changeNftTab('created')">Created {{nftCount['created']}}</div>
            </div>
          </div>

          <div v-if="isEndNft && nftList[nftCurrentTab]['length']==0" class="no-result">
            <img src="@/assets/images/common/emoji-null.png"/>
            No data
          </div>

          <div v-else-if="nftList[nftCurrentTab]['length']>0" id="nft-list" class="nft-list" >
            <div v-for="(item,index) in nftList[nftCurrentTab]" :class="['nft-item',index%3==2 ? 'mr0' : '']" @click="showNftLayer(item)">
              <img class="media" :src="checkNftMedia(item.metadata.media)"/>
              <div class="nft-info">
                <div class="name txt-wrap">{{item.metadata.title}}</div>
                <div class="sale">Sale</div>
                <div class="see-details">See Details</div>
              </div>
            </div>
            <div class="no-more" v-if="isEndNft">No more</div>
          </div>
          <!-- loading -->
          <div class="loading-box" v-if="isLoadingNft">
            <img class="white-loading" src="@/assets/images/common/loading.png"/>
          </div>

        </div>
      </div>
    </div>

    <!-- ProfileEdit -->
    <template v-if="showEdit">
      <ProfileEdit :accountId="user.account_id" :editInfo="editInfo" @updateInfo="updateInfo" @closeEditLayer="showEdit=false"/>
    </template>

    <!-- ProfileEdit -->
    <template v-if="showNftDetail">
      <NftDetail :user="user" :item="currentNftItem" @close="showNftDetail=false"/>
    </template>

    <!-- login-mask -->
    <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>

    <!-- #copy_text  display:none;  -->
    <div ref="copy_text"  id="copy_text"  @click="handleCopyFun"></div>


  </div>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  import NftContract from "@/contract/NftContract";
  import FollowButton from "@/component/follow-button.vue";
  import PostItem from '@/component/post-item.vue';
  import UserPopup from '@/component/user-popup.vue';
  import CommentItemProfile from '@/component/comment-item-profile.vue';
  import loginMask from "@/component/login-mask.vue";
  import ProfileEdit from "@/component/profile-edit.vue";
  import NftDetail from "@/component/nft-detail.vue";
  import { copyText } from 'vue3-clipboard';
  import * as bs58 from 'bs58';
  import axios from 'axios';

  export default {
    components: {
      FollowButton,
      PostItem,
      CommentItemProfile,
      UserPopup,
      loginMask,
      ProfileEdit,
      NftDetail
    },
    setup() {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      const { proxy } = getCurrentInstance();
      const nftContract = new NftContract(store.state.account);

      const state = reactive({
        accountId : "",
        user: {}, 
        //list
        currentTab:"",
        list:{
          post:[],
          reply:[],
          like:[]
        },
        count:{
          post:0,
          reply:0,
          like:0,
        },
        page:0,
        limit:10,
        isEnd:false,
        isLoading:false,
        //folllow
        showFollows:false,
        followCurrentTab:'',
        isLoadingFollow:false,
        isEndFollow:false,
        followPage:0,
        followList:{
          followers:[],
          following:[]
        },
        //community
        joinedCommunities:[],
        joinedCommunityList:[],
        showCommunities:false,
        //nft
        nfts:[],
        showNfts:false,
        nftCurrentTab:'',
        isLoadingNft:false,
        isEndNft:false,
        nftPage:0,
        nftList:{
          collected:[],
          created:[],
        },
        nftCount:{
          collected:0,
          created:0,
        },
        showNftDetail:false,
        currentNftItem:{},
        // pageNft:0,
        // limitNft:10,
        //edit
        showEdit:false,
        editInfo:{},
        //other
        shareLink:`${window.location.protocol}//${window.location.host}/user-profile/${route.params.id || store.getters.accountId}`,
        showLogin:false,
        
      });

      //init
      const init = async () => {
          if(!route.params.id && !store.getters.accountId){
            router.push('/');
          }
          state.accountId = route.params.id || store.getters.accountId;
          const res = await proxy.$axios.profile.get_user_info({
            account_id:state.accountId,
            current_account_id: store.getters.accountId || ''
          });
          if(res.success){
            state.user = res.data;
            state.joinedCommunityList = state.user.data.joined_communities || [];
            state.joinedCommunities = state.joinedCommunityList.slice(0,6);
          }
          if(route.query.nft){
            try{
              const params = JSON.parse(bs58.decode(route.query.nft).toString())
              const nft_token = await store.state.viewAccount.viewFunction(params.contract_id, "nft_token", {token_id: params.token_id}); 
              if(nft_token.owner_id == state.accountId){
                state.currentNftItem = {...nft_token,contract_id:params.contract_id};
                state.showNftDetail = true;
              }
            }catch(e){}
          }

          if(localStorage.getItem('profile_openEdit_'+store.getters.accountId)){
            localStorage.removeItem('profile_openEdit_'+store.getters.accountId)
            verifyCallback();
          }

          changeTab('post');
          initCount();
          initNfts();
      }

      const verifyCallback = () => {
        const info = JSON.parse(localStorage.getItem('verify_twitter_'+store.getters.accountId));
        const editInfo = info ? info.editInfo : {};
        state.editInfo = {
          name:editInfo.name || state.user.name || '',
          avatar:editInfo.avatar || state.user.avatar || '',
          background:editInfo.background || state.user.background || '',
          bio:editInfo.bio || state.user.bio || '',

          website:editInfo.website || (state.user.website ? state.user.website.url : ''),
          twitter:state.user.twitter ? state.user.twitter.url : '',
          instagram:editInfo.instagram ||  (state.user.instagram ? state.user.instagram.url : ''),
          youtube:editInfo.youtube || (state.user.youtube ? state.user.youtube.url : ''),
          tiktok:editInfo.tiktok || (state.user.tiktok ? state.user.tiktok.url : ''),
        };
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showEdit = true;
        localStorage.removeItem('verify_twitter_'+store.getters.accountId);
      }

      const initNfts = async () => {

        const collected_res = await proxy.$axios.profile.get_user_nfts({
          account_id:state.accountId,
          type:'collected',
          page:0,
          limit:10
        });
        state.nftCount.collected = collected_res.count;


        const created_res = await proxy.$axios.profile.get_user_nfts({
          account_id:state.accountId,
          type:'created',
          page:0,
          limit:10
        });
        state.nftCount.created = created_res.count;

        const nfts = collected_res.data.concat(created_res.data).slice(0,6)
        //handle data
        state.nfts = await handleNftData(nfts);
      }

      const initCount = async () => {
        const replies = await proxy.$axios.profile.get_user_replies({
          page:0,
          limit:1,
          account_id:state.accountId,
          current_account_id: store.getters.accountId || ''
        });
        state.count.reply = replies.count;
        const likes = await proxy.$axios.profile.get_user_likes({
          page:0,
          limit:1,
          account_id:state.accountId,
          current_account_id: store.getters.accountId || ''
        });
        state.count.like = likes.count;
      }

      const follow = (res) => {
        state.user.data.follows = res.isFollow ? state.userDetail.data.follows + 1 : state.userDetail.data.follows -1;
      }

      const addNewPost = () => {
        changeTab('post');
      }


      //changeTab
      const changeTab = async (tab) => {
        if(state.currentTab == tab) return;
        //reset data
        state.currentTab = tab;
        state.list[state.currentTab] = [];
        state.page = 0;
        state.isEnd = false;
        //request
        const res = await getList();
        state.list[state.currentTab] = res.data;
        state.count[state.currentTab] = res.count;
      }

      //getList
      let CancelToken = axios.CancelToken;
      const getList = async () => {
        if(state.cancel){
          state.cancel();
        }
        const cancelToken = new CancelToken((c) => {
          state.cancel = c;
        })
        state.isLoading = true;
        let res = null
        if(state.currentTab=="post"){
          res = await proxy.$axios.profile.get_user_posts({
            page:state.page,
            limit:state.limit,
            account_id:state.accountId,
            current_account_id: store.getters.accountId || ''
          },cancelToken);
        }else if(state.currentTab=="reply"){
          res = await proxy.$axios.profile.get_user_replies({
            page:state.page,
            limit:state.limit,
            account_id:state.accountId,
            current_account_id: store.getters.accountId || ''
          },cancelToken);
        }else if(state.currentTab=="like"){
          res = await proxy.$axios.profile.get_user_likes({
            page:state.page,
            limit:state.limit,
            account_id:state.accountId,
            current_account_id: store.getters.accountId || ''
          },cancelToken);
        }
        state.isLoading = false;
        if(res && res.success){
          if(res.data.length==0){
            state.isEnd = true;
          }
          state.page += 1;
          return res;
        }else{
          state.isEnd = true;
        }
        return {
          data:[],
          count:0
        };
      }

      //handleScroll
      const handleScroll = async () => {
        if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.currentTab){
          const res = await getList();
          state.list[state.currentTab] = state.list[state.currentTab].concat(res.data);
        }
      }

      //edit
      const showEditLayer = () => {
        state.editInfo = {
          name:state.user.name || '',
          avatar:state.user.avatar || '',
          background:state.user.background || '',
          bio:state.user.bio || '',

          website:state.user.website ? state.user.website.url :'',
          twitter:state.user.twitter ? state.user.twitter.url :'',
          instagram:state.user.instagram ? state.user.instagram.url :'',
          youtube:state.user.youtube ? state.user.youtube.url :'',
          tiktok:state.user.tiktok ? state.user.tiktok.url :'',
        };
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showEdit = true;
      }
      const updateInfo = (info) => {
        state.user.name = info.name;
        state.user.avatar = info.avatar;
        state.user.background = info.background;
        state.user.bio = info.bio;

        state.user.website = {url:info.website};
        state.user.twitter = {url:info.twitter};
        state.user.instagram = {url:info.instagram};
        state.user.youtube = {url:info.youtube};
        state.user.tiktok = {url:info.tiktok};

        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEdit = false;

        const profile = store.state.profile;
        profile.avatar = info.avatar;
        store.commit("setProfile", profile);
      }

      //postScroll
      const profileList = ref()
      const showPostList = () => {
        changeTab('post');
        document.documentElement.scrollTop = profileList.value.getBoundingClientRect().top - 100;
      }

      //follow list
      const showFollowList = async (type) => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.followCurrentTab = type;
        state.showFollows = true;
        state.followPage = 0;
        state.isEndFollow = false;
        state.followList[state.followCurrentTab] =  await getFollowList();
      }
      const closeFollowList = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showFollows = false;
      }
      const changeFollowTab  = async (type) => {
        if(state.followCurrentTab == type || state.isLoadingFollow){
          return;
        }
        state.followCurrentTab = type;
        state.followPage = 0;
        state.isEndFollow = false;
        state.followList[state.followCurrentTab] = [];
        state.followList[state.followCurrentTab] =  await getFollowList();
      }
      const getFollowList = async () => {
        state.isLoadingFollow = true;
        let result = [];
        if(state.followCurrentTab=="followers"){
          const res = await proxy.$axios.profile.get_user_followers({
            account_id:state.accountId,
            current_account_id:store.getters.accountId || '',
            page:state.followPage,
            limit:10
          });
          if(res.success){
            state.followPage++;
            result = res.data;
          }
        }else{
          const res = await proxy.$axios.profile.get_user_following({
            account_id:state.accountId,
            current_account_id:store.getters.accountId || '',
            page:state.followPage,
            limit:10
          });
          if(res.success){
            state.followPage++;
            result = res.data;
          }
        }
        if(result.length==0){
          state.isEndFollow = true;
        }
        state.isLoadingFollow = false;
        return result;
      }
      const followDiv = ref();
      const followScroll = async () => {
        const followBox = followDiv.value;
        if(((followBox.scrollTop + window.innerHeight - 192) >= followBox.scrollHeight-200) && !state.isLoadingFollow && !state.isEndFollow){
          const res = await getFollowList();
          state.followList[state.followCurrentTab] = state.followList[state.followCurrentTab].concat(res);
        }
      }


      //community-list
      const showCommunityList  = async () => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showCommunities = true;
      }
      const closeCommunityList = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showCommunities = false;
      }

      //nft-list
      const showNftList  = async () => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        changeNftTab('collected');
        state.showNfts = true;
      }
      const closeNftList = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showNfts = false;
      }
      const changeNftTab = async (tab) => {
        if(state.nftCurrentTab == tab || state.isLoadingNft) return;
        //reset data
        state.nftCurrentTab = tab;
        state.nftPage = 0;
        state.isEndNft = false;
        state.nftList[state.nftCurrentTab] =  [];
        state.nftList[state.nftCurrentTab] =  await getNftList();
      }
      const getNftList = async () => {
        state.isLoadingNft = true;
        let result = [];
        const res = await proxy.$axios.profile.get_user_nfts({
          account_id:state.accountId,
          type:state.nftCurrentTab,
          page:state.nftPage,
          limit:9
        });
        if(res.success){
          if(state.nftPage==0){
            state.nftList[state.nftCurrentTab] = res.count;
          }
          state.nftPage++;
          result = await handleNftData(res.data);
        }

        if(result.length==0){
          state.isEndNft = true;
        }
        state.isLoadingNft = false;
        return result;
      }
      const nftDiv = ref();
      const nftScroll = async () => {
        const nftBox = nftDiv.value;
        if(((nftBox.scrollTop + window.innerHeight - 192) >= nftBox.scrollHeight-200) && !state.isLoadingNft && !state.isEndNft){
          const res = await getNftList();
          state.nftList[state.nftCurrentTab] = state.nftList[state.nftCurrentTab].concat(res);
        }
      }
      const handleNftData = async (data) => {
        const list = [];
        for(let i = 0;i<data.length;i++){
          const item = data[i];
          const res = await store.state.viewAccount.viewFunction(item.contract_id, "nft_token", {token_id: item.token_id}); 
          list.push({...res,contract_id:item.contract_id});;
        }
        return list;
      }


      //showNftLayer
      const showNftLayer = (item) => {
        state.currentNftItem = item;
        state.showNftDetail = true;
      }
      const checkNftMedia = (url) => {
        if(url && url.indexOf('http://')<0 && url.indexOf('https://')<0){
          return `${store.state.nearConfig.IPFS}/ipfs/${url}`
        }else{
          return url;
        }
      }

      //share
      const shareTwitter = () => {
        window.open('https://twitter.com/intent/tweet?text='+state.shareLink);
      }
      //share -> handleCopy
      const copy_text = ref()
      const triggerCopy = async () => {
        nextTick(() => {
          copy_text.value.click();
        });
      }
      const handleCopyFun = () => {
        copyText(state.shareLink, undefined, (error, event) => {
          if (error) {
            proxy.$Message({
              message: "error",
              type: "error",
            });
          } else {
            proxy.$Message({
              message: "copy success",
              type: "success",
            });
          }
        })
      }

      //changeListStatus 
      const changeListStatus = (item,close=false) => {
        state.list[state.currentTab].forEach(i=>{
          if(i==item){
            if(!close){
              i.isComment = true;
            }else{
              i.isComment = false;
            }
          }else{
            i.toggleState = i.toggleState ? !i.toggleState : true;
            i.isComment = false;
          }
        })
      }
      

      //checkUrl
      const checkUrl = (url) => {
        if(url.indexOf('http://')<0 && url.indexOf('https://')<0){
          return `http://${url}`
        }else{
          return url;
        }
      }

      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      return {
        ...toRefs(state),
        init,
        follow,
        addNewPost,
        changeTab,
        handleScroll,
        //follow
        showFollowList,
        closeFollowList,
        changeFollowTab,
        followDiv,
        followScroll,
        //community
        showCommunityList,
        closeCommunityList,
        //nft
        showNftList,
        closeNftList,
        changeNftTab,
        showNftLayer,
        checkNftMedia,
        nftDiv,
        nftScroll,
        //share
        shareTwitter,
        copy_text,
        triggerCopy,
        handleCopyFun,
        //edit
        showEditLayer,
        updateInfo,
        //other
        profileList,
        showPostList,
        changeListStatus,
        checkUrl,
        showLoginMask,
        closeLoginMask,
      };
    },
    mounted(){
      // if(this.$route.query.nft){
      //   this.$router.push({query: {nft:this.$route.query.nft}});
      // }else{
      //   this.$router.push({query: {}});
      // }
      this.init();
      window.addEventListener('scroll',this.handleScroll);
    },
    unmounted(){
      window.removeEventListener('scroll', this.handleScroll);
    },
  }
</script>

<style lang="scss" scoped>
  .main{
    .left{
      padding-right:20px;
      .user-info{
        background: #28282D;
        border-radius: 24px;
        position:relative;
        .bg-box{
          width:690px;
          height:240px;
          position:relative;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          overflow: hidden;
          .bg{
            width:690px;
            height:240px;
            object-fit: cover;
          }
          &::after{
            display:block;
            content:'';
            position:absolute;
            top:0;
            left:0;
            right:0;
            bottom:0;
            background:url("@/assets/images/profile/bg-mask.png") no-repeat center;
            background-size:cover;
          }
        }
        .btns{
          height:24px;
          position: absolute;
          top:20px;
          right:20px;
          display:flex;
          align-items: center;
          .btn{
            width:24px;
            height:24px;
            cursor:pointer;
            &.edit{
              background:url("@/assets/images/common/icon-edit.png") no-repeat center center;
              background-size:24px 24px;
            }
            &.share{
              margin-left:40px;
              background:url("@/assets/images/profile/icon-share.png") no-repeat right center;
              background-size:24px 24px;
            }
          }
        }
        .info{
          position: relative;
          padding:70px 20px 20px;
          .avatar{
            width: 80px;
            height: 80px;
            border-radius:50%;
            position: absolute;
            top:-40px;
            left:20px;
            object-fit: cover;
          }
          .follow-button{
            position:absolute;
            top:75px;
            right:20px;
          }
          .name{
            line-height: 22px;
            font-family: D-DINExp-Bold;
            font-size: 20px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            padding-right:20px;
          }
          .account{
            margin-top:8px;
            font-family: D-DINExp;
            font-size: 14px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            line-height:16px;
          }
          .total{
            margin-top:20px;
            display:flex; 
            .total-item{
              margin-right:30px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              cursor: pointer;
              line-height:18px;
              span{
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 700;
                margin-right:4px;
                text-decoration: underline;
              }
            }
          }
          .bio{
            margin-top:20px;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: justify;
            line-height: 24px;
            font-weight: 400;
          }
          .media-list-box{
            height:24px;
            margin-top:20px;
            display: flex;
            align-items: center;
            justify-content:space-between;
            .media-list{
              display:flex;
              .media-item{
                width:24px;
                margin-right:30px;
                img{
                  height:24px;
                }
                img.hover{
                  display:none;
                }
              }
              a.media-item{
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
            .edit{
              width:24px;
              height:24px;
              cursor:pointer;
              background:url("@/assets/images/common/icon-edit.png") no-repeat center center;
              background-size:24px 24px;
              
            }
          }
        }
      }
      .list{
        background: #28282D;
        border-radius: 24px;
        padding:0 20px;
        margin-top:20px;
      }
    }
    .right{
      .right-mod{
        background: #000000;
        border-radius: 24px;
        padding: 20px;
        margin-bottom:20px;
        .title{
          display: flex;
          align-items: center;
          justify-content:space-between;
          .more{
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 400;
            padding-right:18px;
            background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
            background-size:14px 14px;
            cursor:pointer;
          }
        }
      }
      .joined-communities{
        .communities{
          display: flex;
          flex-wrap:wrap;
          margin-bottom: 10px;
          .community{
            margin-top:30px;
            margin-right:30px;
            width:72px;
            cursor: pointer;
            &.mr0{
              margin-right:0;
            }
            a{
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .avatar{
              width:40px;
              height:40px;
              border-radius: 8px;
              object-fit: cover;
            }
            .name{
              max-width:72px;
              margin-top:12px;
              font-family: D-DINExp-Bold;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: center;
              font-weight: 700;
              line-height:16px;
            }
          }
        }
      }
      .nft-box{
        .nfts{
          display: flex;
          flex-wrap:wrap;
          .nft{
            margin-top:30px;
            margin-right:12px;
            width:84px;
            cursor: pointer;
            &.mr0{
              margin-right:0;
            }
            img{
              width:84px;
              height:84px;
              border-radius: 8px;
              object-fit: cover;
            }
          }
        }
      }
    }
  }
  .follow-layer{
    background: rgba(0,0,0,0.56);
    .follow-box{
      position:absolute;
      top:60px;
      left:50%;
      transform:translateX(-50%);
      width: 690px;
      height: calc(100vh - 120px);
      background: #28282D;
      border-radius: 24px;
      overflow:visible;
      .tab-box{
        display:flex;
        align-items: center;
        height:72px;
        padding-top:10px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        .tab{
          font-family: D-DINExp-Bold;
          font-size: 20px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: center;
          font-weight: 700;
          width:50%;
          line-height:62px;
          text-align: center;
          position: relative;
          cursor: pointer;
          &.active{
            &::after{
              display:block;
              content:"";
              position: absolute;
              left:50%;
              transform:translateX(-50%);
              bottom:0;
              width: 90px;
              height: 4px;
              background: #FED23C;
              border-radius: 2px;

            }
          }
        }
      }
      .follow-list{
        height: calc(100vh - 192px);
        overflow-y: scroll;
        padding-top:20px;
        .follow-item{
          margin-bottom:30px;
          height:60px;
          display:flex;
          align-items: center;
          padding:0 20px;
          cursor: pointer;
          position:relative;
          .avatar{
            width: 60px;
            height: 60px;
            border-radius:50%;
            object-fit: cover;
          }
          a:nth-child(2){
            flex:1;
          }
          .info{
            margin-left:15px;
            width:300px;
            .name{
              display:inline-block;
              max-width:300px;
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:17px;
            }
            .account{
              margin-top:10px;
              font-family: D-DINExp;
              font-size: 16px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              line-height:17px;
            }
          }
          .follow-button{
            position: absolute;
            top:10px;
            right:20px;
          }
        }
      }
    }
  }
  .elastic-content{
    width:688px;
    margin:0 auto;
    .title{
      font-family: D-DINExp-Bold;
      font-size: 24px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      display: flex;
      justify-content:space-between;
      .filter-menu{
        margin-top:0;
        .filter-menu-item.active{
          font-weight:700;
        }
      }
    }
    .community-list{
      display: flex;
      flex-wrap: wrap;
      margin-top:30px;
      .community-item{
        margin-bottom:20px;
        margin-right:20px;
        background: #28282D;
        border-radius: 10px;
        position:relative;
        cursor:pointer;
        a{
          width: 214px;
          height: 80px;
          padding:0 20px;
          display:flex;
          align-items: center;
        }
        &.mr0{
          margin-right:0;
        }
        .avatar{
          width: 40px;
          height: 40px;
          border-radius: 10px;
          object-fit: cover;
        }
        .name{
          width:124px;
          font-family: D-DINExp-Bold;
          font-size: 18px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          margin-left:12px;
        }
      }
    }
    .nft-list{
      display: flex;
      flex-wrap: wrap;
      margin-top:30px;
      .nft-item{
        margin-bottom:20px;
        margin-right:20px;
        width: 216px;
        height: 357px;
        background: #28282D;
        display:flex;
        flex-direction: column;
        border-radius: 24px;
        overflow: hidden;
        cursor:pointer;
        &.mr0{
          margin-right:0;
        }
        .media{
          width: 216px;
          height: 216px;
          object-fit: cover;
        }
        .nft-info{
          padding:20px;
          .name{
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            font-weight: 700;
            line-height:16px;
          }
          .sale{
            padding-top:12px;
            padding-bottom:20px;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            font-weight: 400;
            line-height:16px;
            text-decoration:line-through;
          }
          .see-details{
            font-family: D-DINExp;
            font-size: 14px;
            color: #FED23C;
            font-weight: 400;
            padding-top:20px;
            border-top:1px solid rgba(255,255,255,0.1);
          }
        }
      }
    }
  }
  .loading-box{
    width:690px;
    margin-top:20px;
    min-height:100px;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .no-more{
    width:100%;
  }
</style>
