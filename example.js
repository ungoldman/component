const choo = require('choo')
const html = require('nanohtml')
const Component = require('.')

const events = {
  BUTTON_CLICK: 'button click'
}

function randomColor () {
  return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
}

class Button extends Component {
  createElement (props) {
    const onclick = () => {
      this.emit(events.BUTTON_CLICK, randomColor())
    }

    return html`
      <button style="background-color: ${props.color}" onclick=${onclick}>
        Click Me
      </button>
    `
  }

  // Implement conditional rendering
  update (nextProps, lastProps) {
    return nextProps.color !== lastProps.color
  }
}

const app = choo()
const button = new Button(app.emit)

function mainView (state, emit) {
  return html`<body>${button.render({ color: state.color })}</body>`
}

app.route('/', mainView)
app.mount('body')

app.use(function (state, emitter) {
  state.color = 'white'

  emitter.on(events.BUTTON_CLICK, color => {
    state.color = color
    emitter.emit('render')
  })
})
