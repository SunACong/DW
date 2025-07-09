// utils/qr/generateQrWithTitle.js
export function generateQrWithTitle(qrBase64, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      title = '扫码查看表单',
      qrSize = 194,
      padding = 20,
      fontSize = 20,
      fontColor = '#000000',
      backgroundColor = '#ffffff'
    } = options

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = qrSize + padding * 2
    canvas.height = fontSize + padding + qrSize + padding

    // 背景
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 标题
    ctx.fillStyle = fontColor
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(title, canvas.width / 2, fontSize)

    // 加载二维码图片
    const img = new Image()
    img.crossOrigin = 'Anonymous' // 避免跨域问题
    img.onload = () => {
      ctx.drawImage(img, padding, fontSize + padding / 2, qrSize, qrSize)
      const finalBase64 = canvas.toDataURL('image/png')
      resolve(finalBase64)
    }
    img.onerror = reject
    img.src = qrBase64
  })
}
