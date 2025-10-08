const { City } = require('../models');

class CityService {
    async getCities(){
        return await City.findAll();
    };
    async getCityByDepartment(id_department){
        return await City.findAll({ where: { id_department } });
    }
}

module.exports = new CityService();