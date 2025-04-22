import TicketDAO from '../ticket.dao.js';

const ticketDao = new TicketDAO();

export default class TicketRepository {
  createTicket(data) {
    return ticketDao.create(data);
  }

  getTickets() {
    return ticketDao.getAll();
  }

  getTicketById(id) {
    return ticketDao.getById(id);
  }
}
