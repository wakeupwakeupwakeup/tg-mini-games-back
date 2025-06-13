import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { XoService } from './xo.service';
import { PlayerMove } from './xo.types';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  port: 8080,
})
export class XoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly xoService: XoService) {}

  private rooms: Map<string, Set<Socket>> = new Map();

  private leaveAllRooms(client: Socket) {
    this.rooms.forEach((clients, roomId) => {
      if (clients.has(client)) {
        clients.delete(client);
        if (clients.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.leaveAllRooms(client);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    const room = this.rooms.get(roomId)!;
    if (room.size >= 2) {
      return { error: 'Room is full' };
    }

    room.add(client);
    await client.join(roomId);

    if (room.size === 2) {
      const gameState = this.xoService.createGame(roomId);
      this.server.to(roomId).emit('gameStarted', gameState);
    }

    return { success: true };
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(client: Socket, data: { roomId: string; move: PlayerMove }) {
    const { roomId, move } = data;
    const room = this.rooms.get(roomId);

    if (!room || !room.has(client)) {
      return { error: 'Not in game' };
    }

    const gameState = this.xoService.makeMove(roomId, move);
    if (gameState) {
      this.server.to(roomId).emit('gameStateUpdate', gameState);
    }

    return { success: true };
  }
}
