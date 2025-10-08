const { TypeProvider } = require('../models');

class TypeProviderService {
    async getTypeProviders(){
        return await TypeProvider.findAll();
    };
}

module.exports = new TypeProviderService();