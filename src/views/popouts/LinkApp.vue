<template>
  <section class="popout-window">
    <PopOutApp :app="popup.data.props.appData" />

    <section class="fixed-actions">
      {{$t('TP.NOTOFICATION.POPOUT.LINKAPP.Notices')}}
      <br />
      <br />

      <section class="actions">
        <!-- DENY TRANSACTION -->
        <Button :text="$t('TP.GENERIC.Deny')" @click.native="returnResult(false)" />

        <!-- ACCEPT TRANSACTION -->
        <Button blue="1" :text="$t('TP.GENERIC.Allow')" @click.native="returnResult(true)" />
      </section>
    </section>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import * as Actions from "../../store/constants";
import AuthorizedApp from "../../models/AuthorizedApp";
import PopOutApp from "../../components/popouts/PopOutApp";

export default {
  components: {
    PopOutApp
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(["state"]),
    ...mapGetters(["identities", "accounts"]),
    payload() {
      return this.popup.payload();
    },
    app() {
      return AuthorizedApp.fromJson(this.payload);
    }
  },
  mounted() {},
  methods: {
    returnResult(result) {
      this.$emit("returned", result);
    }
  },
  props: ["popup"]
};
</script>

<style scoped lang="scss" rel="stylesheet/scss">
@import "../../styles/variables";

.app-details {
  padding: 50px;
}

.main-panel {
  text-align: center;
}

.fixed-actions {
  .actions {
    display: flex;
    justify-content: space-between;
  }
}
</style>
