import {get,post} from "../config";

export default {
  get_post_list(data, cancelToken=null) {
    return get("v1/post/list", data, cancelToken);
  },
  get_post_detail(data) {
    return get("v1/post/detail", data);
  },
  add_encrypt_content_sign(data) {
    return post("v1/post/addEncryptContentSign", data);
  },
  get_decode_content(data) {
    return post("v1/post/getDeCodeContent", data);
  },
  // delete(data) {
  //   return post("v1/post/delete", data);
  // },
  // report(data) {
  //   return post("v1/user/report", data);
  // },
  at(data,cancelToken) {
    return get("v1/communities/At", data, cancelToken);
  },
  // share_record(data) {
  //   return post("v1/user/share", data);
  // },
};
