# View Components

In this directory only components that have no own state are stored.
Having no state on themselves means they are only responsible for
displaying the data they are given.

They shoule be written as *stateless functional components*:

```js
export default function MyComponent ({name}) {
  return (
    <div>Hello my name is, {name}.</div>
  )
}
```