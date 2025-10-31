const { Week } = require('../models');

class WeekService {
    async getAllWeeks(){
        return await Week.findAll();
    }
}

module.exports = new WeekService();