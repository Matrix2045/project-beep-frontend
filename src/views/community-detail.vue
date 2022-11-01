<template>
  <div class="main-box">
    <div class="bg-box">
      <img v-if="detail.cover" :src="$store.getters.getAwsImg(detail.cover)" @error.once="$event.target.src=detail.cover">
      <img v-else src="@/assets/images/community/bg.png">
      <!-- <div class="bg-mask"></div> -->
    </div>
    <!-- Community info  -->
    <div class="community-info" v-if="detail.data">
        <div class="avatar-border">
          <img v-if="detail.avatar"  class="avatar" :src="$store.getters.getAwsImg(detail.avatar)" @error.once="$event.target.src=detail.avatar">
          <img v-else  class="avatar" src="@/assets/images/community/default-avatar.png">
        </div>
        <div class="name" ><span class="txt-wrap">{{detail.name}}</span><div class="edit-btn" v-if="detail.data.create_user.account_id == $store.getters.accountId" @click="showEditBasicinfoLayer"></div></div>
        <div class="creator">Created by 
          <el-popover placement="bottom-start"  trigger="hover" @show="showCreateUser=true" @hide="showCreateUser=false">
            <template #reference>
              <router-link :to="'/user-profile/'+detail.data.create_user.account_id">
                <span>@{{detail.data.create_user.name || detail.data.create_user.account_id}}</span>
              </router-link>
            </template>
            <template v-if="showCreateUser">
              <UserPopup :account="detail.data.create_user.account_id" @login="showLogin=true"/>
            </template>
          </el-popover>
        </div>
        <div class="total">
          <div class="total-item"><span>{{detail.data.members_count}}</span>Members</div>
          <div class="total-item"><span>{{detail.data.post_count}}</span>Posts</div>
        </div>
        <div class="bio txt-wrap3" v-if="detail.info">{{detail.info}}</div>
        <template v-if="$route.params.id != $store.state.nearConfig.MAIN_CONTRACT && detail.data.create_user.account_id != $store.getters.accountId">
          <div v-if="detail.data.is_join" class="button-border join-button joined">
            <div class="button" @click="changeJoinCommunity()">
              <span class="static-text">Joined</span>
              <span class="hover-text">Quit</span>
            </div>
          </div>
          <div v-else class="button-border join-button">
            <div class="button" @click="changeJoinCommunity()">
              Join
            </div>
          </div>
        </template>
    </div>
    <!-- Tab  -->
    <div class="page">
      <div :class="['page-item',currentPage == 'post' ? 'active' : '']" @click="changePage('post')">Posts</div>
      <div :class="['page-item',currentPage == 'detail' ? 'active' : '']" @click="changePage('detail')">Overview</div>
    </div>

    <div class="main-content">
      <!-- charts -->
      <div v-show="currentPage == 'detail'" class="charts" ref="charts" :style="{ width: '280px', height: '200px' }"></div>
    
      <div class="main main-post" v-if="currentPage == 'post'">
        <!-- left -->
        <div class="left">
          <Post v-if="detail.data" :community="detail" :location="'detail'" :unJoinCommunity="!detail.data.is_join" @addNewPost="addNewPost"/>
          <div class="filter-menu">
            <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
            <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">
              New
              <div class="unread-count" v-if="postCount.new">{{postCount.new}}</div>
            </div>
          </div>
          <div class="post-list">
            <template v-for="item in postList[currentTab]" :key="item.create_at">
              <template v-if="item.isNewPost">
                <PostItemNew :item="item" :from="'community'" @changeListStatus="changeListStatus(item,$event)"/>
              </template>
              <template v-else>
                <PostItem :item="item" :unJoinCommunity="!detail.data.is_join" :from="'community'" @changeListStatus="changeListStatus(item,$event)"/>
              </template>
            </template>
          </div>

          <div class="loading-box" v-if="isLoading">
            <img class="white-loading" src="@/assets/images/common/loading.png"/>
          </div>
          <div class="no-more" v-else-if="isEnd">
            <div v-if="postList[currentTab]['length'] == 0" class="no-result">
              <img src="@/assets/images/common/emoji-null.png"/>
              No posts
            </div>
            <template v-else>No more posts</template>
          </div>

        </div>
        <!-- right -->
        <div class="right">
          <!-- Members -->
          <div class="members">
            <div class="members-title">
              <div class="font20">Members</div>
              <div class="more" @click="showMemberList()">
                More
                <img class="more-arrow" src="@/assets/images/common/icon-arrow-right.png">
              </div>
            </div>
            <div class="members-list">
              <template v-for="item in members">
                <div class="members-item" v-if="item">
                  <router-link :to="'/user-profile/'+item.account_id">
                    <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                    <img v-else class="avatar" src="@/assets/images/common/user-default.png">
                    <div class="info">
                      <div :class="['name','name-'+item.data.type]">
                        <span class="name-txt txt-wrap">{{item.name || item.account_id.split(".testnet")[0]}}</span>
                        <!-- CO -->
                        <template v-if="item.data.type=='creator' || item.account_id==detail.data.create_user.account_id">
                          <el-popover
                            placement="bottom-start"
                            trigger="hover"
                            >
                            <template #reference>
                              <div class="user-flag co"></div>
                            </template>
                            <div class="pop-box pop-tip pop-user-flag">Community Originator</div>
                          </el-popover>
                        </template>
                        <!-- MOD -->
                        <template v-else-if="item.data.type=='mod'">
                          <el-popover
                            placement="bottom-start"
                            trigger="hover"
                            >
                            <template #reference>
                              <div class="user-flag mod"></div>
                            </template>
                            <div class="pop-box pop-tip pop-user-flag">Moderator</div>
                          </el-popover>
                        </template>

                      </div>
                      <div class="account txt-wrap">{{item.account_id}}</div>
                    </div>
                  </router-link>
                  <!-- follow -->
                  <div class="follow-button" v-if="item.account_id != $store.getters.accountId">
                    <FollowButton 
                      :isFollow="item.data.is_follow" 
                      :accountId="item.account_id" 
                      :background="'#000'"
                      :position="'right'"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="main mian-detail" v-if="currentPage == 'detail'">
        <!-- left -->
        <div class="left">
          <!-- Community Information-->
          <div class="title" style="justify-content:flex-start;">
            Community Information
            <div class="edit-btn" v-if="detail.data.create_user.account_id == $store.getters.accountId" @click="showEditContributorLayer"></div>
          </div>
          <div class="community-information">
            <div class="intro" v-if="detail.information">{{detail.information}}</div>       
            <div class="media">
              <!-- twitter -->
              <a v-if="media.twitter && media.twitter.url" class="media-item" :href="checkUrl(media.twitter.url)" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-twitter.png"/>
                <img class="plat-icon hover" src="@/assets/images/common/logo-twitter-hover.png"/>
                Twitter
              </a>
              <div v-else class="media-item">
                <img class="plat-icon" src="@/assets/images/common/logo-twitter-grey.png"/> 
                Twitter
              </div>

              <!-- Discord -->
              <a v-if="media.discord && media.discord.url" class="media-item" :href="checkUrl(media.discord.url)" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-discord.png"/>
                <img class="plat-icon hover" src="@/assets/images/common/logo-discord-hover.png"/>
                Discord
              </a>
              <div v-else class="media-item">
                <img class="plat-icon" src="@/assets/images/common/logo-discord-grey1.png"/> 
                Discord
              </div>

              <!-- Website -->
              <a v-if="media.website && media.website.url" class="media-item" :href="checkUrl(media.website.url)" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-link.png"/>
                <img class="plat-icon hover" src="@/assets/images/common/logo-link-hover.png"/>
                Website
              </a>
              <div v-else class="media-item">
                <img class="plat-icon" src="@/assets/images/common/logo-link-grey.png"/> 
                Website
              </div>
            </div>

            <!-- creator -->
            <div class="contributor-box" v-if="contributors.length>0">
              <div class="mini-title">Contributor</div>
              <div class="contributor">
                <template v-for="(item,index) in contributors">
                  <el-popover placement="bottom-start"  trigger="hover" @show="item.showUser=true" @hide="item.showUser=false">
                    <template #reference>
                      <router-link :to="'/user-profile/'+item.account_id">
                        <div :class="['user','contributor-item',index%4 == 3 ? 'mr0' : '']">
                          <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                          <img v-else class="avatar" src="@/assets/images/common/user-default.png">
                          <div class="user-info">
                            <div class="name txt-wrap">{{item.name || item.account_id}}</div>
                            <div class="account txt-wrap">{{item.account_id}}</div>
                          </div>
                        </div>
                      </router-link>
                    </template>
                    <template v-if="item.showUser">
                      <UserPopup :account="item.account_id" @login="showLogin=true"/>
                    </template>
                  </el-popover>
                </template>
              </div>
            </div>
            
          </div>
          <!-- Benefits -->
          <template v-if="benefits.length>0 || detail.data.create_user.account_id == $store.getters.accountId">
            <div class="title" style="justify-content:flex-start;">
              Benefits
              <div class="edit-btn" v-if="detail.data.create_user.account_id == $store.getters.accountId" @click="showEditBenefitsLayer"></div>
            </div>
            <div class="benefits">
              <template v-for="(benefit,index) in benefits">
                <div :class="['benefit-item',index%2==1 ? 'mr0' : '']">
                  <div class="mini-title txt-wrap">{{benefit.title}}</div>
                  <div class="benefit-intro">
                    {{benefit.introduction}}
                  </div>
                  <div class="benefit-bottom">
                    <div class="benefit-type">{{benefit.type}}</div>
                    <!--<div class="benefit-points">100 points</div>-->
                  </div>
                </div>
              </template>
            </div>
          </template>
          <!-- News -->
          <template v-if="news.length>0 || detail.data.create_user.account_id == $store.getters.accountId">
            <div class="title" style="justify-content:flex-start;">
              News
              <div class="edit-btn" v-if="detail.data.create_user.account_id == $store.getters.accountId" @click="showEditNewsLayer"></div>
            </div>
            <div class="news">
              <template  v-for="(item,index) in news">
                <div v-if="item.picture" class="news-item news-item-cover">
                  <img class="news-left-cover" :src="$store.getters.getAwsImg(item.picture)" @error.once="$event.target.src=item.picture"/>
                  <div class="news-right">
                    <div class="mini-title txt-wrap">{{item.title}}</div>
                    <div class="news-intro news-right-intro">{{item.introduction}}</div>
                    <!--
                    <div class="news-bottom">
                      <div class="news-from">Mirror</div>
                      <div class="news-time">Jan 4 , 2022</div>
                    </div>
                    -->
                  </div>
                </div>
                <div v-else class="news-item">
                  <div class="news-right">
                    <div class="mini-title txt-wrap">{{item.title}}</div>
                    <div class="news-intro">{{item.introduction}}</div>
                    <!--
                    <div class="news-bottom">
                      <div class="news-from">Mirror</div>
                      <div class="news-time">Jan 4 , 2022</div>
                    </div>
                    -->
                  </div>
                </div>
              </template>
            </div>
          </template>

        </div>
        <!-- right -->
        <div class="right">
          <div class="title">Community Pot Overview</div>
          <div class="pots-amount">
            <div class="pots-amount-number">{{numFormat(pot.overview.totalDrips)}}</div>
            <div class="pots-amount-ratio">
              <div class="pots-amount-ratio-item">
                <template v-if="pot.overview.growthRate24h>0">
                  <span>+{{pot.overview.growthRate24h}}</span>
                </template>
                <span v-else class="red">{{pot.overview.growthRate24h}}</span>
                24H
              </div>
              <div class="pots-amount-ratio-item past-week">
                <template v-if="pot.overview.growthRateweekly>0">
                  <span>+{{pot.overview.growthRateweekly}}</span>
                </template>
                <span v-else class="red">{{pot.overview.growthRateweekly}}</span>
                7 Days
              </div>
            </div>
            <div class="pots-amount-charts" >
             
            </div>
            <div class="pots-amount-report">
              <div class="pots-amount-report-item">
                <div class="pots-amount-report-number">{{numFormat(pot.overview.growth24h)}}</div>
                <div class="pots-amount-report-type">Drips in 24H</div>
              </div>
              <div class="pots-amount-report-item mr0">
                <div class="pots-amount-report-number">{{numFormat(pot.overview.growthweekly)}}</div>
                <div class="pots-amount-report-type">Drips in 7 Days</div>
              </div>
            </div>
          </div>
          
          <!-- Community Contract-->
          <div class="title">Community Contract</div>
          <div class="token-contract">
            <div class="token-contract-type">
              NEAR Chain(NEP-141)
              <a class="jump-contract" :href="$store.state.nearConfig.explorerUrl+'/accounts/'+$route.params.id" target="_blank"></a>
            </div>
            <div class="token-contract-address">{{$route.params.id}}</div>
          </div>


          <!-- My Drips-->
          <template v-if="$store.getters.isLogin">
            <div class="title">
              <div class="font20">My Drips</div>
              <router-link :to="`/community-dashboard/${$route.params.id}`">
                <div class="more">More</div>
              </router-link>
            </div>
            <div class="my-drips">
              <div class="my-drips-item">
                <div class="my-drips-number">{{numFormat(pot.myDrips.dripsCollected)}}</div>
                <div class="my-drips-type">Drips Claimed</div>
              </div>
              <div class="my-drips-item mr0">
                <div class="my-drips-number">{{numFormat(pot.myDrips.availableDrips)}}</div>
                <div class="my-drips-type">Available Drips</div>
              </div>
              <div class="my-drips-item">
                <div class="my-drips-number">{{numFormat(pot.myDrips.consumedDrips)}}</div>
                <div class="my-drips-type">Consumed Drips</div>
              </div>
              <div class="my-drips-item mr0">
                <div class="my-drips-number">{{numFormat(pot.myDrips.uncollectedDrips)}}</div>
                <div class="my-drips-type">Unclaimed Drips</div>
              </div>
            </div>
          </template>
          
          <!-- Pots Ranking-->
          <div class="title">
            <div class="font20">Pots Ranking</div>
          </div>
          <div class="pots-ranking">
            <div class="pots-ranking-tab">
              <div :class="['pots-ranking-tab-item', currentPointsTab == 'total_tab'?'active':'']" @click="changePointsType('total_tab')">Total</div>
              <div :class="['pots-ranking-tab-item', currentPointsTab == 'available_tab'?'active':'']" @click="changePointsType('available_tab')">Available</div>
            </div>
            <div class="loading-box" v-if="isLoadingPoints">
              <img class="white-loading" src="@/assets/images/common/loading.png"/>
            </div>
            <div class="no-result" v-else-if="pot.pointsList.length==0">
              <img src="@/assets/images/common/emoji-null.png"/>
              No more
            </div>
            <template v-else>
              <template v-for="item in pot.pointsList">
                <div class="pots-ranking-item">
                  <router-link :to="'/user-profile/'+item.account_id">
                    <div class="pots-ranking-item-left">
                      <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                      <img v-else class="avatar" src="@/assets/images/common/user-default.png">
                      <div class="name txt-wrap">{{item.name || item.account_id}}</div>
                    </div>
                  </router-link>
                  <div class="pots-ranking-item-right">
                    <div class="amount">{{numFormat(item.drips)}}</div>
                    <div class="ratio">({{(item.weight * 100).toFixed(2) * 100 / 100}}%)</div>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>

    </div>

  </div>

  <!-- left-menu -->
  <!-- <div class="left-menu" v-if="$store.getters.isLogin">
    <div class="navigation">
      <el-popover
        popper-class="community-pop"
        placement="bottom-start"
        trigger="hover"
        >
        <template #reference>
          <router-link :to="'/communities'">
            <img class="icon" src="@/assets/images/community/navigation.png"/>
          </router-link>
        </template>
        <div class="pop-box pop-tip">All Communities</div>
      </el-popover>
    </div>
    <div :class="['joined-communities',joinedList.length<=4?'joined-communities-noscroll':'']" v-if="joinedList.length>0">
      <draggable 
        v-model="joinedList" 
        group="people" 
        @start="drag=true" 
        @end="dragEnd" 
        item-key="id">
        <template #item="{element}">
          <div :class="['joined-item',element.community_id==$route.params.id ? 'active' : '']">
            <el-popover
              popper-class="community-pop"
              placement="bottom-start"
              trigger="hover"
              >
              <template #reference>
                <router-link :to="'/community-detail/'+element.community_id">
                  <img v-if="element.avatar" :src="$store.getters.getAwsImg(element.avatar)" @error.once="$event.target.src=element.avatar">
                  <img v-else src="@/assets/images/community/default-avatar.png" >
                </router-link>
              </template>
              <div class="pop-box pop-tip" v-if="!drag">{{element.name}}</div>
            </el-popover>
          </div>
        </template>
      </draggable>
    </div>
  </div> -->

  <!-- members layer -->
  <div class="elastic-layer" v-if="showMembers" @click.self="closeMemberList()">
    <div class="edit-button close" @click="closeMemberList()"></div>
    <div class="layer-content">
      <div ref="memberLayer" class="all-members" @scroll="membersScroll()">
        <div class="title">Members({{memberCount}})</div>
        <div id="all-members-list" class="all-members-list" >
          <template v-for="item in memberList">
            <UserItem :item="item" :from="'memberList'"/>
          </template>
        </div>
        <div class="no-more" v-if="isEndMember">
          <template v-if="memberCount==0">No members</template>
          <template v-else>No more members</template>
        </div>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>


  <!-- CommunityEditBasicinfo -->
  <template v-if="showEditBasicinfo">
    <CommunityEditBasicinfo :communityId="$route.params.id" :editInfo="editBasicinfo" @updateInfo="updateBasicinfo" @closeEditLayer="showEditBasicinfo=false"/>
  </template>
  <template v-if="showEditContributor">
    <CommunityEditContributor :communityId="$route.params.id" :editInfo="editContributor" @updateInfo="updateContributor" @closeEditLayer="showEditContributor=false"/>
  </template>
  <template v-if="showEditBenefits">
    <CommunityEditBenefits :communityId="$route.params.id" :editInfo="benefits" @updateInfo="updateBenefits" @closeEditLayer="showEditBenefits=false"/>
  </template>
  <template v-if="showEditNews">
    <CommunityEditNews :communityId="$route.params.id" :editInfo="news" @updateInfo="updateNews" @closeEditLayer="showEditNews=false"/>
  </template>


