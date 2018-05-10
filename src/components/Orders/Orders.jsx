import React, { Component } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

import TableGroup from '../TableGroup/TableGroup'
import Table from '../Table/Table'
import FormTab from '../FormTab/FormTab'
import Header from '../Header/Header'

import Tables from '../../assets/Tables'
import API from '../../assets/API'

import 'react-tabs/style/react-tabs.scss'
import './Orders.scss'

class Orders extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      offers: []
    }

    this.apiGet = this.apiGet.bind(this)
    this.apiPost = this.apiPost.bind(this)
    this.getOffers = this.getOffers.bind(this)
  }

  componentDidMount() {
    this.getOffers()
  }

  getOffers() {
    this.apiGet('offers', (result) => {
      this.setState({
        offers: result.offers || []
      })
    })
  }

  apiGet(endPoint, cb = null) {
    let url = API.baseURL
    url += API.endPoints[endPoint]

    axios.get(url)
      .then(res => {
        const result = res.data
        if (cb) cb(result)
      })
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
    const { web3 } = this.context
    const { offers } = this.state
    const methods = { apiGet: this.apiGet, apiPost: this.apiPost, getOffers: this.getOffers }

    return (
      <div className="OrdersWrapper">
        <Header address={web3.selectedAccount} />
        <TableGroup data={{ left: Tables[0], right: Tables[1], classes: "first", data: { offers } }} />
        <FormTab methods={methods} address={web3.selectedAccount} />
        <TableGroup data={{ left: Tables[2], right: Tables[3] }} style={{ marginBottom: 29 }} />
        <TableGroup data={{ left: Tables[4], right: Tables[5] }} />
      </div>
    )
  }
}

Orders.contextTypes = {
  web3: PropTypes.object
};

export default Orders
