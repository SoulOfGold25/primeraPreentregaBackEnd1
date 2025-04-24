import { TicketModel } from './models/ticket.model.js';

class TicketDAO {
  async createTicket(ticketData) {
    return await TicketModel.create(ticketData);
  }

  async getTicketByCode(code) {
    return await TicketModel.findOne({ code });
  }
}

export default new TicketDAO();