</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRoute,useRouter } from "vue-router";
  import { useStore } from 'vuex';
  import CommunityContract from "@/contract/CommunityContract";
  import { numFormat} from "@/utils/util.js";
  import Post from '@/component/post.vue';
  import PostItem from '@/component/post-item.vue';
  import PostItemNew from '@/component/post-item-new.vue';
  import About from '@/component/about.vue';
  import UserItem from '@/component/user-item.vue';
  import LoginMask from "@/component/login-mask.vue";
  import FollowButton from "@/component/follow-button.vue";
  import UserPopup from '@/component/user-popup.vue';
  import CommunityEditBasicinfo from "@/component/community-edit-basicinfo.vue";
  import CommunityEditContributor from "@/component/community-edit-contributor.vue";
  import CommunityEditBenefits from "@/component/community-edit-benefits.vue";
  import CommunityEditNews from "@/component/community-edit-news.vue";
  import draggable from 'vuedraggable';
  import axios from 'axios';
  import * as echarts from 'echarts'
  export default {
    components: {
      Post,
      PostItem,
      PostItemNew,
      About,
      UserItem,
      LoginMask,
      FollowButton,
      UserPopup,
      CommunityEditBasicinfo,
      CommunityEditContributor,
      CommunityEditBenefits,
      CommunityEditNews,
      draggable,
    },
    setup(){
      const store = useStore();
      const route = useRoute();
      const router = useRouter();
      const { proxy } = getCurrentInstance();

      //state
      const state = reactive({
        detail:{},
        //joinedList
        showJoinFailReason:false,
        joinedList:[],
        //postList
        currentTab:"",
        postList:{
          hot:[],
          new:[],
        },
        postCount:{
          hot:0,
          new:0,
        },
        page:0,
        limit:10,
        isEnd:false,
        isLoading:false,
        //members
        memberCount:0,
        members:[],
        memberList:[],
        showMembers:false,
        pageMember:0,
        limitMember:10,
        isEndMember:false,
        isLoadingMember:false,
        //other
        currentPage:"post",
        showLogin:false,
        drag: false,
        showCreateUser:false,
        showCreateUser2:false,
        //
        media:{
          // website:state.detail.website || {url:'',verified:false},
          // twitter:state.detail.twitter || {url:'',verified:false},
          // discord:state.detail.discord || {url:'',verified:false},
        },
        contributors:[],
        benefits:[],
        news:[],
        //edit
        showEditBasicinfo:false,
        editBasicinfo:{},
        showEditContributor:false,
        editContributor:{},
        showEditBenefits:false,
        showEditNews:false,
        //pot
        pot:{
          chartsData:[],
          overview:{
            totalDrips:0,
            growthRate24h:0,
            growthRateweekly:0,
            growth24h:0,
            growthweekly:0,
          },

          myDrips:{
            dripsCollected : 0,
            dripsRank : 0,
            availableDrips :  0,
            uncollectedDrips : 0,
          },
          pointsList:[]
        },
        currentPointsTab:'',
        isLoadingPoints:false
      })

      const init = async () => {
        const res = await proxy.$axios.community.get_community_detail({
          account_id:store.getters.accountId || "",
          community_id:route.params.id,
        });
        if(res.success) {
          state.detail = res.data;
          state.contributors = state.detail.contributor ||  [];
          state.media = {
            website:state.detail.website || {url:'',verified:false},
            twitter:state.detail.twitter || {url:'',verified:false},
            discord:state.detail.discord || {url:'',verified:false},
          }
        }


        if(localStorage.getItem('community_openEdit_'+store.getters.accountId)){
          localStorage.removeItem('community_openEdit_'+store.getters.accountId)
          state.currentPage='detail';
          verifyCallback();
        }

        //posts
        changeTab('hot');
        //joinedCommunity
        // if(store.getters.isLogin){
        //   const res = await proxy.$axios.community.get_joined_community_list({
        //     account_id:store.getters.accountId,
        //     page:0,
        //     limit:10000
        //   });
        //   if(res.success) {
        //     state.joinedList = res.data;
        //   }
        // }
        //Members
        state.members = (await getMembers()).slice(0,3);
        //postCommunity
        initUnreadCount();
        //initBenefitAndNews
        initBenefits();
        initNews();
        initDrips();
      };

      const verifyCallback = () => {
        // console.log(localStorage.getItem('verify_twitter_'+store.getters.accountId),'---');
        const info = JSON.parse(localStorage.getItem('verify_twitter_'+store.getters.accountId));
        const editInfo = info ? info.editInfo : {};
        state.editContributor = {
          information : editInfo.information || state.detail.information || '',
          contributor : editInfo.contributor || state.contributors || [],
          media : editInfo.media || state.media,
        };
        state.showEditContributor = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
        localStorage.removeItem('verify_twitter_'+store.getters.accountId);
      }

      const changePage = (page) => {
        if(state.currentPage == page){return;}
        state.currentPage = page;
        if(page == 'detail'){
          changePointsType('total_tab');
          initDrips();
          // nextTick(() => {
          //   drawChart();
          // })
        }
      }


      const initBenefits = async () => {
        const res = await proxy.$axios.community.get_benefit_list({
          community_id:route.params.id,
          account_id:store.getters.accountId || '',
        });
        if(res.success) {
          state.benefits = res.data;
        }
      }
      const initNews = async () => {
        const res = await proxy.$axios.community.get_news_list({
          community_id:route.params.id,
          account_id:store.getters.accountId || '',
        });
        if(res.success) {
          state.news = res.data;
        }
      }
      const initDrips = async () => {
        const res_chart = await proxy.$axios.drip.get_community_points_chart({
          account_id:store.getters.accountId || "",
          community_id:route.params.id,
        });
        if(res_chart.success && res_chart.data){
          const data = res_chart.data;
          state.pot.overview = {
            totalDrips:data.total_drips || 0,
            growthRate24h: (data.t_48h_drips - data.t_24h_drips) == 0 ? 0 : ((data.t_24h_drips / (data.t_48h_drips - data.t_24h_drips)) - 1).toFixed(2) * 100 /100,
            growthRateweekly: (data.t_14d_drips - data.t_7d_drips) == 0 ? 0 : ((data.t_7d_drips / (data.t_14d_drips - data.t_7d_drips)) - 1).toFixed(2) * 100 /100,
            growth24h:data.t_24h_drips ||  0,
            growthweekly:data.t_7d_drips || 0,
          }
          state.pot.chartsData = data.chart;
        }
        drawChart();
        
        if(store.getters.isLogin){
          const res = await proxy.$axios.drip.get_user_community_points_detail({
            account_id:store.getters.accountId || "",
            community_id:route.params.id,
          });
          if(res.success && res.data){
            state.pot.myDrips={
              dripsCollected : res.data.total_drips || 0,
              dripsRank : res.data.rank || 0,
              availableDrips : res.data.available_drips || 0,
              uncollectedDrips : res.data.claim_drips || 0,
            }
          }
        }
      }

      //unread post count
      const initUnreadCount = async () => {
        let lastPostId = '';
        let commLastPostId = localStorage.getItem("commLastPostId") || '{}';
        commLastPostId = JSON.parse(commLastPostId);
        
        if(commLastPostId[route.params.id]){
          lastPostId = commLastPostId[route.params.id];
        }else if(localStorage.getItem("lastPostId")){
          lastPostId = localStorage.getItem("lastPostId")
        }
        const resNew = await proxy.$axios.post.get_post_list({
          type: 'new',
          page:0,
          limit:10,
          community_id:route.params.id,
          last_post_id:lastPostId,
        });
        if(lastPostId){
          state.postCount['new'] = resNew.unread_count;
        }
        if(resNew.data && resNew.data.length>0){
          commLastPostId[route.params.id] = resNew['data'][0]['target_hash'];
          localStorage.setItem("commLastPostId",JSON.stringify(commLastPostId));
        }
      }

      //changeJoinCommunity
      const changeJoinCommunity = async () => {
        if(!store.getters.isLogin){
          state.showLogin = true
        }else{
          const communityContract = await CommunityContract.new(route.params.id);
          const result = state.detail.data.is_join ? await communityContract.quit({}) : await communityContract.join({});
          if (result.status == 'pending' || result.status == 'success') {
            state.detail.data.is_join = !state.detail.data.is_join;
            //reloadList
            state.postList[state.currentTab] = [];
            state.page = 0;
            state.isEnd = false;
            // state.postCount[state.currentTab] = 0;
            const res = await getPosts();
            state.postList[state.currentTab] = res.data;
          } else if (result.status == 'fail')  {
            const message = state.detail.data.is_join ? 'Quit Failed' : 'Join Failed';
            proxy.$Message({
              message,
              type: "error",
            });
          }
        }
      }


      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      //changeTab
      const changeTab = async (tab) => {
        if(state.currentTab == tab) return;
        //reset data
        state.currentTab = tab;
        state.postList[state.currentTab] = [];
        state.page = 0;
        state.isEnd = false;
        state.postCount[state.currentTab] = 0;
        //request
        const res = await getPosts();
        state.postList[state.currentTab] = res.data;
      }

      //getPosts
      let CancelToken = axios.CancelToken;
      const getPosts = async () => {
        if(state.cancel){
          state.cancel();
        }
        const cancelToken = new CancelToken((c) => {
          state.cancel = c;
        })

        state.isLoading = true;
        const res = await proxy.$axios.post.get_post_list({
          type: state.currentTab,
          page: state.page,
          limit:state.limit,
          community_id:route.params.id,
          account_id:store.getters.isLogin ? store.getters.accountId : "",
        },cancelToken);
        state.isLoading = false;
        if(res.success){
          if(state.page==0 && state.currentTab=='new' && res.data.length>0){
            let commLastPostId = localStorage.getItem("commLastPostId") || '{}';
            commLastPostId = JSON.parse(commLastPostId);
            commLastPostId[route.params.id] = res['data'][0]['target_hash'];
            localStorage.setItem("commLastPostId",JSON.stringify(commLastPostId));
          }
          if(res.data.length==0){
            state.isEnd = true;
          }
          state.page += 1;
          return res;
        }
        return {
          data:[],
          count:0
        };
      }

      //handleScroll
      const handleScroll = async () => {
        if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.currentTab){
          const res = await getPosts();
          let result = [];
          if(state.page>1 && state.currentTab=='new' && res.data.length>0){  //deduplication
            const checkList = state.postList['new'].slice(-Math.min(res.data.length,state.postList['new'].length));
            const checkListIds = []
            checkList.forEach(checkItem=>{
              checkListIds.push(checkItem.target_hash);
            })
            res.data.forEach(item=>{
              if(checkListIds.indexOf(item.target_hash) == -1){
                result.push(item);
              }
            })
          }else{
            result = res.data;
          }
          state.postList[state.currentTab] = state.postList[state.currentTab].concat(result);
        }
      }

      //getMembers
      const getMembers = async (isList) => {
        state.isLoadingMember = true;
        const res = await proxy.$axios.community.get_member_list({
          community_id: route.params.id,
          page:state.pageMember,
          limit:state.limitMember,
          account_id:store.getters.isLogin ? store.getters.accountId : ""
        });
        state.isLoadingMember = false;
        if(res.success){
          if(state.pageMember==0){
            state.memberCount = res.count;
          }
          if(isList){
            if(res.data.length==0){
              state.isEndMember = true;
            }
            state.pageMember += 1;
          }
          return res.data;
        }
        return [];
      }

      const showMemberList = async () => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showMembers = true;
        state.memberList = [];
        state.pageMember = 0;
        state.isLoadingMember = false;
        state.memberList = await getMembers(true);
      }

      const closeMemberList = async () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.members = [];
        state.showMembers = false;
        const res = await proxy.$axios.community.get_member_list({
          community_id: route.params.id,
          page:0,
          limit:3,
          account_id:store.getters.isLogin ? store.getters.accountId : ""
        });
        state.members = res.data;
      }

      //membersScroll
      const memberLayer = ref();
      const membersScroll = async () => {
        const memberBox = memberLayer.value;
        if(((memberBox.scrollTop + window.innerHeight) >= memberBox.scrollHeight-200) && !state.isLoadingMember && !state.isEndMember){
          const res = await getMembers(true);
          state.memberList = state.memberList.concat(res);
        }
      }

      //edit Basicinfo
      const showEditBasicinfoLayer = () => {
        state.editBasicinfo = {
          name:state.detail.name,
          info:state.detail.info,
          avatar:state.detail.avatar,
          cover:state.detail.cover
        }
        state.showEditBasicinfo = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateBasicinfo = (info) => {
        state.detail.name = info.name;
        state.detail.info = info.info;
        state.detail.avatar = info.avatar;
        state.detail.cover = info.cover;
        
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditBasicinfo = false;
      }


      //edit Contributor
      const showEditContributorLayer = () => {
        state.editContributor = {
          information:state.detail.information,
          contributor:state.contributors || [],
          media:state.media
        }
        state.showEditContributor = true;

        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateContributor = (info) => {
        state.detail.information = info.information;
        state.contributors = [...info.contributor];
        state.media = {...info.media}

        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditContributor = false;
      }

      //edit Benefits
      const showEditBenefitsLayer = () => {
        state.showEditBenefits = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateBenefits = (info) => {
        state.benefits = info;
        state.showEditBenefits = false;
        document.getElementsByTagName('body')[0].classList.remove("fixed");
      }

      //edit News
      const showEditNewsLayer = () => {
        state.showEditNews = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateNews = (info) => {
        state.news = info;
        
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditNews = false;
      }

      //drag
      const dragEnd = async (event) => {
        state.drag = false;

        const res = await proxy.$axios.community.replacement_sequence({
          community_id: state.joinedList[event.newIndex]['community_id'],
          up_community_id: state.joinedList[event.newIndex-1] ? state.joinedList[event.newIndex-1]['community_id'] : '',
          down_community_id: state.joinedList[event.newIndex+1] ? state.joinedList[event.newIndex+1]['community_id'] : '',
          account_id:store.getters.accountId,
        });

      }

      //changeListStatus 
      const changeListStatus = (item,close=false) => {
        state.postList[state.currentTab].forEach(i=>{
          if(i==item && !close){
            i.isComment = true;
          }else{
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


      //addNewPost
      const addNewPost = async (item) => {
        await changeTab('new');
        state.postList['new'].unshift(item);
      }

      //Pots
      const charts = ref()
      const drawChart = () => {
        const values_x = []
        const values_y = []
        // const now = new Date();
        const h = state.pot.chartsData[0].startTime.split(" ")[1].split(":")[0];
        // let m = now.getMinutes();
        // m = m < 10 ? '0'+m : m;
        state.pot.chartsData.forEach((item,index)=>{
          let hour = Number(h) + 1 - index * 2;
          hour = hour < 0 ? hour + 24 : hour;
          hour = hour < 10 ? '0'+hour : hour;
          values_x.unshift(hour+':00');
          values_y.unshift(item.points/10000);
        })

        const option = {
          grid: {
            x: "33px",
            y: "20px", 
            width: "247px", 
            height: "160px"
          },
          xAxis: {
            type: 'category',
            // boundaryGap: false,
            data: values_x, 
            axisTick:{
              alignWithLabel:true,
              interval:0,
            },
            axisLabel:{
              // align:'center',
              width:10,
              interval:1,
            },
            alignTicks:true
            // offset:10,
            // margin:19,
            // nameTextStyle:{
            //   color:"rgba(255,255,255,0.5)",
            //   fontWeight:'bold',
            // },

          },
          yAxis: {
            type: 'value',
            // alignTicks:true,
            min:Math.ceil(Math.min(...values_y)), 
            // max:Math.max(...values_y), 
            // splitNumber:5,
            splitLine:{
              lineStyle:{
                color:'#292929',
                opacity:1,
              }
            },
            // axisLabel:{
            //   lineStyle:{
            //     color:'#FFFFFF',
            //     opacity:0.5,
            //     textAlign: 'left'
            //   },
            // },
          },
          series: [
            {
              symbol: "none",
              data: values_y,
              type: 'line',
              smooth: true,
              itemStyle : {
								normal : {
									lineStyle:{
										color:'#FED23C'
									}
								}
							},
            }
          ]
        };
        const Chart = echarts.init(charts.value);
        Chart.setOption(option)
      }

      let CancelToken2 = axios.CancelToken;
      const changePointsType = async (type) => {
        if(state.currentPointsTab == type){return}
        state.isLoadingPoints = true;
        state.currentPointsTab = type;
        if(state.cancel2){
          state.cancel2();
        }
        const cancelToken = new CancelToken2((c) => {
          state.cancel2 = c;
        })
        const res = await proxy.$axios.drip.get_community_member_points({
          community_id:route.params.id,
          type:state.currentPointsTab
        },cancelToken);
        if(res.success) {
          state.pot.pointsList = res.data;
        }
        state.isLoadingPoints = false;
      }


      return {
        numFormat,
        ...toRefs(state),
        init,
        changePage,
        changeJoinCommunity,
        showLoginMask,
        closeLoginMask,
        changeTab,
        handleScroll,
        showMemberList,
        closeMemberList,
        memberLayer,
        membersScroll,
        showEditBasicinfoLayer,
        updateBasicinfo,
        showEditContributorLayer,
        updateContributor,
        showEditBenefitsLayer,
        updateBenefits,
        showEditNewsLayer,
        updateNews,
        dragEnd,
        checkUrl,
        changeListStatus,
        addNewPost,
        charts,
        drawChart,
        changePointsType
      }
    },
    mounted(){
      // this.$router.push({query: {}})
      this.init();
      window.addEventListener('scroll',this.handleScroll);
    },
    unmounted(){
      window.removeEventListener('scroll', this.handleScroll);
    },
  }
</script>

<style lang="scss" scoped>
  .main-box{
    padding-top:196px;
    position:static;
    .bg-box{
      position: absolute;
      top:80px;
      left:0;
      width:100vw;
      height:200px;
      img{
        width:100vw;
        height:100%;
        object-fit: cover;
      }
    }
    .community-info{
      display:flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .avatar-border{
        width: 128px;
        height: 128px;
        background:#28282D;
        border-radius: 20px;
        display:flex;
        align-items: center;
        justify-content:center;
        position: relative;
        z-index: 2;
        .avatar{
          width:120px;
          height:120px;
          border-radius: 16px;
          object-fit: cover;
        }
      }
      .name{
        margin-top:16px;
        font-family: D-DINExp-Bold;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        display:flex;
        align-items: center;
        line-height:22px;
        height:22px;
        span{
          max-width: 300px;
        }
      }
      .creator{
        margin-top:8px;
        font-family: D-DINExp;
        font-size: 14px;
        color: rgba(255,255,255,0.5);
        letter-spacing: 0;
        font-weight: 400;
        line-height:16px;
        span{
          color: #FFFFFF;
          cursor: pointer;
        }
      }
      .total{
        margin-top:30px;
        display:flex; 
        .total-item{
          margin-right:30px;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          line-height:18px;
          span{
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            margin-right:4px;
          }
          &:last-child{
            margin-right:0;
          }
        }
      }
      .bio{
        max-width:690px;
        margin-top:30px;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: center;
        line-height: 24px;
        font-weight: 400;
      }
      .join-button{
        margin-top:30px;
        .button{
          background-color: #17171A;
        }
        &.joined{
          background: rgba(255,255,255,0.2);
          &::after{
            display: none;
          }
          .hover-text{
            display: none;
          }
          &:hover{
            background: rgba(255,104,104,0.2);
            .button{
              color: #FF6868;
            }
            .static-text{
              display: none;
            }
            .hover-text{
              display: block;
            }
          }
        }
      }
    }
    .page{
      margin-top:60px;
      display:flex;
      justify-content: center;
      .page-item{
        width: 200px;
        padding-bottom:14px;
        text-align: center;
        font-family: D-DINExp-Bold;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: center;
        font-weight: 700;
        position:relative;
        cursor: pointer;
        &::after{
          position:absolute;
          bottom:0;
          left:0;
          display:block;
          content:"";
          width: 100%;
          height: 2px;
          background: #28282D;
          border-radius: 2px;
        }
        &.active{
          &::after{
            background: #FED23C;
            border-radius: 2px;
          }
        }
      }
    }
    .main-content{
      position:relative;
      .charts{
        position:absolute;
        top:160px;
        right:20px;
      }
    }
    .main {
      margin-top:30px;
      .left{
        padding-right:20px;
      }
    }
  }

  .main-post{
    .left{
      .post-list{
        background: #28282D;
        border-radius: 24px;
        padding:0 20px;
        margin-top:20px;
      }
      .loading-box{
        width:690px;
        margin-top:20px;
        min-height:100px;
        display:flex;
        align-items:center;
        justify-content:center;
      }
    }
    .right{
      .members{
        width: 320px;
        height: auto;
        background: #000000;
        border-radius: 20px;
        margin-bottom:20px;
        padding:20px 20px 30px;
        .members-title{
          display:flex;
          justify-content:space-between;
          align-items: end;
          .more{
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: right;
            font-weight: 400;
            cursor: pointer;
            display:flex;
            align-items:center;
            .more-arrow{
              width:14px;
              height:14px;
            }
          }
        }
        .members-list{
          .members-item{
            margin-top:30px;
            position:relative;
            a{
              display:flex;
              align-items: center;
              cursor:pointer;
            }
            .avatar{
              width: 40px;
              height: 40px;
              border-radius:50%;
              object-fit: cover;
            }
            .info{
              margin-left:12px;
              .name{
                height:20px;
                display: flex;
                align-items: center;
                &.name-creator{
                  .name-txt{
                    max-width:76px;
                  }
                }
                &.name-mod{
                  .name-txt{
                    max-width:68px;
                  }
                }
                .name-txt{
                  display:inline-block;
                  max-width:100px;
                  line-height: 20px;
                  font-family: D-DINExp-Bold;
                  font-size: 18px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 700;
                }
              }
              .account{
                width:100px;
                line-height: 16px;
                opacity: 0.5;
                font-family: D-DINExp;
                font-size: 14px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 400;
              }
            }
            .follow-button{
              position:absolute;
              top:0;
              right:0;
            }
          }
        }
      }
    }
  }

  .mian-detail{
    .title{
      display: flex;
      align-items: center;
      justify-content:space-between;
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      height:22px;
      line-height:22px;
      margin-bottom:20px;
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
    .mini-title{
      font-family: D-DINExp-Bold;
      font-size: 18px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      line-height:20px;
    }
    .left{
      .community-information{
        width:690px;
        background: #28282D;
        border-radius: 24px;
        padding:20px;
        margin-bottom:60px;
        .media:first-child{
          margin-top:10px;
        }
        .media:first-child:last-child{
          margin-top:0px;
          height:36px;
        }
          
        .intro{
          font-family: D-DINExp;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: justify;
          line-height: 26px;
          font-weight: 400;
        }
        .media{
          margin-top:20px;
          display:flex;
          align-items: center;
          .media-item{
            display:flex;
            height:20px;
            align-items: center;
            margin-right:40px;
            font-family: D-DINExp;
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 0;
            text-align: justify;
            font-weight: 400;
            img{
              margin-right:11px;
              height:16px;
            }
            img.hover{
              display:none;
            }
            /*
            &.website{
              background:url('@/assets/images/common/logo-link-hover.png') no-repeat left center;
              background-size:auto 16px;
              &:hover{
                background:url('@/assets/images/common/logo-link.png') no-repeat left center;
                background-size:auto 16px;
              }
            }
            &.twitter{
              background:url('@/assets/images/common/logo-twitter-hover.png') no-repeat left center;
              background-size:auto 16px;
              &:hover{
                background:url('@/assets/images/common/logo-twitter.png') no-repeat left center;
                background-size:auto 16px;
              }
            }
            &.discord{
              background:url('@/assets/images/common/logo-discord-hover.png') no-repeat left center;
              background-size:auto 16px;
              &:hover{
                background:url('@/assets/images/common/logo-discord.png') no-repeat left center;
                background-size:auto 16px;
              }
            }
            */
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
        .user{
          display:flex;
          align-items: center;
          cursor: pointer;
          margin-bottom:27px;
          .avatar{
            width:40px;
            height:40px;
            border-radius:50%;
            object-fit: cover;
          }
          .user-info{
            margin-left:12px;
            .name{
              font-family: D-DINExp-Bold;
              font-size: 18px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .account{
              margin-top:4px;
              opacity: 0.5;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              line-height:16px;
            }
          }
        }
        .creator-box{
          border-top:1px solid rgba(255,255,255,0.1);
          padding:30px 0 0;
          margin-bottom:10px;
          .user{
            margin-top:20px;
          }
        }
        .contributor-box{
          border-top:1px solid rgba(255,255,255,0.1);
          padding-top:30px;
          margin-top:30px;
          margin-bottom:10px;
          .contributor{
            display:flex;
            flex-wrap:wrap;
            .contributor-item{
              margin-right:40px;
              margin-top:20px;
              margin-bottom:0;
              &.mr0{
                margin-right:0;
              }
              .user-info{
                width:80px;
              }
            }
          }
        }
      }
      .benefits{
        display:flex;
        flex-wrap:wrap;
        margin-bottom:40px;
        .benefit-item{
          width:335px;
          height:161px;
          padding:20px;
          background: #28282D;
          border-radius: 24px;
          margin-bottom:20px;
          margin-right:20px;
          &.mr0{
            margin-right:0;
          }
          .benefit-intro{
            height:48px;
            margin-top:10px;
            opacity: 0.7;
            font-family: D-DINExp;
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 24px;
            font-weight: 400;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-wrap:break-word;
          }
          .benefit-bottom{
            margin-top:20px;
            height:24px;
            display:flex;
            align-items: center;
            .benefit-type{
              padding:0 10px;
              height:24px;
              background: #36363C;
              border-radius: 12px;    
              display:flex;
              align-items: center;
              justify-content:center;
              font-family: D-DINExp;
              font-size: 12px;
              line-height:24px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: center;
              font-weight: 400;
            }
            .benefit-points{
              margin-left:30px;
              padding-left:20px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              background:url('@/assets/images/common/icon-coin.png') no-repeat left center;
              background-size:auto 16px;
            }
          }
        }
      }
      .news{
        .news-item{
          margin-top:20px;
          width:690px;
          padding:20px;
          background: #28282D;
          border-radius: 24px;
          display:flex;
          &.news-item-cover{
            .news-right{
              width:350px;
            }
          }
          .news-left-cover{
            width:180px;
            height:180px;
            border-radius: 10px;
            margin-right:20px;
            object-fit: cover;
          }
          .news-right{
            width:650px;
            flex:1;
            .mini-title{
              width:100%;
            }
            .news-intro{
              margin-top:10px;
              opacity: 0.7;
              font-family: D-DINExp;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              line-height: 24px;
              font-weight: 400;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 5;
              -webkit-box-orient: vertical;
              word-wrap:break-word;
              &.news-right-intro{
                height:114px;
              }
            }
            .news-bottom{
              margin-top:20px;
              display:flex;
              align-items: center;
              height:16px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              .news-time{
                margin-left:30px;
              }
            }
          }
          
        }
      }
    }
    .right{
      .pots-amount{
        margin-bottom:40px;
        width:320px;
        padding:20px;
        background: #000000;
        border-radius: 20px;
        .pots-amount-number{
          font-family: D-DINExp-Bold;
          font-size: 28px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          line-height:30px;
        }
        .pots-amount-ratio{
          margin-top:20px;
          height:18px;
          display:flex;
          align-items: center;
          .pots-amount-ratio-item{
            display:flex;
            align-items: center;
            height:18px;
            line-height:18px;
            font-family: D-DINExp;
            font-size: 14px;
            color:rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            &.past-week{
              margin-left:30px;
            }
            span{
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #7FD576;
              font-weight: 700;
              line-height:18px;
              margin-right:4px;
              &.red{
                color: #FF6868;
              }
            }
          }
          
        }
        .pots-amount-charts{
          margin: 20px 0 10px;
          width:280px;
          height:200px;
        }
        .pots-amount-report{
          display:flex;
          flex-wrap: wrap;
          .pots-amount-report-item{
            margin-top:30px;
            &:first-child{
              width:120px;
              margin-right:20px;
            }
            &:last-child{
              width:140px;
            }
            .pots-amount-report-number{
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:18px;
            }
            .pots-amount-report-type{
              margin-top:4px;
              opacity: 0.5;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              line-height:16px;
            }
          }
        }
      }
      .my-drips{
        margin-bottom:40px;
        background: #000000;
        border-radius: 24px;
        padding:20px 20px 0;
        display:flex;
        flex-wrap: wrap;
        .my-drips-item{
          margin-right:20px;
          padding-bottom:20px;
          width:130px;
          &.mr0{
            margin-right:0;
          }
          .my-drips-number{
            font-family: D-DINExp-Bold;
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            line-height:18px;
          }
          .my-drips-type{
            margin-top:4px;
            opacity: 0.5;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 400;
            line-height:16px;
          }
        }
      }
      .pots-ranking{
        margin-bottom:40px;
        width:320px;
        padding:20px 0;
        background: #000000;
        border-radius: 20px;
        .pots-ranking-tab{
          display:flex;
          justify-content:center;
          height:24px;
          padding-bottom:8px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          .pots-ranking-tab-item{
            margin-right:30px;
            font-family: D-DINExp;
            font-size: 16px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            height:18px;
            line-height:18px;
            position:relative;
            cursor: pointer;
            &.active{
              font-family: D-DINExp-Bold;
              color: #FFFFFF;
              font-weight: 700;
              &::after{
                position: absolute;
                bottom:-6px;
                left:50%;
                transform: translateX(-50%);
                display:block;
                content:'';
                width:16px;
                height:2px;
                background: #FED23C;
                border-radius: 2px;
              }
            }
            &:last-child{
              margin-right:0;
            }
          }
        }
        .pots-ranking-item{
          padding:0 20px;
          margin-top:24px;
          display:flex;
          align-items: center;
          justify-content:space-between;
          .pots-ranking-item-left{
            display:flex;
            align-items: center;
            .avatar{
              width:30px;
              height:30px;
              border-radius:50%;
              object-fit: cover;
            }
            .name{
              margin-left:12px;
              width:100px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
            }
          }
          .pots-ranking-item-right{
            display:flex;
            align-items: center;
            .amount{
              margin-right:10px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
            }
            .ratio{
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
            }
          }
        }
        .loading-box{
          margin-top:20px;
          height:50px;
          display:flex;
          align-items: center;
          justify-content:center;
        }
        .no-result{
          padding:60px 0 40px;
          background: transparent;
          justify-content:center;
        }
      }
      .token-contract{
        margin-bottom:40px;
        width:320px;
        padding:20px;
        background: #000000;
        border-radius: 20px;
        .token-contract-type{
          display:flex;
          align-items: center;
          font-family: D-DINExp;
          font-size: 14px;
          letter-spacing: 0;
          font-weight: 400;
          line-height:16px;
          color: rgba(255,255,255,0.7);
          .jump-contract{
            display:block;
            width:20px;
            height:20px;
            background: url(/src/assets/images/post-item/icon-jump.png) no-repeat center;
            background-size: 12px 12px;
            cursor: pointer;
          }
        }
        .token-contract-address{
          font-family: D-DINExp-Bold;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          line-height:20px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          margin-top:16px;
          padding:14px 16px;
          word-break: break-all;
        }
      }
    }
  }

  .left-menu{
    position:fixed;
    top:50%;
    left:30px;
    transform: translateY(-50%);
    z-index:99;
    width: 110px;
    background: #28282D;
    border-radius: 24px;
    padding:30px 4px;
    text-align:center;
    .navigation{
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.1);
      display:flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      margin:0 auto;
      cursor:pointer;
      .icon{
        width:24px;
        transform:rotate(-90deg);
      }
    }
    .joined-communities{
      margin-top:30px;
      max-height:290px;
      overflow-y:auto;
      .joined-item{
        position:relative;
        left:3px;
        width: 50px;
        height: 50px;
        border-radius:8px;
        margin:0 auto 30px;
        cursor:pointer;
        position: relative;
        overflow:visible;
        &:last-child{
          margin-bottom:0;
        }
        &.active{
          &::before{
            position:absolute;
            left:-26px;
            top:5px;
            display:block;
            content:"";
            width:4px;
            height:40px;
            background:url("@/assets/images/community/selected.png") no-repeat;
            background-size: 4px 40px;
          }
        }
        img{
          width: 50px;
          height: 50px;
          border-radius:8px;
          object-fit: cover;
        }
      }
      &.joined-communities-noscroll{
        .joined-item{
          left:0;
        }
      }
    }
  }

  .all-members{
    width:706px;
    margin:0 auto;
    .title{
      line-height:26px;
      font-family: D-DINExp-Bold;
      font-size: 24px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
    }
    .all-members-list{
      background: #28282D;
      border-radius: 24px;
      padding:0 20px;
      margin-top:20px;
    }
  }

  .edit-btn{
    width:16px;
    height:16px;
    cursor:pointer;
    background:url("@/assets/images/common/icon-edit.png") no-repeat center center;
    background-size:16px 16px;
    margin-left:12px;
  }

</style>

<style lang="scss">

</style>
