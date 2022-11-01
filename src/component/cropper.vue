<template>
    <div class="el-dialog-mask" v-if="dialogVisible">
        <div class="el-dialog">
            <el-row class="avatar">
                <div class="avatar-left" >
                    <div class="avatar-left-crop">
                        <img :src="img" class="cropper-warp-left-img crop-box" />
                        <p class="avatar-left-p">Drag or zoom to adjust position</p>
                    </div>
                </div>
                <!--
                <div class="avatar-right">
                    <img class="preview" :src="preview">
                </div>
                -->
            </el-row>
            <el-row class="footer">
                <el-button @click="closeDialog">Cancel</el-button>
                <el-button type="primary" @click="getCrop">Confirm</el-button>
            </el-row>
        </div>
    </div>
</template>


<script>
import { defineComponent,ref,reactive,toRefs,computed,nextTick,getCurrentInstance} from 'vue'
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { upload } from "@/utils/upload.js";
import { compress, compressAccurately } from 'image-conversion'

export default defineComponent({
    props:{
        type:{
            type:String,
            value:''
        },
        aspectRatio:{
            type:Number,
            value:1
        },
        maxSize:{
            type:Number,
            value:100
        }
    },
    setup(props,{emit}) {
        const { proxy } = getCurrentInstance();
        const state = reactive({
            img:'',
            blob:'',
            preview : '',
            dialogVisible:false,
            isloading:false
        })  

        //
        const getCrop = async () => {
            // if(props.type=="base64"){
            //     state.dialogVisible = false
            //     var reader = new FileReader();
            //     reader.readAsDataURL(state.blob);
            //     reader.onload = function (e) {
            //         emit('changeicon',e.target.result)
            //     }
            // }else{

                let blob = state.blob;
                if (blob.size / 1024 > 1024 * 5) { //1024 * 10
                    compressAccurately(blob, 1024 * 5).then(res => {
                        blob = res;
                    })
                } 
                state.isloading = true;
                state.dialogVisible = false
                const data =  await upload(blob);
                state.isloading = false;
                emit('changeicon',{url:data,file:blob})
            // }
        }
		const uploads = (file) => {
            const maxSize  = props.maxSize || 1024 * 1024 * 10;
            if (file.size > maxSize) {// maxSize = 10M
                proxy.$Message({
                    message: `The maximum size is ${maxSize}KB`,
                    type: "error",
                });
                // ElMessage.error('The maximum size is 2M');
                return false
            }
            const type = file.raw.type;
            new Promise(function(resolve, reject) {
                const _URL = window.URL || window.webkitURL
                const img = new Image()
                img.src = _URL.createObjectURL(file.raw)
                img.onload = function() {
					resolve(1)
                }
            }).then(() => {
                state.img = URL.createObjectURL(file.raw)
                const reader = new FileReader();
                reader.readAsDataURL(file.raw);
                reader.onload = () => {
					state.dialogVisible = true
                    nextTick(() => {
                        initCropper();
                    });
                }
            })
        }

        
        const opts = reactive({
            viewMode:1,
            aspectRatio:props.aspectRatio,
            dragMode:'move',
            autoCropArea:1,
            movable:true,
            cropBoxMovable:false,
            cropBoxResizable:false,
            background:true,
            guides:true, 
        })
        let cropper = {}
        const initCropper = () => {
			const letImg = document.querySelector('.cropper-warp-left-img');
			cropper = new Cropper(letImg, {
				viewMode: opts.viewMode,
				dragMode: opts.dragMode,
				aspectRatio: opts.aspectRatio,
				// preview: '.before',
				background: opts.background,
				autoCropArea: opts.autoCropArea,
				zoomOnWheel: true,
				movable: opts.movable,
				cropBoxMovable: opts.cropBoxMovable,
				cropBoxResizable: opts.cropBoxResizable,
				scalable: true,
				zoomable: true,
				guides: opts.guides,
				wheelZoomRatio: 0.1,
				crop: () => {
					cropper.getCroppedCanvas().toBlob((blob) => {
                        state.blob = blob;
                        // state.preview  = window.URL.createObjectURL(blob)
					});
				},
			});
		};
        const closeDialog = (res) => {
            state.dialogVisible = false
        }

        return {
            uploads,
            closeDialog,
            getCrop,
            ...toRefs(state),
    
        }
    },

    mounted(){
   
    },
})

</script>

<style lang="scss">
.el-dialog-mask{
    position:fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2000;
    height: 100%;
    background-color: rgba(0,0,0,.5);
    overflow: auto;
    .el-dialog{
        width:500px;
        height:430px;
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        background: #28282D;;
        border-radius: 10px;
        padding:30px;
        box-sizing: border-box;

    }
}
.avatar {
    display: flex;
    justify-content: space-around;
    width: 100%;
    .avatar-left {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 300px;
        height: 300px;
        background-color: #F0F2F5;
        border-radius: 4px;
        .avatar-left-crop {
            width: 300px;
            height: 300px;
            position: relative;
            .crop-box {
                width: 100%;
                height: 100%;
                border-radius: 4px;
                overflow: hidden
            }
        }
        .avatar-left-p {
            text-align: center;
            width: 100%;
            position: absolute;
            bottom: 5px;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: rgba(255,255,255,1);
            letter-spacing: 0;
            text-align: center;
            font-weight: 400;
        }
    }
    .avatar-right {
        .preview{
            width:100px;
            height:100px;
        }
    }
}
.footer{
    margin-top:30px;
    justify-content: flex-end;
    .el-button{
        width: 90px;
        height: 40px;
        border-radius: 24px;
        background: transparent;
        border: 2px solid rgba(255,255,255,0.2);
        font-family: D-DINExp-Bold;
        font-size: 14px;
        color: rgba(255,255,255,0.3);
        letter-spacing: 0;
        text-align: center;
        font-weight: 700;
        display:flex;
        align-items: center;
        justify-content: center;
        margin-left:20px;
        &.el-button--primary{
            border: 2px solid #FED23C;
            color: rgba(255,255,255,1);
        }
    }
}

</style>


