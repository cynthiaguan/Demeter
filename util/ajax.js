import fetch from 'isomorphic-fetch'
import 'rxjs';
import * as Config from "../config";
import {Observable} from "rxjs";
import {RES_FAILED, RES_SUCCEED} from "./status";

export const AJAX_METHOD = {
    GET: 'GET',
    POST: 'POST'
};

/**
 * 构建get时请求参数
 * @param obj json对象
 * @returns {*}
 */
function buildParams(obj) {
    if (!obj) {
        return ''
    }
    const params = [];
    for (const key of Object.keys(obj)) {
        const value = obj[key] === undefined ? '' : obj[key];
        params.push(`${key}=${encodeURIComponent(value)}`);
    }
    return params.join('&');
}

/**
 * 构建错误信息
 * @param code
 * @param msg
 * @returns {{status: *, msg: *}}
 */
function buildErrorInfo(code, msg) {
    return {
        status: code,
        msg: msg
    }
}

/**
 * 构建response json
 * @param status 状态 0：succeed
 * @param params 业务数据
 * @param msg status != 0时的错误信息
 */
export function buildResponse(status, params, msg) {
    return {
        status: status,
        data: params,
        msg: msg
    }
}

/**
 * 根据fetch promise对象构建出一个Observable
 * @param fetch
 * @returns {Observable<T>|*}
 */
const buildRequestObservable = fetch => {
    const request = new Promise((resolve, reject) => {
        fetch.then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    if (data.status === RES_SUCCEED) {
                        resolve(data);
                    } else {
                        reject(data)
                    }
                });
            } else {
                reject(buildErrorInfo(RES_FAILED, 'response code error'))
            }
        }).catch((e) => {
            reject(buildErrorInfo(RES_FAILED, e.toString()));
        });
    });
    return Observable.fromPromise(request);
};

/**
 * get请求, 返回Observable promise 对象
 * @param url
 * @param params
 * @returns {Observable.<T>|*}
 */
export const ajaxGet = (url, params) => {
    if (!url.endsWith('?')) {
        url += '?';
    }

    const header = {
        method: AJAX_METHOD.GET,
        headers: {
            'Authorization': `Bearer ${localStorage.token}`
        }
    };

    return buildRequestObservable(fetch(url + buildParams(params), header));
};

/**
 * post请求, 返回Observable promise 对象
 * @param url
 * @param params
 * @returns {Observable.<T>|*}
 */
export const ajaxPost = (url, params) => {
    const content = JSON.stringify(params);
    const data = {
        method: AJAX_METHOD.POST,
        headers: {
            'Authorization': `Bearer ${localStorage.token}`,
            "Content-Type": "application/json",
            "Content-Length": content.length.toString()
        },
        body: JSON.stringify(params)
    };

    return buildRequestObservable(fetch(url, data));
};

/**
 * 提供给epic事件流使用, 根据参数构建request
 * @param requestParams {actionType, method, url, params}
 */
export const ajaxRequest = requestParams => {
    const {actionType, method, url, params} = requestParams;

    let observable;
    switch (method) {
        case AJAX_METHOD.POST:
            observable = ajaxPost(url, params);
            break;
        case AJAX_METHOD.GET:
            observable = ajaxGet(url, params);
            break;
        default:
            observable = ajaxGet(url, params);
    }

    return observable.map(data => ({
        type: actionType,
        data: data
    })).catch(e => Observable.of({
        type: actionType,
        data: e
    }));
};