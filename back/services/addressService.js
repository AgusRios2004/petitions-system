const { Address } = require('../models');

class AddressService {
    async getAll(){
        return await Address.findAll();
    }
    async getById(id){
        return await Address.findByPk(id);
    }
    async create(data){
        return await Address.create({
            street: data.street,
            number: data.number,
            floor: data.floor,
            apartment: data.apartment,
            postal_code: data.postal_code,
            id_city: data.id_city,
            date_create: data.date_creat,
        });
    }
    async update(id, data){
        const ok = await Address.findByPk(id);
        if(!ok) return null;
        await Address.update({
            street: data.street,
            number: data.number,
            floor: data.floor,
            apartment: data.apartment,
            postal_code: data.postal_code,
            id_city: data.id_city,
            date_update: new Date(),
        }, {where: {id_address: id}});
        return await Address.findByPk(id);
    }
    
    async delete(id){
        const ok = await Address.findByPk(id);
        if(!ok) return null;
        await Address.destroy({where: {id_address: id}});
        return true;
    }

    async getAddressByCity(cityId) {
        return await Address.findAll({ where: { id_city: cityId } });
    }
}

module.exports = new AddressService();