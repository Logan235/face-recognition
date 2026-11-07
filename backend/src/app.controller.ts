import { Controller, Get, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('users/register')
  @UseInterceptors(FileInterceptor('file'))
  async registerUser(
    @UploadedFile() file: any,
    @Body('name') name: string,
    @Body('studentId') studentId: string,
  ) {
    return this.appService.registerUser(file, name, studentId);
  }

  @Post('scan/recognize')
  @UseInterceptors(FileInterceptor('file'))
  async scanRecognize(@UploadedFile() file: any) {
    return this.appService.scanRecognize(file);
  }

  @Get('users/leaderboard')
  async getLeaderboard() {
    return this.appService.getLeaderboard();
  }
}

