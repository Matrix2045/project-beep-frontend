/*

*/

const theme = {
  // 
  light() {
    document.body.style.setProperty("--bak-color", "#fff");
    document.body.style.setProperty("--lgt-color", "#101217");
    document.body.style.setProperty("--bak-shall-color", "#f0f0f0");
  },
  // 
  black() {
    document.body.style.setProperty("--bak-color", "#101217");
    document.body.style.setProperty("--lgt-color", "#fff");
    document.body.style.setProperty("--bak-shall-color", "#262b34");
  },
};

export default theme;
