const { Portfolio, Attachment } = require('../models');
const attachmentService = require('../services/attachmentService')

class PortfolioService {
    async getPortfoliosByProvider(id_provider){
        return await Portfolio.findAll({
            where: {id_provider},
            include: {
                model: Attachment,
                as: 'attachments',
                attributes: ['path', 'name'],
            },
        })
    }

    async createPortfolio(data, fileData){
        const newPortfolio = await Portfolio.create(data);

        if(fileData){
            await attachmentService.create({
                ...fileData,
                id_portfolio: newPortfolio.id_portfolio
            });
        }

        return newPortfolio;
    }
}

module.exports = new PortfolioService();