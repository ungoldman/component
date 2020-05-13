# @ungoldman/component

⚠️ fork in progress ⚠️

experimental, no support intended. may disappear at any moment.

## Install

```sh
$ npm install @ungoldman/component
```

## Usage

```js
const choo = require('choo')
const html = require('nanohtml')
const Component = require('.')

function randomColor () {
  return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
}

class Button extends Component {
  constructor () {
    super()
    this.color = null
  }

  createElement (color, emit) {
    this.color = color

    function onclick () {
      emit('color', randomColor())
    }

    return html`
      <button style="background-color: ${color}" onclick=${onclick}>
        Click Me
      </button>
    `
  }

  // Implement conditional rendering
  update (newColor) {
    return newColor !== this.color
  }
}

const button = new Button()

function mainView (state, emit) {
  return html`<body>${button.render(state.color, emit)}</body>`
}

const app = choo()

app.route('/', mainView)
app.mount('body')

app.use(function (state, emitter) {
  state.color = 'white'

  emitter.on('color', color => {
    state.color = color
    emitter.emit('render')
  })
})
color = 'green'
})
```

## API

### `component = new Component([emit])`

Create a new Component instance. Optionally pass an emit function.

### `component.render([props,] [children])`

Render the component. Returns a proxy node if already mounted on the DOM.
Proxy nodes make it so DOM diffing algorithms leave the element alone when diffing.
Call this when `props` or `children` have changed.

### `component.rerender()`

Re-run `.render` using the last arguments that were passed to the `render` call.
Useful for triggering component renders if internal state has changed.
Arguments are automatically cached under `this._lastArgs` (🖐 hands off, buster! 🖐).
The `update` method is bypassed on re-render.

### `component.element`

A [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
property that returns the component's DOM node if its mounted in the page and
`null` when its not.

### `Component.prototype.createElement([props]) => DOMNode`

__Must be implemented.__ Component specific render function.
Optionally cache argument values here.
Run anything here that needs to run alongside node rendering.
Must return a DOMNode.
Use `beforerender` to run code after `createElement` when the component is unmounted.
Arguments passed to `render` are passed to `createElement` (`children` is attached to `props` for convenience).
Elements returned from `createElement` must always return the same root node type.

### `Component.prototype.update(nextProps, lastProps) => Boolean`

Return a boolean to determine if `prototype.createElement()` should be called.
The `update` method is analogous to React's `shouldComponentUpdate`.
Called only when the component is mounted in the DOM tree.
Arguments passed to `render` are passed to `update` (`children` is attached to `props` for convenience).
Defaults to always returning `true`.

### `Component.prototype.beforerender(el)`

A function called right after `createElement` returns with `el`, but before the fully rendered
element is returned to the `render` caller. Run any first render hooks here. The `load` and
`unload` hooks are added at this stage. Do not attempt to `rerender` in `beforerender` as the component may not be in the DOM yet.

### `Component.prototype.load(el)`

Called when the component is mounted on the DOM. Uses [on-load][onload] under
the hood.

### `Component.prototype.unload(el)`

Called when the component is removed from the DOM. Uses [on-load][onload] under
the hood.

### `Component.prototype.afterupdate(el)`

Called after a mounted component updates (e.g. `update` returns true). You can use this hook to call
`element.scrollIntoView` or other dom methods on the mounted component.

### `Component.prototype.afterreorder(el)`

Called after a component is re-ordered. This method is rarely needed, but is handy when you have a component
that is sensitive to temorary removals from the DOM, such as externally controlled iframes or embeds (e.g. embedded tweets).

## License

[MIT](https://tldrlegal.com/license/mit-license)

[onload]: https://github.com/shama/on-load
