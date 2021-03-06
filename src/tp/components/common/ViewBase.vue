<template>
    <section class="view-base">

        <Popups/>

        <section v-if="isPopout">
            <router-view></router-view>
        </section>

        <section v-else>
         
            <MenuBar/>

            <section class="app-content" :class="{'column': onboarded && unlocked && !isViewBase}">
                <Sidebar v-if="onboarded && unlocked && isViewBase"/>

                <section class="view-pane">
<!--                    <QuickActions v-if="showQuickActions" />-->
                    <router-view class="router-view"></router-view>
                </section>

                <Rollback v-if="onboarded && unlocked && !isViewBase"/>

                <Processes/>
            </section>
        </section>

        <section class="working-screen" v-if="workingScreen">
            <figure class="spinner icon-spin4 animate-spin"></figure>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex';
    import * as Actions from '../../../store/constants';
    import { RouteNames, Routing } from '../../../vue/Routing';

    import Rollback from './Rollback';

    import Processes from '../../../components/Processes';
    import Popups from '../../../components/Popups';
    import Sidebar from '../../components/common/Sidebar';
    import QuickActions from '../../../components/QuickActions';
    import MenuBar from '../../../components/MenuBar';
    import SingletonService from '../../../services/utility/SingletonService';

    export default {
        components: {
            Rollback,
            Popups,
            Processes,
            Sidebar,
            QuickActions,
            MenuBar
        },
        data() {
            return {
                routeNames: RouteNames,
                initialized: false,
            };
        },
        computed: {
            ...mapState([
                'scatter',
                'workingScreen',
                'processes'
            ]),
            ...mapGetters([
                'unlocked',
            ]),

            onboarded() {
                return this.unlocked && this.scatter.onboarded && this.route !== RouteNames.LOGIN && this.route !== RouteNames.WEB_VIEW;
            },

            isPopout() {
                return this.$route.name === 'popout';
            },

            route() {
                return this.$route.name;
            },

            showQuickActions() {
                if (!this.onboarded) return false;
                return ![
                    RouteNames.ITEMS,
                    RouteNames.NETWORKS,
                    RouteNames.CONTACTS,
                    RouteNames.HISTORIES,
                    RouteNames.RIDL,
                    RouteNames.SETTINGS,
                    RouteNames.PURCHASE,
                    RouteNames.IDENTITIES,
                    RouteNames.LOCATIONS,
                ].includes(this.$route.name);
            },

            isViewBase() {
                if (this.$route.name === RouteNames.LOGIN) return true;

                return [
                    RouteNames.DAPP,
                    RouteNames.CHAT,
                    RouteNames.ASSET,
                    RouteNames.WALLET,
                    RouteNames.WALLETS,
                    RouteNames.SETTINGS,
                    RouteNames.LOGIN,
                ].includes(this.$route.name);
            }
        },
        mounted() {

        },
        methods: {
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch: {
            ['unlocked']() {
                if (this.$route.fullPath.indexOf('popout') > -1) return;
                if (this.initialized) return;
                if (this.unlocked) {
                    this.initialized = true;
                    SingletonService.init();
                }
            }
        }
    };
</script>

<style lang="scss" rel="stylesheet/scss">
    @import '../../../styles/variables';

    .working-screen {
        background: rgba(255, 255, 255, 0.93);
        position: fixed;
        top: 40px;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .spinner {
            font-size: 36px;
            color: $blue;
        }
    }

    .app-content {
        height: $fullheight;
        width: 100%;
        display: flex;
        background: $white;
        margin-top: 40px;
        box-shadow: inset 0 0 0 1px $lightgrey;
        position: relative;

        &.column {
            flex-direction: column;
        }
    }

    .view-base {
        min-height: 100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .view-pane {
        flex: 1;
        position: relative;
        overflow-y: auto;
    }

    .floated {
        flex: 1;
    }


</style>
