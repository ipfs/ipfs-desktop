import { app } from 'electron'
import { join } from 'path'
import which from 'which'

// TODO: REMOVE WHEN UNUNSTALL
const windows = {
  createKey: async (classname, command) => {
    const Registry = require('winreg')
    const key = new Registry({
      hive: Registry.HKCU,
      key: `\\Software\\Classes\\${classname}\\shell\\ipfs${command ? `\\${command}` : ''}`
    })

    const exists = await new Promise((resolve, reject) => {
      key.keyExists((err, exists) => {
        if (err) reject(err)
        else resolve(exists)
      })
    })

    if (!exists) {
      await new Promise((resolve, reject) => {
        key.create(err => {
          if (err) reject(err)
          else resolve()
        })
      })
    }

    return key
  },

  set: async (key, name, type, value) => {
    return new Promise((resolve, reject) => {
      key.set(name, type, value, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

async function addWindowsKey (where) {
  const Registry = require('winreg')
  const exe = app.getPath('exe')
  const dir = await windows.createKey(where)
  await windows.set(dir, 'MUIVerb', Registry.REG_SZ, 'Add to IPFS')
  await windows.set(dir, 'Icon', Registry.REG_SZ, `"${exe}",0`)
  const cmd = await windows.createKey(where, 'command')

  if (process.env.NODE_ENV === 'development') {
    const npm = which.sync('npm')
    await windows.set(cmd, '', Registry.REG_SZ, `${npm} start --prefix ${join(__dirname, '../..')} -- --add="%1"`)
  } else {
    await windows.set(cmd, '', Registry.REG_SZ, `${exe} --add="%1"`)
  }
}

export default async () => {
  switch (process.platform) {
    case 'win32':
    case 'win64':
      await addWindowsKey('*')
      await addWindowsKey('Directory')
  }
}
