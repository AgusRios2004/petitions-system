const { Portfolio, Attachment } = require('../models');
const attachmentService = require('../services/attachmentService')
const fs = require('fs');
const path = require('path');

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

    async deletePortfolio(id_portfolio, id_provider){
        const portfolio = await Portfolio.findOne({
            where: { id_portfolio: id_portfolio, id_provider: id_provider},
            include: ['attachments'],
        });

        if(!portfolio) throw new Error("Portfolio no encontrado");

        if(portfolio.attachments && portfolio.attachments.length > 0){
            portfolio.attachments.forEach(att => {
                const filePath = path.join(__dirname, '../uploads', att.path);
                fs.unlink(filePath, (err) => {
                    if (err) console.error(`No se pudo borrar archivo: ${filePath}`);
                });
            });
        }
        await Attachment.destroy({ where: { id_portfolio: id_portfolio } });
        
        await Portfolio.destroy({where: { id_portfolio: id_portfolio }});
    }
}

module.exports = new PortfolioService();