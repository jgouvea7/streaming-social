import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { VideosService } from './videos.service';
import type { Express } from 'express';
import { diskStorage } from 'multer';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/v1/videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
  ) {}

  @Post('/upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (() => {
          const uploadPath = join(process.cwd(), '..', 'uploads/videos');
          return uploadPath;
        })(),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() createVideoDto: CreateVideoDto,
    @Request() req,
  ) {
    
    const userID = req.user.sub
    return this.videosService.postVideo(createVideoDto, file, userID);

  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }


  @Get('/get-video-id/:id')
  @UseGuards(AuthGuard)
  findVideoById(
    @Param('id') id: string
  ) {
      return this.videosService.findVideoByID(id);
  }


  @Patch(':id')
  @UseGuards(AuthGuard)
  updateVideoById(
    @Param('id') id: string,
    @Request() req,
    @Body() updateVideoDto: UpdateVideoDto
  ) {
      const userID = req.user.sub
      return this.videosService.updateVideoByID(id, userID, updateVideoDto);
  }


  @Delete(':id')
  @UseGuards(AuthGuard)
  removeVideoById(
    @Param('id') id:string,
    @Request() req,
  ) {
      const userID = req.user.sub
      return this.videosService.removeVideoByID(id, userID);
  }


  @Delete()
  removeAll() {
    return this.videosService.removeAll();
  }
}
