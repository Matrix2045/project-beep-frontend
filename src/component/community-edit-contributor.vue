<template>
  <div class="elastic-layer edit-layer">
    <div class="edit-button close" @click="closeEditLayer()"></div>
    <div class="edit-box">
      <div class="edit-head">
        <div class="edit-btn"><span class="arrow form-close" @click="closeEditLayer()"></span>Edit community</div>
        <div class="mini-button-border">
          <div class="mini-button" @click="save()">
            <img v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>Save</template>
          </div>
        </div>
      </div>
      <div class="edit-form">
        <div class="mian-form">
          <!-- Information -->
          <div class="form-item">
            <div class="form-item-label"> Community Information</div>
            <div class="form-item-content">
              <el-input  placeholder="" type="textarea" autosize  v-model="edit.information" maxlength="500" show-word-limit/>
            </div>
          </div>

          <!-- Social Link -->
          <div class="form-item form-item-media">
            <div class="form-item-label"> Social Link</div>
            <div class="form-item-content">
              <div :class="['verify-box',edit.media.twitter.url?'':'empty']">
                <el-input class="twitter-input" placeholder="Paste link here  " v-model="edit.media.twitter.url" />
                <div class="verify-button" @click="goVerifyTwitter()">Verify</div>
              </div>
              <div :class="[edit.media.discord.url?'':'empty']">
                <el-input class="discord-input" placeholder="Paste link here  " v-model="edit.media.discord.url" />
              </div>
              <div :class="[edit.media.website.url?'':'empty']">
                <el-input class="website-input" placeholder="Paste link here  " v-model="edit.media.website.url" />
              </div>
            </div>
          </div>

          <!-- Contributor -->
          <div class="form-item">
            <div class="form-item-label"> Contributor</div>
            <div class="form-item-content">
              <div class="contributor-search">
                <el-input placeholder="search near address" :class="['search-input',hasSearchBorder?'border':'']" v-model="searchWord" @focus="hasSearchBorder=true" @blur="hasSearchBorder=false" @input="search()"/>
                <div class="contributor-search-list" v-if="searchWord.trim().length>0">
                  <div class="loading-box" v-if="isSearching">
                    <img class="white-loading" src="@/assets/images/common/loading.png"/>
                  </div>
                  <template v-else-if="searchList.length>0">
                    <div class="contributor-search-item" v-for="item in searchList" @click="selectContributor(item)">
                      <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar"/>
                      <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                      <div class="name txt-wrap">{{item.name || item.account_id}}</div>
                    </div>
                  </template>
                  <div v-else-if="nobody" class="nobody">Nobody yet.</div>
                </div>
              </div>
              <div class="contributor-list">
                <template v-for="(item,index) in edit.contributor">
                  <div class="contributor-item">
                    <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar"/>
                    <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                    <div class="name txt-wrap">{{item.name || item.account_id }}</div>
                    <div class="delete-btn" @click="deleteContributor(index)"></div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  import axios from 'axios';
  import { getAccountSign } from '../utils/util';
  export default {
    components: {
    },
    props:{
      editInfo:{
        type:Object,
        value:{}
      },
      communityId:{
        type:String,
        value:""
      }
    },
    setup(props,{emit}) {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      const { proxy } = getCurrentInstance();
      const state = reactive({
        edit:{
          information:props.editInfo.information,  
          media:JSON.parse(JSON.stringify(props.editInfo.media)),
          contributor:[...props.editInfo.contributor]
        },
        //other
        searchWord:'',
        searchList:[],
        isSearching:false,
        nobody:false,
        hasSearchBorder:false,
        isLoading:false,
      })


      const goVerifyTwitter = async () => {
        //set storage
        const info = {
          callbackUrl:`/community-detail/${route.params.id}?from=verify`,
          communityId:route.params.id,
          editInfo:{
            information : state.edit.information,
            contributor : state.edit.contributor,
            media : state.edit.media,
          },
        }
        localStorage.setItem('verify_twitter_'+store.getters.accountId,JSON.stringify(info))
        const res = await proxy.$axios.profile.get_twitter_auth_url()
        window.location.href = res.data.auth_url;
      }

      const closeEditLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit('closeEditLayer');
      }

      //search
      const search = () => {
        debounceInput(state.searchWord);
      }

      let CancelToken = axios.CancelToken;
      const searchUser = async () => {
        if(state.cancel){
            state.cancel();
        }
        state.nobody = false;
        state.isSearching = true;
        const cancelToken = new CancelToken((c) => {
          state.cancel = c;
        })
        const res = await proxy.$axios.post.at({
          account_id:state.searchWord,
        },cancelToken);
        if(res.success){
          state.searchList = res.data;
          if(res.data.length==0){
            state.nobody = true;
          }
        }
        state.isSearching = false;
      }

      const debounce = (fn, delay) => {
        let timeout;
        return function(){
          clearTimeout(timeout)
          timeout = setTimeout(()=>{
            fn.apply(this, arguments)
          },delay)
        }
      }
      const debounceInput = debounce(searchUser, 300)

      const selectContributor = (item) => {
        let hasSelected = false;
        state.edit.contributor.forEach((user)=>{
          if(user.account_id == item.account_id){
            hasSelected = true;
          }
        })
        if(!hasSelected){
          state.searchWord = "";
          state.searchList = [];
          item.account_id= item.account_id;
          state.edit.contributor.push(item);
        }else{
          proxy.$Message({
            message: "Cannot be added repeatedly",
          });
        }
      }

      const deleteContributor = (index) => {
        state.edit.contributor.splice(index,1)
      }

      //edit
      const save = async () => {
        if(state.isLoading){  return; }
        // proxy.$Loading.showLoading({title: "Loading"});
        state.isLoading = true;

        const contributorList = [];
        state.edit.contributor.forEach(item=>{
          contributorList.push(item.account_id);
        })
        const param = {
          account_id:store.getters.accountId,
          community_id:props.communityId,
          information:state.edit.information,
          contributor:contributorList,
          website:state.edit.media.website.url,
          twitter:state.edit.media.twitter.url,
          discord:state.edit.media.discord.url,
        }
        // console.log(param);
        const res = await proxy.$axios.community.set_community_contributor(param);
        if(res.success){
          emit('updateInfo',state.edit);
        }else{
          proxy.$Message({
            message: "Edit Failed",
            type: "error",
          });
        }
        // proxy.$Loading.hideLoading();
        state.isLoading = false;
        
      }

      return {
        ...toRefs(state),
        search,
        selectContributor,
        deleteContributor,
        save,
        closeEditLayer,
        goVerifyTwitter
      }
    }
  }
