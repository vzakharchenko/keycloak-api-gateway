const fetch = require('axios');

export async function fetchData(url:string, method = 'GET', headers:any) {
  const ret = await fetch({
    url,
    method,
    headers,
    transformResponse: (req:any) => req,
    withCredentials: true,
    timeout: 29000,
  });
  return ret.data;
}

export async function sendData(url:string, method = 'POST', data:string, headers:any) {
  const ret = await fetch({
    url,
    method,
    data,
    transformResponse: (req:any) => req,
    headers,
    withCredentials: true,
    timeout: 29000,
  });
  return ret.data;
}

