const { Profession } = require('../models');

class ProfessionService {
    async getProfessions(){
        return await Profession.findAll();
    };
}

module.exports = new ProfessionService();