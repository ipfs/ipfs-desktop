import {dialog} from 'electron'

const errors = [
  {
    find: [
      'ipfs daemon is running',
      'already locked'
    ],
    title: 'IPFS is already running',
    message: 'Please stop your IPFS daemon before running this application.'
  }
]

export default function (e) {
  const msg = e.toString()

  const error = errors.find((error) => {
    return error.find.find((term) => {
      return msg.includes(term)
    })
  })

  if (error === undefined) {
    throw e
  } else {
    dialog.showErrorBox(
      error.title,
      error.message
    )

    process.exit(1)
  }
}
