<template>
  <section class="menu-bar">
    <section class="actions" v-if="!isMacOS">
      <!-- MINIMIZE -->
      <section class="action" @click="minimize">
        <section class="action-inner">
          <figure class="line"></figure>
        </section>
      </section>

      <!-- EXPAND / CONTRACT -->
      <section class="action" @click="maximize">
        <section class="action-inner">
          <figure class="sqr"></figure>
        </section>
      </section>

      <!-- QUIT -->
      <section class="action" @click="quit">
        <section class="action-inner">
          <figure class="x1"></figure>
          <figure class="x2"></figure>
        </section>
      </section>
    </section>
  </section>
</template>

<script>
import { remote } from "../util/ElectronHelpers";
import SocketService from "../services/utility/SocketService";

const ipc = window.require("electron").ipcRenderer;

export default {
  data() {
    return {
      loaded: false
    };
  },
  mounted() {
    setTimeout(() => {
      this.loaded = true;
    }, 500);
  },
  methods: {
    quit() {
      if (this.$route.name === "WebView") {
        ipc.send("CLOSE_WEBVIEW");
      } else {
        SocketService.broadcastEvent("dced", {});
        setTimeout(() => remote.app.quit(), 1);
      }
    },
    minimize() {
      remote.BrowserWindow.getFocusedWindow().hide();
    },
    maximize() {
      const win = remote.BrowserWindow.getFocusedWindow();
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  },
  computed: {
    isWindows() {
      return remote.process.platform === "win32";
    },
    isMacOS() {
      return remote.process.platform === "darwin";
    },
    isLinux() {
      return !this.isWindows && !this.isMacOS;
    }
  }
};
</script>

<style scoped lang="scss" rel="stylesheet/scss">
@import "../styles/variables";

.menu-bar {
  -webkit-app-region: drag;
  -webkit-user-select: none !important;
  //background: $blue;
  color: #fff;
  height: $menuheight;
  line-height: $menuheight;
  width: 100%;
  text-align: center;
  z-index: 9999999999;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgb(240, 240, 240);
  /*border-bottom: 1px solid #e5e5e5;*/
  //border-top:1px solid $darkerblue;
  //border-left:1px solid $darkerblue;
  //border-right:1px solid $darkerblue;

  .actions {
    -webkit-app-region: drag;
    -webkit-user-select: none !important;
    position: absolute;
    right: 0;
    top: 0;
    height: $menuheight;
    line-height: $menuheight;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 20px;

    $action: 10px;

    .action {
      -webkit-app-region: no-drag;
      float: right;
      padding: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .action-inner {
        width: $action;
        height: $action;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      &:not(:first-child) {
        margin-left: 5px;
      }

      .x1,
      .x2 {
        width: 12px;
        height: 2px;
        background: #3a3b3d;
        transform-origin: center center;
      }

      .x1 {
        transform: rotateZ(45deg);
      }

      .x2 {
        transform: rotateZ(-45deg);
        margin-top: -2px;
      }

      .sqr {
        height: $action;
        width: $action;
        border: 2px solid #3a3b3d;
        border-radius: 2px;
      }

      .line {
        height: 2px;
        width: $action;
        background: #3a3b3d;
      }
    }
  }
}
</style>
