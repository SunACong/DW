<template>
  <div class="publish-container">
    <div>
      <div v-if="!publishStatus" class="publish-btn-view">
        <el-button class="publish-btn" size="medium" type="primary" @click="publishProject">
          <i class="el-icon-document-checked el-icon--right">开始发布</i>
        </el-button>
      </div>
      <div v-if="publishStatus" class="publish-finish-view">
        <el-row :gutter="10" align="middle" type="flex">
          <el-col :span="12">
            <div>
              <vue-qr
                v-if="writeLink"
                :callback="qrCodeGenSuccess"
                :logoSrc="
                  shareSettingForm.shareWxImgUrl
                    ? shareSettingForm.shareWxImgUrl
                    : 'http://119.45.156.18:8889/u/logo.png'
                "
                :size="194"
                :text="writeLink"
              />
            </div>
            <div style="text-align: center">
              <el-link type="primary" @click="downloadClick"> 下载分享二维码 </el-link>
            </div>
          </el-col>
          <el-col :span="12" style="margin-left: 75px">
            <div style="display: flex; justify-content: center">
              <div class="icon-view">
                <i class="el-icon-check success-icon" />
              </div>
            </div>
            <div>
              <p class="success-title">恭喜您，发布成功！</p>
            </div>
            <div>
              <p class="link-text">{{ writeLink }}</p>
            </div>
            <el-row>
              <el-col :offset="3" :span="6">
                <el-button
                  v-clipboard:copy="writeLink"
                  v-clipboard:error="
                    () => {
                      this.msgError('复制失败')
                    }
                  "
                  v-clipboard:success="
                    () => {
                      this.msgSuccess('复制成功')
                    }
                  "
                  type="primary"
                >
                  复制链接
                </el-button>
              </el-col>
              <el-col :span="6">
                <el-button type="danger" @click="stopPublishProject"> 停止发布 </el-button>
              </el-col>
              <el-col :span="6">
                <el-button type="warning" @click="toFeedbackPageHandle"> 查看反馈 </el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import VueQr from 'vue-qr'
import { mapGetters } from 'vuex'
import { generateQrWithTitle } from '@/utils/generateQrWithTitle'
import { getFormStatusRequest, publishFormRequest, stopPublishFormRequest } from '@/api/project/publish'
import { getSettingRequest } from '@/api/project/setting'

export default {
  name: 'ProjectPublish',
  components: {
    VueQr
  },
  data() {
    return {
      publishStatus: false,
      formKey: '',
      writeLink: '',
      qrCodeUrl: '',
      shareSettingForm: ''
    }
  },
  computed: {
    ...mapGetters('user', ['isLogin', 'userInfo']),
    parsedUserInfo() {
      if (typeof this.userInfo === 'string') {
        try {
          return JSON.parse(this.userInfo)
        } catch (e) {
          return {}
        }
      }
      return this.userInfo
    }
  },
  mounted() {
    this.formKey = this.$route.query.key
    let url = window.location.protocol + '//' + window.location.host
    this.writeLink = `${url}/s/${this.formKey}`
    this.getProjectStatus()

    getSettingRequest(this.formKey).then((res) => {
      if (res.data) {
        this.shareSettingForm = res.data
      }
    })
  },
  methods: {
    getProjectStatus() {
      getFormStatusRequest(this.formKey).then((res) => {
        if (res.data.status == 2) {
          this.publishStatus = true
        } else {
          this.publishStatus = false
        }
      })
    },
    publishProject() {
      publishFormRequest({ formKey: this.formKey }).then(() => {
        this.publishStatus = true
        this.msgSuccess('发布成功')
      })
    },
    stopPublishProject() {
      stopPublishFormRequest({ formKey: this.formKey }).then((res) => {
        if (res.data) {
          this.msgSuccess('停止成功')
          this.getProjectStatus()
        }
      })
    },
    qrCodeGenSuccess(dataUrl) {
      this.qrCodeUrl = dataUrl
    },
    downloadClick() {
      const title = this.shareSettingForm.shareWxTitleContent || `来自用户{ ${this.parsedUserInfo.username} }的分享`

      generateQrWithTitle(this.qrCodeUrl, { title })
        .then((finalBase64) => {
          this.downloadFile('qrcode.png', finalBase64)
        })
        .catch((err) => {
          console.error('下载二维码失败，使用原图。', err)
          this.downloadFile('qrcode.png', this.qrCodeUrl)
        })
    },
    downloadFile(fileName, content) {
      let aLink = document.createElement('a')
      let blob = this.base64ToBlob(content) // new Blob([content]);
      let evt = document.createEvent('HTMLEvents')
      evt.initEvent('click', true, true) // initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = fileName
      aLink.href = URL.createObjectURL(blob)
      // aLink.dispatchEvent(evt);
      aLink.click()
    },
    // base64转blob
    base64ToBlob(code) {
      let parts = code.split(';base64,')
      let contentType = parts[0].split(':')[1]
      let raw = window.atob(parts[1])
      let rawLength = raw.length
      let uInt8Array = new Uint8Array(rawLength)
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i)
      }
      return new Blob([uInt8Array], { type: contentType })
    },
    toFeedbackPageHandle() {
      this.$router.replace({ path: '/project/form/statistics', query: { key: this.formKey } })
    }
  }
}
</script>

<style lang="scss" scoped>
.publish-container {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #f7f7f7;
  min-height: 84vh;
}
.publish-btn-view {
  width: 800px;
  height: 200px;
  text-align: center;
  margin: 0px auto;
  padding-top: 300px;
}
.publish-finish-view {
  width: 800px;
  height: 200px;
  text-align: center;
  margin: 0px auto;
  padding-top: 300px;
  .icon-view {
    width: 59px;
    height: 59px;
    border-radius: 100px;
    background-color: #0076ff;
    display: flex;
    align-items: center;
    align-content: center;
    justify-items: center;
    justify-content: center;
  }
  .success-icon {
    text-align: center;
    color: white;
    font-size: 30px;
  }
  .success-title {
    color: rgba(16, 16, 16, 100);
    font-size: 28px;
  }
  .link-text {
    color: rgba(16, 16, 16, 100);
    font-size: 14px;
  }
}
</style>
