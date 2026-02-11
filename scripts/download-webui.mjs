import { CarReader } from '@ipld/car'
import { exporter } from 'ipfs-unixfs-exporter'
import { CID } from 'multiformats/cid'
import * as digest from 'multiformats/hashes/digest'
import { sha256 } from 'multiformats/hashes/sha2'
import { createWriteStream, promises as fs } from 'node:fs'
import { join, dirname } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Readable, Transform } from 'node:stream'

const cidStr = process.env.WEBUI_CID || 'bafybeidsjptidvb6wf6benznq2pxgnt5iyksgtecpmjoimlmswhtx2u5ua'
const outDir = process.env.WEBUI_OUT || 'assets/webui'
const timeoutMs = Number.parseInt(process.env.WEBUI_TIMEOUT || '360000', 10)
const gateway = process.env.WEBUI_GATEWAY || 'https://trustless-gateway.link'
const sourcePreference = process.env.WEBUI_SOURCE || 'auto'
const localGateway = process.env.WEBUI_IPFS_GATEWAY || 'http://127.0.0.1:8080'
const localTimeoutMs = Number.parseInt(process.env.WEBUI_IPFS_TIMEOUT || '1200', 10)
const debug = process.env.WEBUI_DEBUG === '1'

const rootCid = CID.parse(cidStr)

async function ensureDir (dir) {
  await fs.mkdir(dir, { recursive: true })
}

function formatBytes (bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KiB', 'MiB', 'GiB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  const precision = value >= 100 || index === 0 ? 0 : 1
  return `${value.toFixed(precision)} ${units[index]}`
}

function elapsedSeconds (startedAt) {
  return ((Date.now() - startedAt) / 1000).toFixed(1)
}

function isAsyncIterable (obj) {
  return obj && typeof obj[Symbol.asyncIterator] === 'function'
}

function isIterable (obj) {
  return obj && typeof obj[Symbol.iterator] === 'function'
}

function stripCidPrefix (path) {
  if (!path) return ''
  if (path === cidStr) return ''
  if (path.startsWith(`${cidStr}/`)) return path.slice(cidStr.length + 1)
  return path
}

function getSources () {
  const ipfsUrl = `${localGateway}/ipfs/${cidStr}?format=car`
  const gatewayUrl = `${gateway}/ipfs/${cidStr}?format=car`

  if (sourcePreference === 'ipfs') {
    return [{ name: 'ipfs', url: ipfsUrl, timeout: localTimeoutMs }]
  }
  if (sourcePreference === 'gateway') {
    return [{ name: 'gateway', url: gatewayUrl, timeout: timeoutMs }]
  }

  return [
    { name: 'ipfs', url: ipfsUrl, timeout: localTimeoutMs },
    { name: 'gateway', url: gatewayUrl, timeout: timeoutMs }
  ]
}

// eslint-disable-next-line complexity -- Network+stream fetch has many failure/timeout branches; refactor would reduce readability here.
async function fetchCarFromSource (source) {
  const startedAt = Date.now()
  console.log(`[webui] download source=${source.name} url=${source.url}`)
  const res = await fetch(source.url, { signal: AbortSignal.timeout(source.timeout) })
  if (!res.ok || !res.body) {
    throw new Error(`Failed to fetch CAR from ${source.name} (${res.status})`)
  }

  const contentLength = Number.parseInt(res.headers.get('content-length') || '', 10)
  const totalBytes = Number.isFinite(contentLength) ? contentLength : 0
  let nextLogMs = Date.now() + 2000
  let nextPercent = 10

  const chunks = []
  let receivedBytes = 0
  const reader = res.body.getReader()
  while (true) {
    // eslint-disable-next-line no-await-in-loop -- we must read the stream sequentially.
    const { done, value } = await reader.read()
    if (done) break
    if (!value || value.length === 0) continue
    chunks.push(value)
    receivedBytes += value.length

    const now = Date.now()
    if (totalBytes > 0) {
      const percent = (receivedBytes / totalBytes) * 100
      if (percent >= nextPercent || now >= nextLogMs) {
        console.log(`[webui] download progress source=${source.name} percent=${Math.min(percent, 100).toFixed(1)} received=${formatBytes(receivedBytes)} total=${formatBytes(totalBytes)}`)
        nextPercent += 10
        nextLogMs = now + 2000
      }
    } else if (now >= nextLogMs) {
      console.log(`[webui] download progress source=${source.name} received=${formatBytes(receivedBytes)}`)
      nextLogMs = now + 2000
    }
  }

  const bytes = new Uint8Array(receivedBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }

  console.log(`[webui] download done source=${source.name} bytes=${formatBytes(receivedBytes)} elapsed=${elapsedSeconds(startedAt)}s`)
  return bytes
}

