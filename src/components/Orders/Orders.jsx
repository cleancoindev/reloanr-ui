import React, { Component } from 'react'
import axios from 'axios'

import { Lendroid } from 'lendroid'

import TableGroup from '../TableGroup/TableGroup'
import ListGroup from '../ListGroup/ListGroup'
import FormTab from '../FormTab/FormTab'
import Header from '../Header/Header'

import CreateTables from '../../assets/Tables'
import API from '../../assets/API'

import 'react-tabs/style/react-tabs.scss'
import './Orders.scss'

class Orders extends Component {
  constructor(props) {
    super(props)

    const LendroidJS = new Lendroid({
      stateCallback: () => this.forceUpdate(),
      apiEndpoint: 'http://192.168.1.117:8080',
      apiLoanRequests: 'http://192.168.1.117:5080',
    })
    this.state = {
      LendroidJS,
      Tables: CreateTables(LendroidJS.web3Utils),
    }

    this.apiPost = this.apiPost.bind(this)
  }

  getPositionsData() {
    const { LendroidJS } = this.state
    const { contracts: { positions }, exchangeRates: { currentDAIExchangeRate } } = LendroidJS
    if (!positions || currentDAIExchangeRate === 0) return {}

    const positionsData = {
      lent: positions.lent.map(position => {
        const currentCollateralAmount = position.origin.loanAmountBorrowed / currentDAIExchangeRate
        const health = parseInt(position.origin.collateralAmount / currentCollateralAmount * 100, 10)
        return Object.assign({
          health: Math.min(health, 100)
        }, position)
      }),
      borrowed: positions.borrowed.map(position => {
        const currentCollateralAmount = position.origin.loanAmountBorrowed / currentDAIExchangeRate
        const health = parseInt(position.origin.collateralAmount / currentCollateralAmount * 100, 10)
        return Object.assign({
          health: Math.min(health, 100)
        }, position)
      }),
    }
    return positionsData
  }

  apiPost(endPoint, data, cb = null) {
    let url = API.baseURL
    url += API.endPoints[endPoint]

    axios.post(url, data)
      .then(res => {
        const result = res.data
        if (cb) cb(result)
      })
  }

  render() {
    const { LendroidJS, Tables } = this.state
    const { loading, orders, exchangeRates, contracts, web3Utils, metamask = {} } = LendroidJS
    const { address, network } = metamask
    const { currentWETHExchangeRate, currentDAIExchangeRate } = exchangeRates
    const offers = orders.orders
    const myLendOffers = orders.myOrders.lend
    const myBorrowOffers = orders.myOrders.borrow
    const positions = this.getPositionsData()
    const methods = {
      onCreateOrder: LendroidJS.onCreateOrder,
      onWrapETH: LendroidJS.onWrapETH,
      onAllowance: LendroidJS.onAllowance,
      getOffers: LendroidJS.fetchOrders,
      getPositions: LendroidJS.fetchLoanPositions,
      onPostLoans: LendroidJS.onPostLoans,
      onFillLoan: LendroidJS.onFillLoan,
      onClosePosition: LendroidJS.onClosePosition,
      onCleanContract: LendroidJS.onCleanContract,
      onTopUpPosition: LendroidJS.onTopUpPosition,
      onLiquidatePosition: LendroidJS.onLiquidatePosition,
      onFillOrderServer: LendroidJS.onFillOrderServer,
      onDeleteOrder: LendroidJS.onDeleteOrder,
      onCancelOrder: LendroidJS.onCancelOrder,
    }

    return (
      network && address ?
        <div className="OrdersWrapper">
          <Header
            address={address} contracts={contracts}
          />
          <FormTab methods={methods}
            address={address} contracts={contracts}
            currentDAIExchangeRate={currentDAIExchangeRate}
            web3Utils={web3Utils}
            loading={loading} />
          <TableGroup methods={methods}
            address={address}
            data={{ left: Tables[0], right: Tables[1], classes: "first", data: { offers } }}
            web3Utils={web3Utils}
            loading={loading.orders} />
          <ListGroup methods={methods}
            address={address} contracts={contracts}
            currentWETHExchangeRate={currentWETHExchangeRate} data={{ left: Tables[2], right: Tables[3], data: { myLendOffers, myBorrowOffers } }}
            web3Utils={web3Utils}
            loading={loading.orders}
            style={{ marginBottom: 29 }} />
          <ListGroup methods={methods}
            address={address} contracts={contracts}
            currentWETHExchangeRate={currentWETHExchangeRate} data={{ left: Tables[4], right: Tables[5], data: positions, classes: 'Positions' }}
            web3Utils={web3Utils}
            loading={loading.positions} />
        </div>
        :
        <div>No Metamask Detected</div>
    )
  }
}

export default Orders
