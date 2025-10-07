const { Province } = require('../models');

class ProvinceService {
    async getProvinces(){
        return await Province.findAll();
    };
}

module.exports = new ProvinceService();