const { Provider } = require('../models/Provider');

class ProviderService {
    async getProviders(){
        return await Provider.findAll();
    }
    async getProviderById(id){
        return await Provider.findByPk(id);
    }
    async createProvider(data){
        return await Provider.create(data);
    }
    async updateProvider(id, data){
        const ok = Provider.findByPk(id);
        if(!ok) return null;
        Provider.update(data);
        return await Provider.findByPk(id);
    }
    async deleteProvider(id){};
}

module.exports = new ProviderService();