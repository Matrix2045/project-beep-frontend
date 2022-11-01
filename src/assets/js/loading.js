import Loading from "@/component/loading.vue";

import {createApp} from 'vue';

const plugin = {};

plugin.showLoading = function(msg) {
  const plugin = createApp(Loading, {msg});
  const instance = plugin.mount(document.createElement("div"));
  document.body.appendChild(instance.$el);
};
plugin.hideLoading = function() {
  let message_alert = document.getElementsByClassName("mvp-27s-loading-mask");
  for(let i = 0; i < message_alert.length; i ++){
    message_alert[i].className += " hide";
    if (message_alert[i]) {
      setTimeout(() => {
        message_alert[i].parentNode.removeChild(message_alert[i]);
      }, 200)
    }
  }
}

export default plugin;