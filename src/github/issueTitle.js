// @ts-check
const issueTitle = (e) => {
  const es = e.stack ? e.stack.toString() : 'unknown error, no stacktrace'
  const firstLine = es.substr(0, Math.min(es.indexOf('\n'), 72))
  return `[gui error report] ${firstLine}`
}

module.exports = issueTitle
