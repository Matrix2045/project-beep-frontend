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
        <!-- avatar -->
        <el-upload
          class="upload-avatar"
          :show-file-list="false"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          list-type="picture-card"
          :on-change="uploadAvatar"
          :auto-upload="false"
        >
          <div class="avatar-box">
            <img v-if="avatarFile" class="avatar" :src="avatarFile" />
            <img v-else-if="edit.avatar" class="avatar" :src="$store.getters.getAwsImg(edit.avatar)" @error.once="$event.target.src=edit.avatar" />
            <div class="upload-button"></div>
          </div>
        </el-upload>
        <!-- cover -->
        <el-upload
          class="upload-cover"
          :show-file-list="false"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          list-type="picture-card"
          :on-change="uploadCover"
          :auto-upload="false"
        >
          <div class="cover-box">
            <img v-if="coverFile" class="cover" :src="coverFile" />
            <img v-else-if="edit.cover" class="cover" :src="$store.getters.getAwsImg(edit.cover)" @error.once="$event.target.src=edit.cover" />
            <div class="upload-button"></div>
          </div>
        </el-upload>
        <div class="mian-form">
          <!-- Name -->
          <div class="form-item form-item-name">
            <div class="form-item-tip" v-if="nameError"> Name can’t be blank</div>
            <div class="form-item-label" v-else> Name</div>
            <div class="form-item-content">
              <el-input placeholder="Your name"  v-model="edit.name"  maxlength="50" show-word-limit/>
            </div>
          </div>
          <!-- Bio -->
          <div class="form-item">
            <div class="form-item-label"> Bio</div>
            <div class="form-item-content">
              <el-input  placeholder="Tell others more about you!  " autosize type="textarea"  v-model="edit.info" maxlength="160" show-word-limit/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Cropper ref='avatarCropper' :aspectRatio="1" @changeicon="changeAvatar"></Cropper>
  <Cropper ref='coverCropper' :aspectRatio="23/8" @changeicon="changeCover"></Cropper>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  import Cropper from '@/component/cropper.vue';
  export default {
    components: {
      Cropper
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
        edit:{...props.editInfo},
        // {
        //   avatar:'',  
        //   cover:'',
        //   name:'',
        //   info:'',
        // },
        //other 
        avatarFile:'',
        coverFile:'',
        nameError:false,
        isLoading:false,
      })

      //edit avatar & cover
      const avatarCropper= ref()
      const coverCropper= ref()
      const uploadAvatar = (file) => {
        avatarCropper.value.uploads(file);
      }
      const uploadCover = (file) => {
        coverCropper.value.uploads(file);
      }
      const changeAvatar = (res) => {
        state.edit.avatar = res.url;
        blobToBase64('avatar',res.file);
      }
      const changeCover = (res) => {
        state.edit.cover = res.url;
        blobToBase64('cover',res.file);
      }

      const closeEditLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit('closeEditLayer');
      }

      const blobToBase64 = (paramName,blob) => {
        const reader = new FileReader();
        reader.addEventListener('load', ()=> {
          console.log(reader.result);
          state[paramName+'File'] = reader.result;
        });
        reader.readAsDataURL(blob);
      }

      //edit
      const save = async () => {
        if(state.isLoading){  return; }
        if(!state.edit.name.trim()){
          state.nameError = true;
          return;
        }
        // proxy.$Loading.showLoading({title: "Loading"});
        state.isLoading = true;
        state.nameError = false;
        const param = {
          account_id:store.getters.accountId,
          community_id:props.communityId,
          ...state.edit,
        }
        const res = await proxy.$axios.community.set_community_basicinfo(param);
        if(res.success){
          emit('updateInfo',state.edit);
        }else{
          proxy.$Message({
            message: "Edit Failed",
            type: "error",
          });
        }

        state.isLoading = false;
      }

      return {
        ...toRefs(state),
        save,
        avatarCropper,
        coverCropper,
        uploadAvatar,
        uploadCover,
        changeAvatar,
        changeCover,
        closeEditLayer,
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
      padding-bottom:20px;
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
        .upload-avatar{
          position:absolute;
          left:16px;
          top:200px;
          z-index: 2;
          :deep(.el-upload){
            width: 98px;
            height: 98px;
            padding:4px;
            border:0;
            border-radius:16px;
            background: rgba(40,40,45,1);
            .avatar-box{
              width: 90px;
              height: 90px;
              border-radius:16px;
              position:relative;
              .avatar{
                width: 90px;
                height: 90px;
                object-fit: cover;
                border-radius:16px;
              }
              .upload-button{
                width: 90px;
                height: 90px;
                border-radius:16px;
                background: rgba(0,0,0,0.50) url("@/assets/images/common/icon-upload.png") no-repeat center center;
                background-size:30px;
                position:absolute;
                top:0;
                left:0;
              }
            }
          }
        }
        .upload-cover{
          margin-bottom: 68px;
          :deep(.el-upload){
            width: 690px;
            height: 240px;
            background: #111113;
            border:none;
            .cover-box{
              width: 690px;
              height: 240px;
              position:relative;
              .cover{
                width: 690px;
                height: 240px;
                object-fit: cover;
              }
              .upload-button{
                width: 70px;
                height: 70px;
                border-radius:50%;
                background: rgba(255,255,255,0.10) url("@/assets/images/common/icon-upload.png") no-repeat center center;
                background-size:30px;
                position:absolute;
                top:50%;
                left:50%;
                transform:translate(-50%,-50%);
              }
            }
          }
        }
        .mian-form{
          padding:0 20px;
          max-height: calc(100vh - 544px);
          overflow-y: scroll;
          .form-item{
            padding-top:60px;
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
              :deep(.el-textarea){
                width:100%;
                border-radius: 10px;
                overflow:hidden;
                padding:15px;
                background: #36363C;
                textarea{
                  width:100%;
                  min-height:82px!important;
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
            }
            &.form-item-name{
              padding-top:50px;
            }
          }

        }
      }
    }
  }
</style>