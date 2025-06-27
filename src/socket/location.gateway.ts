import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LocationGateway {
  @WebSocketServer()
  server: Server;

  // Emit location from agent to all clients
  @SubscribeMessage('agent-location')
  handleAgentLocation(
    @MessageBody() data: { parcelId: string; lat: number; lng: number },
  ) {
    this.server.emit(`location-update-${data.parcelId}`, data);
  }
}
