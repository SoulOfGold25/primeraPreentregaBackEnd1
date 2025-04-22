import { TicketModel } from '../dao/models/ticket.model.js';

export default class TicketDAO {
  async create(ticketData) {
    return await TicketModel.create(ticketData);
  }

  async getAll() {
    return await TicketModel.find();
  }

  async getById(id) {
    return await TicketModel.findById(id);
  }
}
