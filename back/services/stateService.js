const { State } = require('../models');

class StateService {

    async getStates() {
        return await State.findAll();
    }

    async getStateById(id) {
        return await State.findByPk(id);
    }

    async createState(stateData) {
        return await State.create(stateData);
    }

    async updateState(id, stateData) {
        const state = await State.findByPk(id);
        if (!state) {
            return null;
        }
        return await state.update(stateData);
    }

    async deleteState(id) {
        const state = await State.findByPk(id);
        if (!state) {
            return null;
        }
        await state.destroy();
        return true;
    }
}

module.exports = new StateService();
