import profile from './api/profile';
import post from './api/post';
import comment from './api/comment';
import community from './api/community';
import drip from './api/drip';

const proxy = {
  profile,
  post,
  comment,
  community,
  drip
};

export default proxy;
