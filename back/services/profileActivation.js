// Lógica común de la activación del segundo perfil (spec 0002, comportamiento 3).
// Domicilio y perfil se crean en una sola transacción; el índice único de user_id
// es la garantía real contra la carrera y su error se traduce a 409.
const { Address, sequelize } = require('../models');
const { httpError } = require('../middlewares/ownership');

const ADDRESS_FIELDS = ['street', 'number', 'floor', 'apartment', 'postal_code', 'id_city'];
const ADDRESS_REQUIRED = ['street', 'number', 'postal_code', 'id_city'];

async function activateProfile({ data, current, kind, create }) {
    if (current[kind]) throw httpError(409, 'El perfil ya existe.');

    // Validar todo antes de abrir la transacción.
    const other = kind === 'customer' ? current.provider : current.customer;
    let addressData = null;
    let reusedId = null;
    if (data.reuseAddress === true) {
        reusedId = other && other.address_id;
        if (!reusedId) throw httpError(400, 'No hay un domicilio previo para reutilizar.');
    } else {
        const a = data.address;
        const missing = ADDRESS_REQUIRED.filter((f) => !a || typeof a !== 'object' || !a[f]);
        if (missing.length) throw httpError(400, `Faltan campos del domicilio: ${missing.join(', ')}`);
        addressData = Object.fromEntries(ADDRESS_FIELDS.filter((f) => a[f] !== undefined).map((f) => [f, a[f]]));
    }

    const transaction = await sequelize.transaction();
    try {
        const address_id = reusedId || (await Address.create(addressData, { transaction })).id_address;
        const profile = await create(address_id, transaction);
        await transaction.commit();
        return profile;
    } catch (e) {
        await transaction.rollback();
        if (e && e.name === 'SequelizeUniqueConstraintError') throw httpError(409, 'El perfil ya existe.');
        throw e;
    }
}

module.exports = { activateProfile };
