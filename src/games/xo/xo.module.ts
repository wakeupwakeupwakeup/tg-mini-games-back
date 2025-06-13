import { Module } from '@nestjs/common';
import { XoGateway } from './xo.gateway';
import { XoService } from './xo.service';

@Module({
  providers: [XoService, XoGateway],
})
export class XoModule {}