</script>

<style lang="scss" scoped>
  .edit-layer{
    background: rgba(0,0,0,0.9);
    .edit-box{
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      width: 690px;
      background: #28282D;
      border-radius: 24px;
      overflow: hidden;
      .edit-head{
        display:flex;
        align-items: center;
        justify-content:space-between;
        height:76px;
        padding:0 20px;
        font-family: D-DINExp-Bold;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        background: #45454B;
        .mini-button-border{
          padding: 2px;
          width: 90px;
          height: 40px;
          border-radius: 24px;
          background:  rgba(255,255,255,0.2);
          cursor:pointer;
          position:relative;
          &::after {
            content: "";
            position: absolute;
            top: 0;
            left:0;
            width: 100%;
            height: 100%;
            transform-origin:center;
            transform:scale(1.1);
            filter: blur(10px) brightness(80%) opacity(.8);
            border-radius: 24px;
            background:  #FED23C;
            z-index: 1;
            transition:opacity 0.7s;
            opacity:0;
          }
          &:hover{
            background:  #FED23C;
            &::after {
              opacity:0.8;
            }
          }
          .mini-button{
            width: 86px;
            height: 36px;
            border-radius: 20px;
            background: #28282D;
            display:flex;
            align-items: center;
            justify-content: center;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
            position:relative;
            z-index:2;
          }
        }
        .edit-btn{
          height:24px;
          line-height: 24px;
          display:flex;
          align-items:center;
          font-family: D-DINExp-Bold;
          font-size: 20px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          cursor: pointer;
          .arrow{
            display:block;
            width:24px;
            height:24px;
            margin-right:8px;
            &.return{
              background:url("@/assets/images/common/icon-arrow-left.png") no-repeat center center;
              background-size:16px 16px;
            }
            &.form-close{
              background:url("@/assets/images/common/icon-close.png") no-repeat center center;
              background-size:16px 16px;
            }
          }
        }
      }
      .edit-form{
        position:relative;
        .mian-form{
          padding:0 20px 20px;
          max-height: calc(100vh - 196px);
          overflow-y: scroll;
          .form-item{
            padding-top:60px;
            &:first-child{
              padding-top:20px;
            }
            .form-item-label{
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .form-item-tip{
              font-family: D-DINExp-Bold;
              font-size: 14px;
              color: #FF6868;
              letter-spacing: 0;
              font-weight: 700;
              line-height: 20px;
            }
            .form-item-content{
              margin: 15px 0 0;
              :deep(.el-input){
                width:100%;
                input{
                  width:100%;
                  height: 50px;
                  line-height:48px;
                  background: #36363C;
                  border-radius: 10px;
                  padding:0 16px;
                  border:1px solid transparent;
                  font-family: D-DINExp;
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 400;
                }
                &.search-input{
                  z-index:2;
                  input{
                    padding-left:46px;
                    background:#36363C url("@/assets/images/header/icon-search.png") no-repeat 20px center !important;
                    background-size:16px 16px!important;
                  }
                  &.border{
                    input{
                      border: 1px solid rgba(255,255,255,1);
                    }
                  }
                }
              }
              
              :deep(.el-textarea){
                width:100%;
                border-radius: 10px;
                overflow:hidden;
                padding:15px;
                background: #36363C;
                textarea{
                  width:100%;
                  min-height:52px!important;
                  background: transparent;
                  border-radius: 0px;
                  padding:0;
                  font-family: D-DINExp;
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  line-height: 26px;
                  font-weight: 400;
                  border:0;
                  resize:none;
                }
                .el-input__count{
                  background:transparent;
                  bottom:16px;
                  right:16px;
                  opacity: 0.5;
                  font-family: D-DINExp;
                  font-size: 14px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  text-align: right;
                  font-weight: 400;
                }
              }
              .contributor-search{
                position: relative;
                .contributor-search-list{
                  position: absolute;
                  top:0;
                  left:0;
                  z-index:1;
                  width: 100%;
                  min-height: 120px;
                  padding:50px 20px 20px;
                  background: #111113;
                  border-radius: 10px;
                  display:flex;
                  flex-wrap: wrap;
                  .loading-box{
                    margin-top:20px;
                    width:100%;
                    height:30px;
                    display:flex;
                    align-items: center;
                    justify-content:center;
                  }
                  .nobody{
                    margin-top:20px;
                    width:100%;
                    height:30px;
                    display:flex;
                    align-items: center;
                    justify-content:center;
                    font-family: D-DINExp-Bold;
                    font-size: 14px;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 0;
                    font-weight: 700;
                  }
                  .contributor-search-item{
                    display:flex;
                    align-items: center;
                    padding-right:20px;
                    margin-top:20px;
                    cursor:pointer;
                    .avatar{
                      width: 40px;
                      height: 40px;
                      border-radius:50%;
                    }
                    .name{
                      margin-left:10px;
                      width:100px;
                      font-family: D-DINExp-Bold;
                      font-size: 14px;
                      color: #FFFFFF;
                      letter-spacing: 0;
                      font-weight: 700;
                      line-height:16px;
                    }
                  }
                }
              }
              .contributor-list{
                margin-top:16px;
                width:100%;
                min-height: 104px;
                background: #36363C;
                border-radius: 10px;
                display: flex;
                padding:5px 0;
                .contributor-item{
                  padding:15px 20px;
                  position: relative;
                  .avatar{
                    width: 40px;
                    height: 40px;
                    border-radius:50%;
                  }
                  .name{
                    width:40px;
                    margin-top:8px;
                    font-family: D-DINExp;
                    font-size: 14px;
                    color: #FFFFFF;
                    letter-spacing: 0;
                    text-align: center;
                    font-weight: 400;
                    line-height:16px;
                  }
                  .delete-btn{
                    position:absolute;
                    top:11px;
                    right:16px;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    border-radius:50%;
                    background: #28282D url("@/assets/images/common/icon-delete.png") no-repeat center center;
                    background-size:16px;
                  }
                }
              }
            }
            &.form-item-media{
              .empty{
                :deep(.el-input){
                  padding-bottom:15px;
                  &.website-input{
                    input{
                      background-image:url('@/assets/images/common/logo-link-hover.png');
                    }
                  }
                  &.twitter-input{
                    input{
                      background-image:url('@/assets/images/common/logo-twitter-hover.png');
                    }
                  }
                  &.discord-input{
                    input{
                      background-image:url('@/assets/images/common/logo-discord-hover.png');
                    }
                  }
                }
                
              }
              :deep(.el-input){
                padding-bottom:15px;
                input{
                  padding-left:44px;
                }
                &.website-input{
                  padding-bottom:0;
                  input{
                    background:#36363C url('@/assets/images/common/logo-link.png') no-repeat 16px center;
                    background-size:16px;
                  }
                }
                &.twitter-input{
                  input{
                    background:#36363C url('@/assets/images/common/logo-twitter.png') no-repeat 16px center;
                    background-size:16px;
                  }
                }
                &.discord-input{
                  input{
                    background:#36363C url('@/assets/images/common/logo-discord.png') no-repeat 16px center;
                    background-size:16px;
                  }
                }
              }
              .verify-box{
                position:relative;
                .verify-button{
                  position: absolute;
                  top:0;
                  right:20px;
                  display:flex;
                  align-items: center;
                  height:50px;
                  font-family: D-DINExp;
                  font-size: 14px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 400;
                  padding-right:16px;
                  cursor: pointer;
                  background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
                  background-size:12px 12px;
                }
                :deep(.el-input){
                  padding-bottom:15px;
                  input{
                    padding-right:85px;
                  }
                }
              }
            }
          }
          .step{
            padding:20px 0;
            .step-title{
              font-family: D-DINExp-Bold;
              font-size: 18px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .step-intro{
              margin-top:9px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              line-height: 22px;
              font-weight: 400;
            }
            .twitter-button{
              margin:20px 0;
              width:240px;
              height:50px;
              border: 2px solid #FED23C;
              border-radius: 40px;
              display:flex;
              align-items: center;
              justify-content:center;
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: center;
              font-weight: 700;
              img{
                width:16px;
                margin-right: 8px;
              }

            }
            :deep(.el-input){
              margin-top:20px;
              width:100%;
              input{
                width:100%;
                height: 50px;
                line-height:48px;
                background: #36363C;
                border-radius: 10px;
                padding:0 16px;
                border:1px solid transparent;
                font-family: D-DINExp;
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 400;
              }
              .el-input__count{
                background:transparent;
                .el-input__count-inner{
                  padding:0 10px;
                  background:transparent;
                  opacity: 0.5;
                  font-family: D-DINExp;
                  font-size: 14px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  text-align: right;
                  font-weight: 400;
                }
              }
            }
          }
        }
      }
    }
  }
</style>