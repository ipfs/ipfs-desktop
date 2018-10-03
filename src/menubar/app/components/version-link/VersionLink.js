import React from 'react'

const providers = {
  'go-ipfs': {
    url: 'https://github.com/ipfs/go-ipfs'
  },
  'js-ipfs': {
    url: 'https://github.com/ipfs/js-ipfs'
  }
}

const findUrl = name => {
  const provider = providers[name]
  if (!provider) return null
  return provider.url
}

// formats an ipfs agentVersion string from /go-ipfs/0.32.29 to go-ipfs@0.32.29
const VersionLink = ({ agentVersion }) => {
  if (!agentVersion) return <span>Unknown</span>
  const parts = agentVersion.split('/').filter(str => !!str)
  const name = parts[0]
  const url = findUrl(name)
  const version = parts[1]
  if (!url) {
    return (
      <span>
        {name}
        <ReleaseLink agent={name} version={version} />
      </span>
    )
  }
  return (
    <span>
      <a href={url} className='link blue' target='_blank'>
        {name}
      </a>
      <ReleaseLink agent={name} version={version} />
    </span>
  )
}

const ReleaseLink = ({ agent, version }) => {
  if (!version) return ''
  if (agent === 'js-ipfs') {
    const releaseUrl = `${providers['js-ipfs'].url}/releases/tag/v${version}`
    return (
      <a href={releaseUrl} className='link blue ml2' target='_blank'>
        v{version}
      </a>
    )
  }
  return ` v${version}`
}

export default VersionLink
