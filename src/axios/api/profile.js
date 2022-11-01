import { post, get } from "../config";
import store from "@/store/index.js";

export default {
  //new
  get_user_list(data) {
    return get("v1/user/list", data);
  },
  get_user_info(data) {
    return get("v1/user/info", data);
  },
  get_user_posts(data, cancelToken=null) {
    return get("v1/user/posts", data, cancelToken);
  },
  get_user_replies(data, cancelToken=null) {
    return get("v1/user/replies", data, cancelToken);
  },
  get_user_likes(data, cancelToken=null) {
    return get("v1/user/likes", data, cancelToken);
  },
  get_user_nfts(data) {
    return get("v1/communities/findLikelyNFTs", data);
  },
  get_user_followers(data) {
    return get("v1/follow/followingList", data);
  },
  get_user_following(data) {
    return get("v1/follow/list", data);
  },
  set_user_info(data) {
    return post("v1/user/updateInfo", data);
  },
  verify_twitter(data) {
    return post("v1/user/verifyTwitter", data);
  },
  get_user_notifications(data) {
    return get("v1/user/getNotifications", data);
  },
  get_user_new_notifications(data) {
    return get("v1/user/getNotificationsNewestCount", data);
  },
  get_twitter_auth_url() {
    return post("v1/user/getTwitterAuthUrl", {})
  },
};
