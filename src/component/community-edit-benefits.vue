<template>
  <div class="elastic-layer edit-layer">
    <div class="edit-button close" @click="closeEditLayer()"></div>
    <div class="edit-box">
      <div class="edit-head">
        <div class="edit-btn"><span class="arrow form-close" @click="closeEditLayer()"></span>Edit Benefits</div>
        <div class="mini-button-border">
          <div class="mini-button" @click="save()">
            <img v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>Save</template>
          </div>
        </div>
      </div>
      <div class="edit-form">
        <div class="main-form">
          <!-- Benefits -->
          <div class="form-title"> 
            Add Benefit 
            <div class="add-btn" @click="addBenefit()"></div>
          </div>
          <div class="form-content">
            <div class="benefit-item" v-for="(item,index) in benefits">
              <div class="form-item">
                <div class="form-item-label">Title</div>
                <div class="form-item-content">
                  <el-input  placeholder=""   v-model="item.title" maxlength="50" show-word-limit/>
                </div>
              </div>
              <div class="form-item">
                <div class="form-item-label">Introduction</div>
                <div class="form-item-content">
                  <el-input  placeholder="" type="textarea" autosize   v-model="item.introduction" maxlength="300" show-word-limit/>
                </div>
              </div>
              <div class="form-item">
                <div class="form-item-label">Type</div>
                <div class="form-item-content">
                  <el-select v-model="item.type" size="large">
                    <el-option  key="Earn"  label="Earn"  value="Earn"></el-option>
                    <el-option  key="Access"  label="Access"  value="Access"></el-option>
                  </el-select>
                </div>
              </div>

              <div class="delete-btn" v-if="benefits.length>1" @click="deleteBenefit(index)"></div>
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
  export default {
    components: {
    },
    props:{
      editInfo:{
        type:Array,
        value:[]
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
        benefits:props.editInfo && props.editInfo.length>0 ? JSON.parse(JSON.stringify(props.editInfo)) : [{title:'',introduction:'',type:''}],
        //other
        isLoading : false
      })

      const closeEditLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit('closeEditLayer');
      }

      const addBenefit = () => {
        state.benefits.unshift({title:'',introduction:'',type:''});
      }

      const deleteBenefit = (index) => {
        state.benefits.splice(index, 1);
      }

      //edit
      const save = async () => {
        if(state.isLoading){  return; }

        //check list
        let checkRes = true;
        const benefits = [];
        state.benefits.forEach(item=>{
          if(!(!item.title.trim() && !item.introduction.trim() && !item.type)){
            if(!item.title.trim() || !item.introduction.trim() || !item.type){
              checkRes = false;
            }
            benefits.push(item);
          }
        })
        if(!checkRes){
          proxy.$Message({
            message: "Please fill in the complete information",
            type: "",
          });
          return;
        }

        //save
        // proxy.$Loading.showLoading({title: "Loading"});
        state.isLoading = true;
        const param = {
          account_id:store.getters.accountId,
          community_id:props.communityId,
          benefits:benefits
        }
        const res = await proxy.$axios.community.set_community_benefits(param);
        if(res.success){
          emit('updateInfo',benefits);
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
        addBenefit,
        deleteBenefit,
        save,
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
        padding:0 0 20px;
        .main-form{
          padding:20px 20px 0;
          max-height: calc(100vh - 216px);
          overflow-y: scroll;
        
          .form-title{
            display: flex;
            align-items: center;
            justify-content:space-between;
            height:24px;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            margin-bottom:12px;
            .add-btn{
              width:24px;
              height:24px;
              background: url('@/assets/images/common/icon-add.png') no-repeat center;
              background-size:24px 24px;
              cursor: pointer;
            }
          }
          .benefit-item{
            background: #36363C;
            border-radius: 10px;
            margin-bottom:20px;
            padding:20px;
            position:relative;
            &:last-child{
              margin-bottom: 0;
            }
            .delete-btn{
              position:absolute;
              top:-4px;
              right:-4px;
              width: 24px;
              height: 24px;
              cursor: pointer;
              border-radius:50%;
              background: #28282D url("@/assets/images/common/icon-delete.png") no-repeat center center;
            }
          }
          .form-item{
            padding-top:60px;
            &:first-child{
              padding-top:0;
            }
            .form-item-label{
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .form-item-content{
              margin: 15px 0 0;
              :deep(.el-input){
                width:100%;
                input{
                  width:100%;
                  height: 50px;
                  line-height:48px;
                  background: transparent;
                  border-radius: 10px;
                  padding:0 16px;
                  border: 1px solid rgba(255,255,255,0.2);
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
              :deep(.el-select){
                width:295px;
                .is-focus{
                  input{
                    border: 1px solid rgba(255,255,255,1);
                  }
                }
                .el-select__caret{
                  height:50px;
                }
              }
              :deep(.el-textarea){
                width:100%;
                border-radius: 10px;
                overflow:hidden;
                padding:15px;
                background: transparent;
                border: 1px solid rgba(255,255,255,0.2);
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
            }
          }
        }
        
      }
    }
  }
  
</style>
<style lang="scss">
  .el-select__popper{
    border:0!important;

    background:transparent!important;
    .el-scrollbar{
      transform:translateY(-10px);
      background: #111113!important;
      border-radius: 10px!important;
      overflow: hidden;
      .el-select-dropdown__wrap{
        .el-scrollbar__view{
          padding:0;
          .el-select-dropdown__item{
            height:50px;
            line-height:50px;
            padding:0 16px;
            font-family: D-DINExp;
            font-size: 16px;
            color: #FFFFFF;
            font-weight: 400;
            &:hover,&.selected{
              background: rgba(40,40,45,0.5)!important;
              color: #FFFFFF;
            }
          }
        }
      }
    }
    .el-popper__arrow{
      display:none;
    }
  }
</style>