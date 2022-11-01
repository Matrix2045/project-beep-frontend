import { post, get } from "../config";
import store from "@/store/index.js";

export default {
  //new
  get_joined_community_list(data) {
    return get("v1/user/communities", data);
  },
  get_unjoined_community_list(data) {  
    return get("v1/user/unJoinCommunities", data);
  },
  get_community_list(data) {
    return get("v1/communities/list", data);
  },
  get_community_detail(data) {
    return get("v1/communities/detail", data);
  },
  get_member_list(data) {
    return get("v1/communities/members", data);
  },
  replacement_sequence(data) {
    return post("v1/communities/replacementSequence", data);
  },
  read_url(data) {
    return get("v1/user/getContentByHtml", data);
  },
  get_benefit_list(data) {
    return get("v1/communities/getBenefitList", data);
  },
  get_news_list(data) {
    return get("v1/communities/getNewsList", data);
  },
  set_community_basicinfo(data) {
    return post("v1/communities/update", data);
  },
  set_community_contributor(data) {
    return post("v1/communities/contributor/update", data);
  },
  set_community_benefits(data) {
    return post("v1/communities/updateBenefit", data);
  },
  set_community_news(data) {
    return post("v1/communities/updateNews", data);
  },
  verify_twitter(data) {
    return post("v1/communities/verifyTwitter", data);
  },
};
