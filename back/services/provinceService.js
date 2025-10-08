const { Province } = require('../models');

class ProvinceService {
    async getProvinces(){
        return await Province.findAll();
    };
    async getProvinceByCountry(id_country){
        return await Province.findAll({ where: { id_country } });
    }
}

module.exports = new ProvinceService();