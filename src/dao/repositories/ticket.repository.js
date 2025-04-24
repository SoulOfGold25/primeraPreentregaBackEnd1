import TicketDAO from '../ticket.dao.js';

class TicketRepository {
  async generate(ticketDTO) {
    return await TicketDAO.createTicket(ticketDTO);
  }

  async findByCode(code) {
    return await TicketDAO.getTicketByCode(code);
  }
}

export default new TicketRepository();
