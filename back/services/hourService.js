const { Hour } = require('../models');

class HourService {
    async getAllHours(){
        return await Hour.findAll();
    }
}

module.exports = new HourService();