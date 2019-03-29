module.exports = {
  proxyList:{
    '/xvod':{
      target: 'https://testxvod.api.my7v.com',
      changeOrigin:true
    },
  },
  port:8008,
  basePath:'./src', // html js css 所在目录的上级目录
}