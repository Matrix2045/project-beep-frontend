import Message from "@/component/message.vue";

import {createApp} from 'vue';

export default function(msg) {
  //1、
  const plugin = createApp(Message, {msg});
  const instance = plugin.mount(document.createElement("div"));

  //2.Nodebody
  document.body.appendChild(instance.$el);
};