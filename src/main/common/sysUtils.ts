import Winreg  from 'winreg'

export function extractFileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || ''
}


export function getRegistryValue(hive: string, key: string, name: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reg = new Winreg({
      hive: hive as any,
      key: key
    })

    reg.get(name, (err, item) => {
      if (err) {
        // 如果键不存在，返回 null 而不是抛出错误
        if (err.message.includes('The system cannot find the file specified')) {
          resolve(null)
          return
        }
        reject(err)
        return
      }
      resolve(item ? item.value : null)
    })
  })
}
