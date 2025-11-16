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
            await attachmentService.createAttachment({
                name: fileData.originalname,
                path: fileData.filename,
                id_portfolio: newPortfolio.id_portfolio,
                id_user_create: data.id_user_create
            });
        }

        return newPortfolio;
    }
}

module.exports = new PortfolioService();