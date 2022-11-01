import {get,post} from "../config";

export default {
  //new
  get_comment_list(data) {
    return get("v1/comment/list", data);
  },
  get_child_comment_list(data) {
    return get("v1/comment/second/list", data);
  },
  get_comment_tree(data) {
    return get("v1/comment/listTree", data);
  },
  get_comment_detail(data) {
    return get("v1/comment/share/getDetail", data);
  },
  // delete(data) {
  //   return post("v1/comment/delete", data);
  // },
};
