import Vue from 'vue'
import {
  mapState,
  mapActions
} from 'vuex'
import VTooltip from 'v-tooltip'
import VueQrcodeReader from 'vue-qrcode-reader'

import VueRouter from 'vue-router'
import {
  RouteNames,
  Routing
} from './Routing'
import * as Actions from '../store/constants'
import {
  blockchainName,
  Blockchains
} from '../models/Blockchains'
import {
  SETTINGS_OPTIONS
} from '../models/Settings'
import ElectronHelpers from '../util/ElectronHelpers'
import {
  localized
} from '../localization/locales'
import LANG_KEYS from '../localization/keys'
import StoreService from '../services/utility/StoreService'
import AppsService from '../services/apps/AppsService'
import {
  dateId
} from '../util/DateHelpers'
import features from '../features'
import PriceService from '../services/apis/PriceService'

import Layout from '../tp/Layout/index'
import i18n from '../tp/i18n/index'
// import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import moment from 'dayjs'

const {
  remote
} = window.require('electron')
const NodeMachineId = remote ? remote.getGlobal('appShared').NodeMachineId : null;

// import * as fundebug from 'fundebug-javascript'
// import fundebugVue from 'fundebug-vue'
// fundebug.apikey =
//     '063876b2e596cab10dbb6ddb2c61376b4c6656ff7ca1b8a2479b0b6d905b8821'

// if (process.env.NODE_ENV !== 'production') {
//   fundebugVue(fundebug, Vue)
//   require('fundebug-revideo')
// }

const PKG = require('../../package.json')

Vue.config.productionTip = false

Vue.prototype.$moment = moment

export let router

/***
 * Sets up an instance of Vue.Layout
 * This is shared between the popup.js and prompt.js scripts.
 */
export default class VueInitializer {
  constructor(
    routes,
    components,
    middleware = () => {},
    routerCallback = () => {}
  ) {
    StoreService.init()

    this.setupVuePlugins()
    this.registerComponents(components)
    router = this.setupRouting(routes, middleware)

    StoreService.get()
      .dispatch(Actions.LOAD_SCATTER)
      .then(async () => {
        Vue.mixin({
          data() {
            return {
              RouteNames,
              SETTINGS_OPTIONS,
              langKeys: LANG_KEYS,
              loadingReputation: false,
              features,
              // now:0,
              clientVersion: PKG.version
            }
          },
          computed: {
            ...mapState(['working', 'priceData'])
          },
          methods: {
            blockchainName,
            blockchainPlatform(blockchainID) {
              const id = parseInt(blockchainID)
              switch (id) {
                case 1:
                  return 'ETH'
                case 2:
                  return '井通'
                case 3:
                  return '墨客'
                case 4:
                  return 'EOS'
                case 5:
                  return 'ENU'
                case 6:
                  return 'BOS'
                case 7:
                  return 'IOST'
                case 8:
                  return 'COSMOS'
                case 9:
                  return 'BINANCE'
                case 10:
                  return 'TRON'
                case 11:
                  return 'BTC'
              }
            },
            back() {
              this.$router.back()
            },
            locale: (key, args) =>
              localized(key, args, StoreService.get().getters.language),
            newKeypair() {
              this.$router.push({
                name: RouteNames.NEW_KEYPAIR
              })
            },
            canOpenApp(applink) {
              const data = AppsService.getAppData(applink)
              return data.url.length
            },
            fiatSymbol: PriceService.fiatSymbol,
            getTokensTotaled() {
              if (
                !this.priceData ||
                !this.priceData.hasOwnProperty('yesterday')
              )
                return []
              let totaled = []
              Object.keys(this.priceData.yesterday)
                .filter(x => x !== 'latest')
                .sort((a, b) => a - b)
                .map(hour =>
                  totaled.push({
                    hour,
                    data: this.priceData.yesterday[hour],
                    date: dateId(1)
                  })
                )
              Object.keys(this.priceData.today)
                .filter(x => x !== 'latest')
                .sort((a, b) => a - b)
                .map(hour =>
                  totaled.push({
                    hour,
                    data: this.priceData.today[hour],
                    date: dateId()
                  })
                )
              totaled = totaled.slice(
                totaled.length - (totaled.length > 24 ? 24 : totaled.length),
                totaled.length
              )
              return totaled
            },
            openApp(applink) {
              const data = AppsService.getAppData(applink)
              if (data.url.length) this.openInBrowser(data.url)
            },
            openInBrowser(url) {
              ElectronHelpers.openLinkInBrowser(url)
            },
            setWorkingScreen(bool) {
              StoreService.get().dispatch(Actions.SET_WORKING_SCREEN, bool)
            },
            copyText(text) {
              ElectronHelpers.copy(text)
            },
            publicKeyForKeypair(keypair) {
              if (!keypair) return null
              if (!keypair.hasOwnProperty('publicKeys')) return null
              return keypair.enabledKey().key
            },

            formatNumber(num, commaOnly = false) {
              if (!num) return 0
              num = parseFloat(num.toString())
              const toComma = x => {
                const [whole, decimal] = x.toString().split('.')
                return (
                  whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
                  (decimal ? `.${decimal}` : '').toString()
                )
              }
              if (commaOnly) return toComma(num)
              return num > 999999999 ?
                toComma((num / 1000000000).toFixed(1)) + ' B' :
                num > 999999 ?
                toComma((num / 1000000).toFixed(1)) + ' M' :
                num > 999 ?
                toComma((num / 1000).toFixed(1)) + ' K' :
                num
            },
            formatTime(milliseconds) {
              const formatTimeNumber = n => {
                if (!n) return '00'
                if (n.toString().length === 1) n = '0' + n
                if (n.toString().length === 0) n = '00'
                return n
              }

              const seconds = Math.trunc(milliseconds) % 60
              const minutes = Math.trunc(milliseconds / 60) % 60
              return `${formatTimeNumber(minutes)}:${formatTimeNumber(seconds)}`
            },

            ...mapActions([Actions.SET_QUICK_BACK])
          }
        })

        this.setupVue(router)

        routerCallback(router, StoreService.get())
      })

    return router
  }

  setupVuePlugins() {
    Vue.use(VueRouter)
    Vue.use(VTooltip, {
      defaultOffset: 5
    })
    Vue.use(VueQrcodeReader)

    Vue.use(ElementUI)

    Vue.component('Layout', Layout)
  }

  registerComponents(components) {
    components.map(component => {
      Vue.component(component.tag, component.vue)
    })
  }

  setupRouting(routes, middleware) {
    const router = new VueRouter({
      routes
    })
    router.beforeEach((to, from, next) => {
      // Google 统计
      fetch(`https://www.google-analytics.com/collect?v=1&tid=UA-153243293-1&cid=${NodeMachineId.machineIdSync()}&dp=${to.path}&z=${+ new Date().getTime()}`);
      // StoreService.get().dispatch(Actions.SET_SEARCH_TERMS, '')
      return middleware(to, next, StoreService.get())
    })
    return router
  }

  setupVue(router) {
    const app = new Vue({
      i18n,
      router,
      store: StoreService.get()
    })
    app.$mount('#scatter')

    // This removes the browser console's ability to
    // gain access to vuex store. ( for instance `scatter.__vue__.$store.state` )
    document.getElementById('scatter').removeAttribute('id')
  }
}