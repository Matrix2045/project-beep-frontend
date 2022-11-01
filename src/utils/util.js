import * as bs58 from 'bs58'
import * as nacl from 'tweetnacl'
import js_sha256 from 'js-sha256';
import BN from 'bn.js';
import api from '@/axios/index.js';
import MainContract from "@/contract/MainContract";
import { getMetadata,getBalanceOf} from "@/contract/TokenContract.js";
import store from "@/store/index.js"
import { popularToken } from '@/utils/tokenData.js';

export function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = decodeURI(window.location.search.substr(1)).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

export function getParam(name,url) {
  const query = url.split("?")[1];
  if(query){
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=");
      if(pair[0] == name){return pair[1];}
    }
  }
  return null;
}

export function convertNanoToMilli(number) {
  let str = String(number)
  return Number(str.substring(0, str.length - 6))
}

export function convertMilliToNano(number) {
  return String(number) + "000000"
}

export function roundAmount(amount) {
  let length = amount.length
  return (Number(amount.charAt(0))+1)+new Array(length - 1).fill('0').join("");
}

export function makeList(list1, list2) {
  let arr = list1.concat(list2)
  let res = arr.filter((x, index, self) => {
    let arrs = [];
    arr.forEach((item, i) => {
        arrs.push(item);
    });
    return arrs.indexOf(x) === index;
  });
  return res
}

export function getGas(gas) {
  return gas ? new BN(gas) : new BN('300000000000000');
}

export function getDeposit(amount) {
  return amount ? new BN(amount) : new BN('0');
}

export function generatePhrase(entrophy) { 

  let hash = js_sha256.sha256(entrophy)  
  // return generateSeedPhrase(hash)
  var arr = [];
  for (var i = 0, j = 32; i < j; ++i) {
      arr.push(hash.charCodeAt(i));
  }
  var tmpUint8Array = new Uint8Array(arr);
  const keyPair = nacl.sign.keyPair.fromSeed(tmpUint8Array)
  const publicKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.publicKey))
  const secretKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.secretKey))
  return { secretKey, publicKey }

}

export function checkReceiptsSuccess(result,onlyCheckOneReceipt=null) {
  if (result && !result.receipts_outcome) {
    return false
  }

  if(onlyCheckOneReceipt){
    let index = result.receipts_outcome.findIndex(item => item.outcome.status.SuccessValue)
    return index != -1
  }else{
    let index = result.receipts_outcome.findIndex(item => item.outcome.status.Failure)
    return index == -1
  }
}

export function getErrorInfo(result) {
  if (result && !result.receipts_outcome) {
    return "empty"
  }
  console.log(result.status.Failure.ActionError)
  if (result.status.Failure && result.status.Failure.ActionError.kind.LackBalanceForState) {
    return "lack_of_balance"
  }
}

export function getTxArgs(result, method_name) {
  let index = result.transaction.actions.findIndex(action => action.FunctionCall.method_name == method_name)
  if (index == -1) {
    return {}
  }
  let args_string = result.transaction.actions[index].FunctionCall.args
  let args = JSON.parse(new Buffer(args_string, 'base64').toString())
  return args
}

function trimLeadingZeroes(value) {
  value = value.replace(/^0+/, '');
  if (value === '') {
      return '0';
  }
  return value;
}

function trimTrailingZeroes(value) {
  return value.replace(/\.?0*$/, '');
}

function formatWithCommas(value) {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
      value = value.replace(pattern, '$1,$2');
  }
  return value;
}

export function parseAmount(amt, decimals=24) {
  if (!amt) {
      return null;
  }
  amt = String(amt).replace(/,/g, '').trim();
  const split = amt.split('.');
  const wholePart = split[0];
  const fracPart = split[1] || '';
  if (split.length > 2 || fracPart.length > decimals) {
      throw new Error(`Cannot parse '${amt}'`);
  }
  return trimLeadingZeroes(wholePart + fracPart.padEnd(decimals, '0'));
  
}

export function formatAmount(balance, decimals=24, fracDigits=2) {
  const wholeStr = balance.substring(0, balance.length - decimals) || '0';
  const fractionStr = balance.substring(balance.length - decimals)
      .padStart(decimals, '0').substring(0, fracDigits);
  return trimTrailingZeroes(`${formatWithCommas(wholeStr)}.${fractionStr}`);
}

export function dateFormat(fmt, time) {
  const date = new Date(parseInt(time));
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(), // 
    "m+": (date.getMonth() + 1).toString(), // 
    "d+": date.getDate().toString(), // 
    "H+": date.getHours().toString(), // 
    "M+": date.getMinutes().toString(), // 
    "S+": date.getSeconds().toString(), // 
    // ，
  };
 
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
};

export async function  checkCondition(access){
  // console.log(access);
  const relationship = access.relationship;
  const accessList = [];
  let is_access = relationship=="Or" ? false : true;
  for(let i =0;i<access.conditions.length;i++){
    const condition = access['conditions'][i]['FTCondition'];
    const {token_id,amount_to_access} = condition;
    let balance = "";
    if(token_id!='near'){
      const metadata = await getMetadata(token_id);
      if(store.getters.isLogin){
        balance = new BN(await getBalanceOf(token_id,store.getters.accountId));
        condition['balance'] = formatAmount(String(balance),metadata.decimals);
      }else{
        condition['balance'] = '--'
      }
      condition['icon'] = metadata.icon
      condition['symbol'] = metadata.symbol
      condition['amount_to_access'] = formatAmount(condition['amount_to_access'],metadata.decimals);
    }else{ //near
      if(store.getters.isLogin){
        const wallet = await store.state.account.getAccountBalance();
        balance = new BN(wallet.total);
        condition['balance'] = formatAmount(String(balance),24);
      }else{
        condition['balance'] = '--'
      }
      condition['icon'] = popularToken[0]['icon']
      condition['symbol'] = popularToken[0]['symbol']
      condition['amount_to_access'] = formatAmount(condition['amount_to_access'],24);
    }
    if(store.getters.isLogin && balance.cmp(new BN(amount_to_access)) != -1) {
      accessList.push(true);
      condition['access'] = true;
    }else{
      accessList.push(false);
      condition['access'] = false;
    }
  }

  for(let k = 0;k<accessList.length;k++) {
    const item = accessList[k];
    if(relationship=="Or" && item){
      is_access = true;
      break;
    }else if(relationship=="And" && !item){
      is_access = false;
      break;
    }
  }

  return {
    access,
    is_access
  };
}

