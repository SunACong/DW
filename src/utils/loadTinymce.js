import loadScript from './loadScript'
import ELEMENT from 'element-ui'

let tinymceObj

export default function loadTinymce(cb) {
  const tinymceUrl = window.origin + '/tinymce/tinymce.min.js'

  if (tinymceObj) {
    cb(tinymceObj)
    return
  }

  const loading = ELEMENT.Loading.service({
    fullscreen: true,
    lock: false,
    text: '富文本资源加载中...',
    spinner: 'el-icon-loading',
    background: 'rgba(255, 255, 255, 0.5)'
  })

  loadScript(tinymceUrl, () => {
    setTimeout(() => {
      loading.close()
    }, 500)

    // eslint-disable-next-line no-undef
    tinymceObj = tinymce
    cb(tinymceObj)
  })
}
