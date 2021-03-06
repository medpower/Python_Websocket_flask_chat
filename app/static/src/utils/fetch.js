/*
 * @authors :anLA7856
 * @date    :2017-10-25
 * @description :进行真正异步传输的地方。
 */
import {API_SERVER_IP} from "src/constants/Chat";
import promise from 'es6-promise'
import fetch from 'isomorphic-fetch'
// import StaticToast from 'src/components/common/toast'
// 引入polyfill支持
promise.polyfill();

// fetchjson的方法，通过请求url的方式。
export const fetchJson = (options) => {
//options.url ="https://easy-mock.com/mock/59294d8e91470c0ac1fe8a4c/staff"+options.url;
	options.url ="http://"+API_SERVER_IP+"/api/v1.0"+options.url
	//从传入的option里面获得一些数据。
	const { url, type, data, ...others } = options;
	let opts = {
    ...others,
    method: type || 'get',
    headers: {
    	//特定头。
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  if (['POST', 'PUT'].indexOf(opts.method.toUpperCase()) >= 0) {
	  //把data转化为string传过去
    opts.body = JSON.stringify(data)
  }
	var t = opts;
	//开始拿。
  fetch(url, opts)
    .then(resData => toJson(resData, opts))
    .then(resData => resHandler(resData, opts))
    // .catch(error => errorHandler(error, opts))
}

//拿格式化的数据。
export const fetchFormData = (options) => {
  const { url, type, data, ...others } = options;
  let opts = {
    ...others,
    method: type || 'get',
    credentials: 'include',
  }

  if (['POST', 'PUT'].indexOf(opts.method.toUpperCase()) >= 0) {
    opts.body = data
  }

  fetch(url, opts)
    .then(resData => toJson(resData, opts))
    .then(resData => resHandler(resData, opts))
    // .catch(error => errorHandler(error, opts))
}

// 把穿回来的response数据，转化为json。把他变为json格式
function toJson(resp, options) {
  if (resp.status >= 400) {
    return errorHandler(null, options, resp.status)
  }
  return resp.json()
}


/**
 * 请求成功处理，请求回来的数据再处理。
 * options里面会自带success和error方法供回调。
 * @param resData
 * @param options
 * @returns
 */
function resHandler(resData, options) {
	// 出错
  if (resData.status && resData.status != 200) {
    return errorHandler(resData.error, options, resData.status);
  }

  if (!resData || resData.code > 20000) {
    options.error && options.error(resData)
    console.log(resData.message);
  } else {
    options.success && options.success(resData);
  }
}

// 异常处理
function errorHandler(error, options, status) {
  options.error && options.error(error);
  console.log(`网络异常，请稍后重试(${status})`)
}
