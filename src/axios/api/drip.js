import {get,post} from "../config";

export default {
  get_user_points(data) {
    return get("v1/drip/getUserPoints", data);
  },
  get_user_community_points_list(data) {
    return get("v1/drip/getCommunityList", data);
  },
  get_user_community_points_detail(data) {
    return get("v1/drip/getCommunityPoints", data);
  },
  get_community_points_list(data) {
    return get("v1/drip/getCommunityPointsList", data);
  },
  get_community_points_chart(data) {
    return get("v1/drip/getCommunityPointsChart", data);
  },
  get_community_member_points(data, cancelToken=null) {
    return get("v1/drip/getCommunityMemberPoints", data, cancelToken);
  },
};
