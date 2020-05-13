var test = require('tape')
var SimpleComponent = require('./simple')
var BlogSection = require('./blog-section')
var Component = require('../../')
var html = require('nanohtml')
var nanobus = require('nanobus')

function makeID () {
  return 'testid-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}

function createTestElement () {
  var testRoot = document.createElement('div')
  testRoot.id = makeID()
  document.body.appendChild(testRoot)
  return testRoot
}

test('can create a simple component', function (t) {
  var testRoot = createTestElement()

  // Create instance and mount
  var comp = new SimpleComponent()
  testRoot.appendChild(comp.render({ color: 'green' }))
  t.ok(comp.element, 'component created and mounted in page')
  t.equal(comp.element.querySelector('.name').innerText, 'yosh', 'default options correctly rendered')
  t.equal(comp.element.querySelector('.color').innerText, 'green', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'not a proxy element')

  // Update mounted component and inspect proxy
  var proxy = comp.render({ color: 'red' })
  t.ok(proxy.dataset.proxy != null, 'proxy is returned on mounted component')
  t.equal(proxy.dataset.component, comp._cID, 'proxy is tagged with the correct cID')
  t.equal(proxy.nodeName, comp.element.nodeName, 'proxy is of same type')
  t.ok(proxy.isSameNode(comp.element), 'isSameNode works')
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  comp.render({ color: 'red' })
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'arguments correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  comp.name = 'lrlna' // Update internal state
  comp.rerender()
  t.ok(comp.element, 'component is still mounted in page')
  t.equal(comp.element.querySelector('.name').innerText, 'lrlna', 'instance options correctly rerendered')
  t.equal(comp.element.querySelector('.color').innerText, 'red', 'internal state reflected in rerender')
  t.equal(comp.element.dataset.proxy, undefined, 'mounted node isn\'t a proxy')

  t.end()
})

test('proxy node types match the root node returned from createElement', function (t) {
  var testRoot = createTestElement()
  var comp = new BlogSection()
  testRoot.appendChild(comp.render({ entries: ['hey', 'hi', 'howdy'] }))
  t.ok(comp.element, 'component created and mounted in page')
  t.equal(comp.element.nodeName, 'SECTION', 'correctly rendered')
  t.equal(comp.element.dataset.proxy, undefined, 'not a proxy element')

  var proxy = comp.render({ entries: ['by', 'bye', 'cya'] })
  t.equal(proxy.nodeName, comp.element.nodeName, 'proxy is of same type as the root node of createElement')

  t.end()
})

test('missing createElement', function (t) {
  class Missing extends Component {}

  var badMissing = new Missing()
  t.throws(badMissing.render.bind(badMissing), new RegExp(/createElement should be implemented/), 'call to render throws if createElement is missing')
  t.end()
})

test('lifecycle tests', function (t) {
  var testRoot = createTestElement()
  class LifeCycleComp extends Component {
    constructor () {
      super()
      this.bus = nanobus()
      this.testState = {
        'create-element': 0,
        update: 0,
        beforerender: 0,
        afterupdate: 0,
        load: 0,
        unload: 0
      }
    }

    createElement (props) {
      this.__testProps = props
      this.testState['create-element']++
      return html`<div>${props.text}</div>`
    }

    update (nextProps, lastProps) {
      const shouldUpdate = nextProps.text !== lastProps.text
      this.testState.update++
      return shouldUpdate
    }

    beforerender () {
      this.testState.beforerender++
    }

    afterupdate () {
      this.testState.afterupdate++
    }

    load () {
      this.testState.load++
      this.bus.emit('load')
    }

    unload () {
      this.testState.unload++
      this.bus.emit('unload')
    }
  }

  var comp = new LifeCycleComp()
  comp.bus.on('load', () => window.requestAnimationFrame(onLoad))
  comp.bus.on('unload', () => window.requestAnimationFrame(onUnload))

  t.deepEqual(comp.testState, {
    'create-element': 0,
    update: 0,
    beforerender: 0,
    afterupdate: 0,
    load: 0,
    unload: 0
  }, 'no lifecycle methods run on instantiation')

  var el = comp.render({ text: 'hey' })

  t.deepEqual(comp.testState, {
    'create-element': 1,
    update: 0,
    beforerender: 1,
    afterupdate: 0,
    load: 0,
    unload: 0
  }, 'create-element and beforerender is run on first render')

  testRoot.appendChild(el)

  function onLoad () {
    t.deepEqual(comp.testState, {
      'create-element': 1,
      update: 0,
      beforerender: 1,
      afterupdate: 0,
      load: 1,
      unload: 0
    }, 'component loaded')

    comp.render({ text: 'hi' })

    t.deepEqual(comp.testState, {
      'create-element': 2,
      update: 1,
      beforerender: 1,
      afterupdate: 1,
      load: 1,
      unload: 0
    }, 'component re-rendered')

    comp.render({ text: 'hi' })

    t.deepEqual(comp.testState, {
      'create-element': 2,
      update: 2,
      beforerender: 1,
      afterupdate: 1,
      load: 1,
      unload: 0
    }, 'component cache hit')

    testRoot.removeChild(comp.element)
  }

  function onUnload () {
    t.equal(comp.element, undefined, 'component unmounted')
    t.end()
  }
})
