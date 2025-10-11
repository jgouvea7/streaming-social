import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOneBy({ email: createUserDto.email })
    if (user) {
      throw new BadRequestException("Email de usuário já cadastrado.");
    }
    const username = await this.userRepository.findOneBy({ username: createUserDto.username })
    if (username) {
      throw new BadRequestException("Nome de usuário já cadastrado.");
    }

    const hashed_password = await bcrypt.hash(createUserDto.password, 12)

    await this.userRepository.save({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      username: createUserDto.username,
      bio: createUserDto.bio,
      email: createUserDto.email,
      password: hashed_password,
      birthDate: createUserDto.birthDate
    });

    return {
      message: "Usuário criado com sucesso"
    }
  }

  findAll() {
    return this.userRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthDate: true,
        role: true,
      },
      relations: {
        videos: true
      }
    });
  }

  async findOneByID(userID: string) {
    const user = await this.userRepository.findOneBy({ id: userID });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({email: email})
    if (!user) {
      throw new NotFoundException("Email não encontrado")
    }

    return user
  }


  async update(userID: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id: userID })
    if (!user) {
      throw new NotFoundException("Usuário não encontrado")
    }

    const { password, ...data } = updateUserDto;

    Object.assign(user, data);

    await this.userRepository.save(user)

    return {
      message: "Usuário alterado com sucesso"
    }
  }
  

  async changePassword(userID: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id: userID })
    if (!user) {
      throw new NotFoundException("Usuário não encontrado")
    }

    user.password = await bcrypt.hash(updateUserDto.password, 12)

    await this.userRepository.save(user)

    return {
      message: "Senha alterada com sucesso."
    }
  }



  async removeUserByID(userID: string) {
    const user = await this.userRepository.findOneBy({ id: userID })
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    await this.userRepository.delete(user.id);

    return {
      message: "Usuário deletado com sucesso"
    }
  }

  removeAll() {
    return this.userRepository.deleteAll();
  }
}
