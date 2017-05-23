import PropTypes from 'prop-types'
import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {IntlProvider} from 'react-intl-redux'
import {addLocaleData} from 'react-intl'
import pick from 'lodash/pick'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import shallowEqual from 'shallow-equal/objects'
import {persistStore, autoRehydrate} from 'redux-persist'
import localForage from 'localforage'

addLocaleData([...en, ...es])

import * as MFPropTypes from './util/prop_types'
import {capitalize} from './util/text_helpers'
import IndexRoute from './containers/index_route'
import reducers from './reducers'
import controlledStore from './controlled_store'
import config from '../config.json'

// Roboto font
require('../css/fonts.css')
require('../css/animations.css')

// Needed by material-ui for onTouchTap to work
require('react-tap-event-plugin')()

// Attach Chrome devTools extensions if it is present.
let composeEnhancers = compose
if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
}

const storeEnhancer = composeEnhancers(
  applyMiddleware(thunk),
  autoRehydrate()
)

const reduxPersistOptions = {
  storage: localForage,
  blacklist: [
    'features',
    'ui',
    'mapStyle'
  ],
  debounce: 500
}

const controllableProps = [
  'features',
  'mapStyle',
  'fieldTypes',
  'fieldOrder',
  'ui',
  'resizer'
]

class MapFilter extends React.Component {
  static propTypes = {
    features: MFPropTypes.features,
    mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    fieldTypes: PropTypes.objectOf(PropTypes.string),
    actionButton: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    resizer: PropTypes.string,
    views: PropTypes.array,
    toolbarButtons: PropTypes.arrayOf(PropTypes.func),
    toolbarTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
  }

  static defaultProps = {
    features: [],
    mapStyle: config.defaultMapStyle,
    resizer: '{url}'
  }

  handleChange = (key, value) => {
    var propName = 'onChange' + capitalize(key)
    if (typeof this.props[propName] !== 'function') return
    this.props[propName](value)
  }

  constructor (props) {
    super(props)
    const stateOverride = pick(props, controllableProps)
    const controlledStoreEnhancer = controlledStore(this.handleChange, stateOverride)
    this.store = createStore(reducers, compose(controlledStoreEnhancer, storeEnhancer))
    persistStore(this.store, reduxPersistOptions)
  }

  componentWillReceiveProps (nextProps) {
    if (shallowEqual(this.props, nextProps)) return
    const stateOverride = pick(nextProps, controllableProps)
    this.store.controlledUpdate(stateOverride)
  }

  render () {
    const {actionButton, views, toolbarButtons, toolbarTitle} = this.props
    return <Provider store={this.store}>
      <IntlProvider>
        <MuiThemeProvider muiTheme={getMuiTheme()}>
          <IndexRoute actionButton={actionButton} views={views} toolbarButtons={toolbarButtons} toolbarTitle={toolbarTitle} />
        </MuiThemeProvider>
      </IntlProvider>
    </Provider>
  }
}

export default MapFilter
