const { Province } = require('../models');


/**
 * @class ProvinceService
 * @description Un servicio para manejar operaciones relacionadas con las provincias.
 */
class ProvinceService {
    /**
     * Recupera todas las provincias.
     * @returns {Promise<Province[]>} Una promesa que se resuelve en un array de provincias.
     */
    async getProvinces(){
        try {
            return await Province.findAll();
        } catch (error) {
            console.error('Error al recuperar las provincias:', error);
            throw new Error('No se pudieron recuperar las provincias.');
        }
    }

    /**
     * Recupera todas las provincias para un ID de país dado.
     * @param {number} id_country - El ID del país.
     * @returns {Promise<Province[]>} Una promesa que se resuelve en un array de provincias.
     */
    async getProvinceByCountry(id_country){
        try {
            return await Province.findAll({ where: { id_country } });
        } catch (error) {
            console.error(`Error al recuperar provincias para el país ${id_country}:`, error);
            throw new Error('No se pudieron recuperar las provincias por país.');
        }
    }
}


module.exports = new ProvinceService();