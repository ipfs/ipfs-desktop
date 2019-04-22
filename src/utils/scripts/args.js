module.exports = (which) => {
  const full = `--${which}=`

  for (const arg of process.argv) {
    if (!arg.startsWith(full)) {
      continue
    }

    return arg.slice(full.length)
  }
}
