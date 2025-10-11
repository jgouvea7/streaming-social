import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private userService: UsersService
  ) {}


  async postVideo(createVideoDto: CreateVideoDto, file: Express.Multer.File, userID: string) {
    const user = await this.userService.findOneByID(userID);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }


    const video = this.videoRepository.create({
      title: createVideoDto.title,
      user,
      edited: false,
      url: `/uploads/videos/${file.filename}`,
    });

    await this.videoRepository.save(video);

    return {
        message: "Vídeo carregado com sucesso", 
        id: video.id
    }
  }


  findAll() {
    return this.videoRepository.find();
  }


  async findVideoByID(videoID: string) {
    const video = await this.videoRepository.findOneBy({ id: videoID });

    if (!video) {
      throw new NotFoundException('Vídeo não encontrado');
    }

    return video;
  }


  async updateVideoByID(videoID: string, userID: string ,updateVideoDto: UpdateVideoDto) {
    const video = await this.videoRepository.findOne({
      where: { id: videoID },
      relations: ['user']
    });

    if (!video) {
      throw new NotFoundException('Vídeo não encontrado');
    }

    if (video.user.id != userID) {
      throw new ForbiddenException('Você não tem permissão para editar este vídeo');
    }

    const { likeCount, ...data } = updateVideoDto;
    video.edited = true
    Object.assign(video, data);

    return this.videoRepository.save(video);
  }


  async updateLikeVideo(videoID: string, userID: string, updateVideoDto: UpdateVideoDto) {
    const video = await this.videoRepository.findOneBy({ id: videoID });

    if (!video) {
      throw new NotFoundException('Vídeo não encontrado');
    }

    Object.assign(video, updateVideoDto);

    return this.videoRepository.save(video);
  }


  async removeVideoByID(videoID: string, userID: string) {

    const video = await this.videoRepository.findOne({
      where: { id: videoID },
      relations: ['user'],
    });

    if (!video) {
      throw new NotFoundException('Vídeo não encontrado');
    }

    if (video.user.id !== userID) {
      throw new ForbiddenException('Você não tem permissão para deletar este vídeo');
    }

    await this.videoRepository.delete(video.id);

    return {
      message: 'Vídeo deletado com sucesso',
    };

  }

  async removeAll() {
    return this.videoRepository.deleteAll();
  }
}
