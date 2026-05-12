const proxyquire = require('proxyquire').noCallThru()
const { test, expect } = require('@playwright/test')

const electronMock = {
  app: {
    getVersion: () => '0.49.0',
    relaunch: () => {},
    exit: () => {},
    getPath: () => '/tmp'
  },
  shell: {
    openExternal: () => {},
    openPath: () => {}
  }
}

const i18nMock = { t: (key) => key }

const { generateErrorIssueUrl } = proxyquire('../../src/dialogs/errors', {
  electron: electronMock,
  i18next: i18nMock,
  './dialog': () => 0
})

const MAX_URL_LENGTH = 8000

function decodeBody (url) {
  const match = url.match(/[?&]body=([^&]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function decodeTitle (url) {
  const match = url.match(/[?&]title=([^&]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

test.describe('generateErrorIssueUrl', () => {
  test('returns FAQ link for known error patterns instead of a new-issue URL', () => {
    const e = { stack: 'Error: repo.lock is held by another process' }
    const url = generateErrorIssueUrl(e)
    expect(url).toBe('https://github.com/ipfs/ipfs-desktop?tab=readme-ov-file#i-got-a-repolock-error-how-do-i-resolve-this')
  })

  test('produces a new-issue URL for unknown errors', () => {
    const e = { stack: 'Error: something we have not seen before\n    at fn (file.js:1:1)' }
    const url = generateErrorIssueUrl(e)
    expect(url).toContain('https://github.com/ipfs/ipfs-desktop/issues/new')
    expect(url).toContain('title=')
    expect(url).toContain('body=')
  })

  test('keeps URL within the 8000-char safety limit even for very long stacks', () => {
    const longStack = 'Error: kaboom\n' + Array(2000).fill('    at someFunction (/very/long/path/to/file.js:123:45)').join('\n')
    const url = generateErrorIssueUrl({ stack: longStack })
    expect(url.length).toBeLessThanOrEqual(MAX_URL_LENGTH)
  })

  test('preserves the last lines of the stack when truncating (where daemon errors live)', () => {
    const lastLine = 'Error: fs-repo-12-to-13/verify-repo-version: failed to verify repo'
    const longStack = [
      'Error: Initializing daemon...',
      ...Array(2000).fill('Fetching with HTTP: https://trustless-gateway.link/ipfs/Qm...'),
      lastLine
    ].join('\n')
    const url = generateErrorIssueUrl({ stack: longStack })
    expect(url.length).toBeLessThanOrEqual(MAX_URL_LENGTH)
    expect(decodeBody(url)).toContain(lastLine)
  })

  test('includes a marker indicating omitted lines when truncated', () => {
    const longStack = 'Error: kaboom\n' + Array(2000).fill('    at fn (file.js:1:1)').join('\n')
    const url = generateErrorIssueUrl({ stack: longStack })
    expect(decodeBody(url)).toMatch(/\.\.\. \d+ lines omitted \.\.\./)
  })

  test('does not truncate stacks small enough to fit', () => {
    const stack = 'Error: small\n    at fn (file.js:1:1)\n    at fn2 (file.js:2:2)'
    const url = generateErrorIssueUrl({ stack })
    expect(decodeBody(url)).toContain(stack)
    expect(decodeBody(url)).not.toMatch(/lines omitted/)
  })

  test('issueTitle handles stacks without a newline', () => {
    const url = generateErrorIssueUrl({ stack: 'short error message no newlines' })
    expect(decodeTitle(url)).toBe('[gui error report] short error message no newlines')
  })

  test('issueTitle truncates very long single-line errors to 72 chars', () => {
    const longLine = 'Error: ' + 'a'.repeat(200)
    const url = generateErrorIssueUrl({ stack: longLine })
    const title = decodeTitle(url)
    expect(title.length).toBe('[gui error report] '.length + 72)
  })

  test('issueTitle handles missing stack gracefully', () => {
    const url = generateErrorIssueUrl({})
    expect(decodeTitle(url)).toBe('[gui error report] unknown error, no stacktrace')
  })

  test('properly encodes ampersand and other reserved chars in stack', () => {
    const e = { stack: 'Error: foo & bar = baz # qux\n    at fn (file.js:1:1)' }
    const url = generateErrorIssueUrl(e)
    // Query string must have exactly four params: labels, template, title, body.
    // An unencoded & in the body would inflate this count.
    const queryStart = url.indexOf('?')
    const params = url.slice(queryStart + 1).split('&')
    expect(params.length).toBe(4)
    // The literal & should be percent-encoded inside body.
    expect(url).toContain('%26')
    // Decoded body should still contain the original chars.
    expect(decodeBody(url)).toContain('foo & bar = baz # qux')
  })
})
