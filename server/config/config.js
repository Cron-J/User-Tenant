module.exports = {
    server: {
        
            host: '127.0.0.1',
            port: 8001
    },
    database: {
        url: 'mongodb://127.0.0.1/User-Tenant'
    },
    key: {
        privateKey: '37LvDSm4XvjYOh9Y',
        tokenExpiry: 1 * 30 * 1000 * 60 //1 hour
    },
    email: {
        username: "anusha@cronj.com",
        password: "cronjpwd",
        accountName: "jCatalog",
        verifyEmailUrl: "verifyMail"
    },
    url: "http://localhost:8001/#/"
};
