const ProviderCategory = require("../models");

class ProviderCategoryService {
    async createProviderCategory(data){
        return await ProviderCategory.create(data);
    }

    //async getAllProviderCategoryByIdProvider()
}