# View Components

In this directory only components that have no own state are stored.
Having no state on themselves means they are only responsible for
displaying the data they are given.

They are usually written as *stateless functional components*,

```js
export default function MyComponent ({name}) {
  return (
    <div>Hello my name is, {name}.</div>
  )
}
```

As a lot of styling does require the library [Radium](https://github.com/FormidableLabs/radium)
for now these components have to be written like with the `class` notation,

```js
@Radium
export default class MyComponent extends Component {
  render () {
    const stlyes = {
      name: {
        color: 'read'
      }
    }

    return (
      <div style={styles.name}>Hello my name is, {name}.</div>
    )
  }
}
```

until [FormidableLabs/radium#353](https://github.com/FormidableLabs/radium/issues/353) is
resolved.
