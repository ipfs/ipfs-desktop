import { app } from 'electron'
import { join } from 'path'
import which from 'which'
import Registry from 'winreg'

async function create (classname, command) {
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
}

async function set (key, name, type, value) {
  return new Promise((resolve, reject) => {
    key.set(name, type, value, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

async function destroy (key) {
  return new Promise((resolve, reject) => {
    key.destroy(err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

async function createFor (where) {
  const exe = app.getPath('exe')
  const dir = await create(where)
  await set(dir, 'MUIVerb', Registry.REG_SZ, 'Add to IPFS')
  await set(dir, 'Icon', Registry.REG_SZ, `"${exe}",0`)
  const cmd = await create(where, 'command')

  if (process.env.NODE_ENV === 'development') {
    const npm = which.sync('npm')
    await set(cmd, '', Registry.REG_SZ, `${npm} start --prefix ${join(__dirname, '../../..')} -- --add="%1"`)
  } else {
    await set(cmd, '', Registry.REG_SZ, `${exe} --add="%1"`)
  }
}

async function destroyFor (what) {
  await destroy(await create(what))
}

export default {
  add: async () => {
    await createFor('*')
    await createFor('Directory')
  },
  remove: async () => {
    await destroyFor('*')
    await destroyFor('Directory')
  }
}
