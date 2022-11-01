//import * as AWS from "aws-sdk";
import axios from "axios";
import store from "../store";
import { getAccountSign } from "./util";
import js_sha256 from 'js-sha256';
import fetch from './fetch.js'
import Hash from 'ipfs-only-hash'

export async function upload(file) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  let fileBase64 = await new Promise((resolve, reject) => {
    reader.onload = function (e) {
      resolve(e.target.result)
    };
  })

  const endOfPrefix = fileBase64.indexOf(",");
  const cleanStrData = fileBase64.slice(endOfPrefix + 1);
  const data = Buffer.from(cleanStrData, "base64");
  const cid = await Hash.of(data, {cidVersion: 1})
  
  const s3Params = {
    Body: file,
    Key: "user/" + cid,
    Bucket: "popula-frontend",
    ACL: "public-read",
  };

  const s3Location = await new Promise((resolve, reject) => {
    s3.putObject(s3Params, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(`${store.state.nearConfig.AWS_STORAGE}/${cid}`)
      }
    });
  })


  let params = {
      args: {
        hash: js_sha256.sha256(fileBase64),
        url: s3Location,
      },
      account_id: store.getters.accountId
  }
  params.sign = await getAccountSign(params.args)

  await axios.post(`${store.state.nearConfig.IPFS}/upload`, params)
  return `${store.state.nearConfig.IPFS}/ipfs/${cid}`
  
}