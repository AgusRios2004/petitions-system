const { Gender } = require('../models');

class GenderService { 
    async getGenders(){
        return await Gender.findAll();
    }
}

module.exports = new GenderService();