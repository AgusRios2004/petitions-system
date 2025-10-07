const { City } = require('../models');

class CityService {
    async getCities(){
        return await City.findAll();
    };
}

module.exports = new CityService();