// export async function decryptPost(receipt_ids) {
//   const mainContract = new MainContract(store.state.account);
//   const signInfo = await api.post.sign_posts({receipt_ids})
//   const result = await mainContract.decryptPosts({
//     encrypt_info: [{receipt_id: signInfo.data.encrypt_info[0].receipt_id, encrypt_string: signInfo.data.encrypt_info[0].encrypt_string}],
//     sign: signInfo.data.sign
//   });
//   return result;
// }


//  sign
export async function getAccountSign(args) {
  
  const account = store.state.account
  if (!store.getters.isLogin) {  return '';}
  const keyPair = await account.connection.signer.keyStore.getKey(store.state.nearConfig.networkId, account.accountId);
  
  const argsJson = JSON.stringify(args)
  const dataBuffer = Buffer.from(argsJson);
  const { signature } = keyPair.sign(dataBuffer);
  // encode 
  const sign = bs58.encode(signature);
  return sign;
}


export function parseObj(obj) {
  let str = "{"
  for (let key in obj) {
    if (key) {
      let value = JSON.stringify(obj[key])
      str += `${key}: ${value},`
    }
  }
  str += "}"
  return str
}


export function getTimer(timestamp){
  var second = 1000;
  var minute = second * 60;
  var hour = minute *60;
  var day = hour *24;
  var week = day * 7;
  var month = day * 30;
  var year = day * 365;
  
  var now = new Date().getTime();
  var time = now - timestamp;

  let myDate=new Date(timestamp);
  const utcArr = myDate.toUTCString().split(" ");
  const d = utcArr.slice(2,3) + " " + utcArr.slice(1,2) + ", " + utcArr.slice(3,4);  //Mar 5,2022 

  const Y = myDate.getFullYear();
  const M = (myDate.getMonth()+1 < 10 ? '0'+(myDate.getMonth()+1) : myDate.getMonth()+1);
  const D = myDate.getDate();
  const h = myDate.getHours();
  const m = myDate.getMinutes();
  const s = myDate.getSeconds();
  const hoverTime = `${D < 10 ? '0'+D : D}“${M}:${Y} ${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s< 10 ? '0'+s : s}`;
  // const t = myDate.toLocaleTimeString().split(":").slice(0,-1).join(":")  + myDate.toLocaleTimeString().split(" ").slice(1) //4:19PM

  var result = "";
  if(time/week >= 1){
    result = d;
  }else if(time/day >= 1){
    result = parseInt(time/day) + " day.ago";
  }else if(time/hour >= 1){
    result = parseInt(time/hour) + " hr.ago";
  }else if(time/minute >= 1){
    result = parseInt(time/minute) + " min.ago";
  }else {
    result = parseInt(time/second) + " s.ago";
  }
  return {
    time:`${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s< 10 ? '0'+s : s},  ${d}`,
    showTime:result,
    hoverTime:hoverTime//utcArr.slice(1,2) + ' ' + utcArr.slice(2,3) + ' ' + utcArr.slice(3,4)//d + " at " + t
  };
}

export function formatCount(count){
  if(count<10000){
    return count;
  }else if(count<1000000){
    return Math.floor(count/100)/10 + 'k'
  }else{
    return Math.floor(count/100000)/10 + 'm'
  }
}

export function numFormat(num,isRankNumber=false){
  if(!num){return '-'}
  num = num.toFixed(2) * 100 / 100;
  if(!num){return '-'}
  if(!isRankNumber){
    num=num/10000;
  }
  num=num.toString().split("."); 
  var arr=num[0].split("").reverse();  
  var res=[];
  for(var i=0,len=arr.length;i<len;i++){
    if(i%3===0&&i!==0){
       res.push(",");   
    }
    res.push(arr[i]);
  }
  res.reverse(); 
  if(num[1]){  
    res=res.join("").concat("."+num[1]);
  }else{
    res=res.join("");
  }
  
  return res;
}

export async function setShareInfo(shareInfoCode) {
  if (!shareInfoCode) {
    shareInfoCode = localStorage.getItem("shareInfo")
    if (!shareInfoCode) {
      return
    }
  }
  const shareInfo = JSON.parse(bs58.decode(shareInfoCode).toString())
  const args = shareInfo['args'];
  if(args && args.inviter_id && args.inviter_id != store.getters.accountId){
    if (store.getters.accountId){
      const check_params = {
        ...args,
        account_id:store.getters.accountId
      }
      const recorded = await store.state.viewAccount.viewFunction(args.contract_id, "check_viewed", check_params); 
      if(!recorded){
        localStorage.setItem("shareInfo", shareInfoCode);
      } else {
        localStorage.removeItem("shareInfo")
      }
    }else{
      localStorage.setItem("shareInfo", shareInfoCode);
    }
  }
  return shareInfo
}

export function getShareInfo() {
  const shareInfoCode = localStorage.getItem("shareInfo")
  if (shareInfoCode) {
    return JSON.parse(bs58.decode(shareInfoCode).toString())
  }
}