async function fetchCar () {
  const sources = getSources()
  console.log(`[webui] download strategy sourcePreference=${sourcePreference} cid=${cidStr}`)
  for (const source of sources) {
    try {
      // eslint-disable-next-line no-await-in-loop -- sources are tried sequentially by design.
      return await fetchCarFromSource(source)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[webui] download source=${source.name} failed: ${message}`)
    }
  }
  throw new Error(`Unable to fetch webui CAR from configured sources (${sources.map(source => source.name).join(', ')})`)
}

async function buildBlockstore (carBytes) {
  const startedAt = Date.now()
  console.log(`[webui] verifying CAR bytes=${formatBytes(carBytes.length)}`)
  const reader = await CarReader.fromBytes(carBytes)
  const roots = await reader.getRoots()
  if (!roots.some(r => r.toString() === rootCid.toString())) {
    throw new Error('CAR roots do not match requested CID')
  }

  const store = new Map()
  let blockCount = 0
  let blockBytes = 0
  let nextLogCount = 1000
  for await (const block of reader.blocks()) {
    const cid = block.cid
    const bytes = block.bytes
    const mh = digest.decode(cid.multihash.bytes)
    if (mh.code !== sha256.code) {
      throw new Error(`Unsupported multihash code: ${mh.code}`)
    }
    const hash = await sha256.digest(bytes)
    if (!digest.equals(mh, hash)) {
      throw new Error(`Block hash mismatch for ${cid.toString()}`)
    }
    store.set(cid.toString(), bytes)
    blockCount += 1
    blockBytes += bytes.length
    if (blockCount >= nextLogCount) {
      console.log(`[webui] verify progress blocks=${blockCount} bytes=${formatBytes(blockBytes)}`)
      nextLogCount += 1000
    }
  }

  console.log(`[webui] verify done blocks=${blockCount} bytes=${formatBytes(blockBytes)} elapsed=${elapsedSeconds(startedAt)}s`)

  return {
    get: (cid) => {
      const bytes = store.get(cid.toString())
      if (!bytes) throw new Error(`Missing block ${cid.toString()}`)
      return [bytes]
    }
  }
}

async function writeFileContent (fullPath, content) {
  let entryContent = content
  if (typeof entryContent === 'function') {
    entryContent = entryContent()
  }

  await ensureDir(dirname(fullPath))

  if (isAsyncIterable(entryContent) || isIterable(entryContent)) {
    let writtenBytes = 0
    const counter = new Transform({
      transform (chunk, _encoding, callback) {
        const length = chunk?.byteLength ?? chunk?.length ?? 0
        writtenBytes += length
        callback(null, chunk)
      }
    })
    const out = createWriteStream(fullPath)
    await pipeline(Readable.from(entryContent), counter, out)
    return writtenBytes
  }

  if (entryContent instanceof Uint8Array) {
    await fs.writeFile(fullPath, entryContent)
    return entryContent.length
  }

  throw new TypeError('entry.content is not async iterable')
}

function resolveRelPath (entry, relPath = '') {
  if (relPath) return relPath

  let resolved = stripCidPrefix(entry.path)
  if (!resolved) {
    if (entry.name && entry.name !== cidStr) {
      resolved = entry.name
    } else {
      resolved = ''
    }
  }

  return resolved
}

// eslint-disable-next-line complexity -- CAR extraction/writing needs a single linear flow to keep progress accounting understandable.
async function writeEntry (entry, baseDir, blockstore, stats, relPath = '') {
  const progress = stats
  if (debug) {
    const type = entry.type
    const path = entry.path
    const name = entry.name
    const contentType = typeof entry.content
    console.error(`[webui] entry type=${type} path=${path} name=${name} contentType=${contentType}`)
  }

  const effectiveRelPath = resolveRelPath(entry, relPath)

  if (entry.type === 'directory') {
    const dirPath = effectiveRelPath ? join(baseDir, effectiveRelPath) : baseDir
    await ensureDir(dirPath)
    progress.directories += 1

    // ipfs-unixfs-exporter@15 exposes directory traversal via entries().
    if (typeof entry.entries === 'function') {
      for await (const child of entry.entries()) {
        const childRelPath = effectiveRelPath ? join(effectiveRelPath, child.name) : child.name
        const childEntry = await exporter(child.cid, blockstore)
        await writeEntry(childEntry, baseDir, blockstore, progress, childRelPath)
      }
      return
    }

    // Backward compatibility with older exporter versions that exposed content().
    let dirContent = entry.content
    if (typeof dirContent === 'function') {
      dirContent = dirContent()
    }
    if (!isAsyncIterable(dirContent)) {
      if (debug) {
        console.error('[webui] directory content value:', dirContent)
      }
      throw new TypeError('directory content is not async iterable')
    }
    for await (const child of dirContent) {
      await writeEntry(child, baseDir, blockstore, progress)
    }
    return
  }

  if (entry.type !== 'file' && entry.type !== 'raw') return

  const fullPath = join(baseDir, effectiveRelPath)
  const writtenBytes = await writeFileContent(fullPath, entry.content)
  progress.files += 1
  progress.fileBytes += writtenBytes
  if (progress.files % 200 === 0) {
    console.log(`[webui] extract progress files=${progress.files} bytes=${formatBytes(progress.fileBytes)}`)
  }
}

async function main () {
  const startedAt = Date.now()
  await fs.rm(outDir, { recursive: true, force: true })
  await ensureDir(outDir)

  const carBytes = await fetchCar()
  const blockstore = await buildBlockstore(carBytes)

  const root = await exporter(rootCid, blockstore)
  const stats = { files: 0, directories: 0, fileBytes: 0 }
  await writeEntry(root, outDir, blockstore, stats)
  console.log(`[webui] extract done files=${stats.files} directories=${stats.directories} bytes=${formatBytes(stats.fileBytes)} elapsed=${elapsedSeconds(startedAt)}s`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
