const { nativeTheme } = require('electron')

const pallette = {
  default: {
    background: '#ECECEC',
    color: '#262626',
    inputBackground: '#ffffff',
    defaultBackground: '#007AFF'
  },
  dark: {
    background: '#323232',
    color: '#ffffff',
    inputBackground: '#656565',
    defaultBackground: '#0A84FF'
  }
}

const styles = `
:root {
  --background: ${pallette.default.background};
  --color: ${pallette.default.color};
  --input-background: ${pallette.default.inputBackground};
  --default-background: ${pallette.default.defaultBackground};
}
* {
  box-sizing: border-box;
}
body, html {
  margin: 0;
  padding: 0;
  font-size: 14px;
  overflow: hidden;
}
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-family: system-ui;
  line-height: 1;
  padding: 0.75rem;
  color: var(--color);
  background: var(--background);
}
p, input, button {
  font-size: 1rem;
}
p {
  margin: 0;
}
input, button {
  border-radius: 0.2rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--input-background);
  color: var(--color);
}
input {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.15rem;
  outline: 0;
}
div.group {
  margin: 0.5rem 0;
}
div.inline input,
div.inline label {
  display: inline-block;
  width: auto;
  vertical-align: middle;
}
input[type=radio],
input[type=checkbox] {
  margin-right: 0.25rem;
}
#buttons {
  text-align: right;
}
#logo {
  width: 4rem;
  margin: 0 auto .5rem;
  display: block;
}
button {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  outline: 0;
  cursor: pointer;
}
button.default {
  background: var(--default-background);
  color: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: ${pallette.dark.background};
    --color: ${pallette.dark.color};
    --input-background: ${pallette.dark.inputBackground};
    --default-background: ${pallette.dark.defaultBackground};
  }
}
`

const getBackgroundColor = () => nativeTheme.shouldUseDarkColors
  ? pallette.dark.background
  : pallette.default.background

module.exports = {
  pallette, styles, getBackgroundColor
}
