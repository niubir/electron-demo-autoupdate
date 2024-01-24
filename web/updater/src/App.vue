<script setup>
import { ref, computed } from 'vue'
import { Button } from 'vant'

const version = ref({})
const operating = ref(false)

window.api.Version().then(data=>{
  console.log("Version:", data)
  version.value = data
}).catch(err=>{
  alert(err)
})
window.api.ListenVersion((data)=>{
  console.log("ListenVersion:", data)
  version.value = data
})
window.api.ListenVersionDownloadProgress((data)=>{
  console.log("ListenVersionDownloadProgress:", data)
})

const local = computed(()=>{
  if ('local' in version.value) {
    return version.value.local
  }
  return '加载中...'
})
const server = computed(()=>{
  if ('server' in version.value) {
    return version.value.server
  }
  return '加载中...'
})
const operateBtnDisabled = computed(()=>{
  if (operating.value) {
    return true
  }
  if ('status' in version.value) {
    switch (version.value.status) {
      case 'OUTDATED':
      case 'DOWNLOADED':
      case 'INSTALLED':
        return false
      default:
        return true
    }
  }
  return true
})
const operateBtnTxt = computed(()=>{
  if ('status' in version.value) {
    switch (version.value.status) {
      case 'LATEST':
        return '无需更新'
      case 'OUTDATED':
        return '更新'
      case 'DOWNLOADING':
        return '下载中'
      case 'DOWNLOADED':
        return '安装'
      case 'INSTALLING':
        return '安装中'
      case 'INSTALLED':
        return '重启'
      case 'ERROR':
        return '错误'
      default:
        return 'UNKNOW'
    }
  }
  return '加载中...'
})

const operate = () => {
  if (operating.value) {
    return
  }
  if (!('status' in version.value)) {
    return
  }

  operating.value = true
  switch (version.value.status) {
    case 'OUTDATED':
      window.api.VersionDownload().catch(err=>{
        alert(err)
      }).finally(()=>{
        operating.value = false
      })
      break
    default:
      operating.value = false
  }
}

</script>

<template>
  <div class="version">
    <div class="info">
      <div>
        <p>本地版本:</p>
        <p>{{ local }}</p>
      </div>
      <div>
        <p>最新版本:</p>
        <p>{{ server }}</p>
      </div>
    </div>
    <div class="operate">
      <Button round :disabled="operateBtnDisabled" @click="operate">{{ operateBtnTxt }}</Button>
    </div>
  </div>
</template>

<style scoped>
.version {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.info div {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.van-button {
  height: 2.6rem;
}
</style>
