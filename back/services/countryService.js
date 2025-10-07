const { Country } = require('../models');

class CountryService {
    async getCountries(){
        return await Country.findAll();
    };
}

module.exports = new CountryService();