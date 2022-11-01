import { createApp } from "vue";
import App from "./App.vue";
import store from "./store/index";
import router from "./router/index";
import axios from "./axios/index";
import Loading from "@/assets/js/loading.js";
import Message from "@/assets/js/message.js";

import { Buffer } from "buffer";
import { init } from "./utils/init";

let app = createApp(App);
app.config.warnHandler = () => null
app.config.globalProperties.$Loading = Loading;
app.config.globalProperties.$Message = Message;
app.config.globalProperties.$axios = axios;
init()
app.use(store);
app.use(router);

window.Buffer = Buffer;


app.mount("#app");
