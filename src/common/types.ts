export interface DesktopPersistentStore_IpfsdConfig {
  path: string,
  flags: string[]
}

export interface DesktopPersistentStore {

  ipfsConfig: DesktopPersistentStore_IpfsdConfig,
  language: string,
  experiments: Record<string, boolean>,
  binaryPath?: string
}
