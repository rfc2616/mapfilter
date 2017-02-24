import React, { PropTypes } from 'react'
import makePure from 'recompose/pure'
import Checkbox from 'material-ui/Checkbox'
import ListIcon from 'material-ui/svg-icons/action/list'
import {ListItem} from 'material-ui/List'
import {injectIntl} from 'react-intl'
import assign from 'object-assign'
import omit from 'lodash/omit'

import ShowAllButton from './show_all_button'
import OnlyButton from './only_button'
import {createMessage as msg} from '../util/intl_helpers'
import { listStyles } from '../styles'

const PureCheckbox = makePure(Checkbox)

const styles = {
  checkbox: {
    marginBottom: 8,
    fontSize: 14
  },
  checkboxLabel: {
    lineHeight: '22px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  coloredSpan: {
    backgroundColor: 'rgb(0, 188, 212)',
    borderRadius: 2,
    padding: '2px 5px',
    color: 'white',
    letterSpacing: '0.02em'
  },
  checkboxIcon: {
    width: 20,
    height: 20,
    marginRight: 14
  }
}

// Material-ui passes a `nestedLevel` prop to nested items.
// We're not using a `div` instead of the material-ui component for
// nested items, so we need to remove the `nestedLevel` prop.
const NestedItem = props => {
  const divProps = omit(props, ['nestedLevel', 'children'])
  return <div {...divProps}>{props.children}</div>
}

class DiscreteFilter extends React.PureComponent {
  static propTypes = {
    fieldName: PropTypes.string.isRequired,
    checked: PropTypes.array,
    values: PropTypes.objectOf(PropTypes.number),
    onUpdate: PropTypes.func
  }

  static defaultProps = {
    checked: [],
    onUpdate: (x) => x
  }

  state = {}

  showAll = (e) => {
    e.preventDefault()
    this.props.onUpdate({
      exp: 'in',
      key: this.props.fieldName,
      val: null
    })
  }

  handleCheck = (e) => {
    const v = e.target.value
    const checked = this.props.checked.slice(0)
    if (e.target.checked && checked.indexOf(v) === -1) {
      checked.push(v)
    } else if (!e.target.checked && checked.indexOf(v) > -1) {
      checked.splice(checked.indexOf(v), 1)
    }
    this.props.onUpdate({
      exp: 'in',
      key: this.props.fieldName,
      val: checked
    })
  }

  handleOnlyClick (key, e) {
    e.preventDefault()
    this.props.onUpdate({
      exp: 'in',
      key: this.props.fieldName,
      val: [key]
    })
  }

  handleMouseEnter (key) {
    this.setState({hovered: key})
  }

  handleMouseLeave = () => {
    this.setState({hovered: false})
  }

  render () {
    const {fieldName, checked, values, colored, colorIndex, intl: {formatMessage}} = this.props
    const isFiltered = checked.length < Object.keys(values).length
    const title = fieldName.split('.').slice(-1)[0]
    const subTitle = fieldName.indexOf('.') > 1 ? fieldName.split('.').slice(0, -1).join(' / ') : null

    return (
      <ListItem
        innerDivStyle={listStyles.listItemInner}
        primaryText={formatMessage(msg('field_key')(title))}
        secondaryText={subTitle && formatMessage(msg('field_key')(subTitle))}
        leftIcon={<ListIcon style={listStyles.listIcon} />}
        initiallyOpen
        disabled
        rightIconButton={isFiltered ? <ShowAllButton onTouchTap={this.showAll} /> : null}
        nestedListStyle={listStyles.nestedList}
        nestedItems={Object.keys(values).map((v) => (
          <NestedItem
            key={v}
            style={{position: 'relative'}}
            onMouseEnter={this.handleMouseEnter.bind(this, v)}
            onMouseLeave={this.handleMouseLeave}>
            <PureCheckbox
              label={
                <span style={colored ? assign({}, styles.coloredSpan, {backgroundColor: colorIndex[v]}) : null}>
                  {formatMessage(msg('field_value')(v))}
                </span>
              }
              title={formatMessage(msg('field_value')(v))}
              value={v}
              style={styles.checkbox}
              iconStyle={styles.checkboxIcon}
              labelStyle={styles.checkboxLabel}
              checked={checked.indexOf(v) > -1}
              onCheck={this.handleCheck}
              disableFocusRipple
              disableTouchRipple />
            {this.state.hovered === v &&
              <OnlyButton
                onTouchTap={this.handleOnlyClick.bind(this, v)} />}
          </NestedItem>
        ))}
      />
    )
  }
}

export default injectIntl(DiscreteFilter)
