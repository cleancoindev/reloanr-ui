import React, { Component } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import FadeIn from 'react-fade-in'

import FormInput from '../FormInput/FormInput'
import { FormInputs, FeeFormInputs, WrapETHFormInputs, AllowanceFormInputs } from './Forms'

import './FormTab.scss'
import './ReactTab.scss'

class FormTab extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // Lend/Borrow Form Inputs
      loanAmountOffered: 1.0,
      interestRatePerDay: 0.008,
      loanDuration: 60 * 3600,
      offerExpiry: 720,
      wrangler: 'Lendroid',
      allowance: 0,

      // Fee Form Inputs
      relayerFeeLST: 0.0,
      monitoringFeeLST: 0.0,
      rolloverFeeLST: 0.0,
      closureFeeLST: 0.0,

      // Wrap/Unwrap ETH Form Inputs
      ETHBalance: 0,
      wETHBalance: 0,
      operation: 'Wrap',
      amount: 0.0500,
      WETHContractInstance: null,

      // Allowance Form Inputs
      token: 'WETH',
      tokenBalance: 0,
      tokenAllowance: 0,
      newAllowance: 10.0,
      tokenContractInstance: null,

      tabIndex: 0,
      showFeeForm: true,
    }

    this.onChange = this.onChange.bind(this)
    this.renderInputs = this.renderInputs.bind(this)
    this.renderFeeForm = this.renderFeeForm.bind(this)
    this.onWrapETH = this.onWrapETH.bind(this)
    this.onAllowance = this.onAllowance.bind(this)
  }

  getTokenName(token) {
    return token.substr(0, 1).toUpperCase() + token.substr(1).toLowerCase()
  }

  onChange(key, value, affection = null) {
    const formData = this.state
    formData[key] = value
    this.setState(formData)
  }

  onChangeSync(item) {
    return (e) => {
      this.setState({ [item.key]: e.target.value })
    }
  }

  isValid(isLend = true) {
    const { contracts, currentDAIExchangeRate } = this.props
    const formData = this.state
    contracts.loanAmountOffered = formData.loanAmountOffered

    let valid = true
    FormInputs(isLend).forEach(item => {
      if (item.required && Number(formData[item.key]) === 0) {
        valid = false
      } else if (item.validation) {
        if (!item.validation(contracts, currentDAIExchangeRate)) valid = false
      }
    })
    return valid
  }

  isValidForm(form) {
    const formData = this.state
    let valid = true
    form.forEach(item => {
      if (item.required && Number(formData[item.key]) === 0) valid = false
    })
    return valid
  }

  randHex(len = 40) {
    const maxlen = 8
    const min = Math.pow(16, Math.min(len, maxlen) - 1)
    const max = Math.pow(16, Math.min(len, maxlen)) - 1
    const n = Math.floor(Math.random() * (max - min + 1)) + min
    let r = n.toString(16)
    while (r.length < len) {
      r = r + this.randHex(len - maxlen)
    }
    return r
  }

  onSubmit(isLend) {
    return () => {
      const formData = this.state
      const { address, methods, contracts, web3Utils } = this.props
      const postData = {}

      FormInputs(isLend).forEach(item => {
        postData[item.key] = item.output ? item.output(formData[item.key]) : formData[item.key]
      })
      FeeFormInputs.forEach(item => {
        postData[item.key] = item.output ? item.output(formData[item.key]) : formData[item.key]
      })
      postData.wrangler = '0x0f02a30cA336EC791Ac8Cb40816e4Fc5aeB57E38'
      postData.lender = isLend ? address : ''
      postData.borrower = !isLend ? address : ''

      postData.creatorSalt = '0x' + this.randHex(40)
      postData.collateralToken = contracts.contracts ? contracts.contracts.WETH._address : ''
      postData.loanToken = contracts.contracts ? contracts.contracts.DAI._address : ''
      postData.relayer = ''
      postData.collateralAmount = web3Utils.toWei(0)

      delete postData.allowance
      postData.offerExpiry = parseInt(postData.offerExpiry / 1000).toString();

      methods.onCreateOrder(postData)
    }
  }

  onWrapETH() {
    const { methods } = this.props
    const { amount, operation } = this.state
    methods.onWrapETH(amount, operation === 'Wrap')
  }

  onAllowance() {
    const { methods } = this.props
    const { newAllowance, token } = this.state
    methods.onAllowance(token, newAllowance)
  }

  onTabChange(tabIndex) {
    this.setState({ tabIndex })

    switch (tabIndex) {
      case 0: // Lend Form
        break
      case 1: // Borrow Form
        break
      case 2: // Wrap/Unwrap Form
        break
      case 3: // Allowance Form
        break
      default:
        break
    }
  }

  renderInputs(formInputs) {
    const { contracts, loading } = this.props
    const formData = this.state
    contracts.token = formData.token

    return formInputs.map(item => (
      <td style={item.style}>
        {
          item.key === "operation" ? <div className="FormInputWrapper">
            <div className="InputLabel">{item.label}</div>
            <select value={formData.operation} onChange={this.onChangeSync(item)}>
              <option disabled>Select Operation</option>
              <option>Wrap</option>
              <option>Unwrap</option>
            </select>
          </div>
            :
            item.key === "token" ? <div className="FormInputWrapper">
              <div className="InputLabel">{item.label}</div>
              <select value={formData.token} onChange={this.onChangeSync(item)}>
                <option disabled>Select Token</option>
                <option>WETH</option>
                <option>DAI</option>
                <option>LST</option>
              </select>
            </div>
              :
              <FormInput
                data={item}
                onChange={this.onChange.bind(this)}
                val={item.value ? (item.value(contracts)) : formData[item.key]}
                loading={item.loading ? loading[item.loading] : false}
              />
        }
      </td>
    ))
  }

  renderFeeForm(showFeeForm) {
    return <table cellspacing="15" className={`FeeForm ${showFeeForm ? 'Show' : 'Hide'}`}>
      <tbody>
        <tr>
          {this.renderInputs(FeeFormInputs)}
          <td colspan="2" className="Empty"></td>
        </tr>
      </tbody>
    </table>
  }

  renderWrangler() {
    return <div className="Wrangler">
      <div className="Label">Wrangler</div>
      <select>
        <option disabled>Wrangler Name</option>
        <option default>Default Simple Wrangler</option>
      </select>
    </div>
  }

  renderButton(title, valid, onClick) {
    return <td className="ButtonWrapper">
      <div className={`FormInput Button ${valid ? '' : 'Disabled'}`} onClick={onClick}>
        <div className="left" /> {title}
      </div>
    </td>
  }

  render() {
    const { showFeeForm } = this.state

    return (
      <div className="TabWrapper">
        <div className="Title">WHAT ARE YOU UP TO TODAY?</div>
        <Tabs selectedIndex={this.state.tabIndex} onSelect={this.onTabChange.bind(this)}>
          <TabList>
            <Tab>Lend</Tab>
            <Tab>Borrow</Tab>
            <Tab>Wrap/Unwrap ETH</Tab>
            <Tab>Allowance</Tab>
          </TabList>

          <TabPanel>
            <FadeIn>
              {this.renderWrangler()}
              <table cellspacing="15">
                <tbody>
                  <tr>
                    {this.renderInputs(FormInputs(true))}
                    {this.renderButton('Order', this.isValid(true), this.onSubmit(true))}
                  </tr>
                </tbody>
              </table>
              <div
                className="HandleFeeForm"
                onClick={e => this.setState({ showFeeForm: !showFeeForm })}>
                {`${showFeeForm ? 'Hide' : 'Show'} Fee Form`}</div>
              {this.renderFeeForm(showFeeForm)}
            </FadeIn>
          </TabPanel>
          <TabPanel>
            <FadeIn>
              {this.renderWrangler()}
              <table cellspacing="15">
                <tbody>
                  <tr>
                    {this.renderInputs(FormInputs(false))}
                    {this.renderButton('Order', this.isValid(false), this.onSubmit(false))}
                  </tr>
                </tbody>
              </table>
              <div
                className="HandleFeeForm"
                onClick={e => this.setState({ showFeeForm: !showFeeForm })}>
                {`${showFeeForm ? 'Hide' : 'Show'} Fee Form`}</div>
              {this.renderFeeForm(showFeeForm)}
            </FadeIn>
          </TabPanel>
          <TabPanel>
            <FadeIn>
              <table cellspacing="15" className="WrapETHTable">
                <tbody>
                  <tr>
                    {this.renderInputs(WrapETHFormInputs)}
                    {this.renderButton('Submit', this.isValidForm(WrapETHFormInputs), this.onWrapETH)}
                  </tr>
                </tbody>
              </table>
            </FadeIn>
          </TabPanel>
          <TabPanel>
            <FadeIn>
              <table cellspacing="15" className="AllowanceTable">
                <tbody>
                  <tr>
                    {this.renderInputs(AllowanceFormInputs)}
                    {this.renderButton('Submit', this.isValidForm(AllowanceFormInputs), this.onAllowance)}
                  </tr>
                </tbody>
              </table>
            </FadeIn>
          </TabPanel>
        </Tabs >
      </div >
    )
  }
}

export default FormTab
