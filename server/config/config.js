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
    url: "http://localhost:8001/#/",
    activities: [{aId:0, name:'createUser'}, 
                 {aId:1, name:'searchUser'}, 
                 {aId:2, name:'getUser'},
                 {aId:3, name:'updateUser'}, 
                 {aId:4, name:'activateUser'}, 
                 {aId:5, name:'deactivateUser'},
                 {aId:6, name:'deleteUser'}, 
                 {aId:7, name:'exportUsers'}, 
                 {aId:8, name:'createTenant'},
                 {aId:9, name:'searchTenant'}, 
                 {aId:10, name:'getTenant'},
                 {aId:11, name:'updateTenant'}, 
                 {aId:12, name:'deleteTenant'},
                 {aId:13, name:'searchTenantUsers'},
                 {aId:14, name:'getTenantUsers'},
                 {aId:15, name:'exportTenant'}],
    roles: [{id:0, label:'Admin', permissions:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}, 
            {id:1, label:'Tenant Admin', permissions:[0, 1, 2, 3, 4, 5, 6, 7, 13, 14]}, 
            {id:2, label:'User'}]
};
