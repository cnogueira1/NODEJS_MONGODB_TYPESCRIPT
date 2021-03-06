import { getCustomRepository } from 'typeorm';
import md5 from 'md5';
import User from '../../models/User';
import UsersRepository from '../../repositories/UserRepository';

interface RequestDTO {
  id: string;
  email: string;
  password: string;
}

class AlterUserService {
  public async execute({
    id,
    email,
    password,
  }: RequestDTO): Promise<User | null> {
    if (!(id && email && password)) throw Error('Fields are missing');

    const usersRepository = getCustomRepository(UsersRepository);
    // md5 encrypts the passed password
    const profile = await usersRepository.findById(id);

    if (!profile) throw Error('User not exist');

    if (!(profile?.password === password)) {
      const passwordhash = md5(password);
      await usersRepository.update(
        { id },
        { password: passwordhash, updatedAt: new Date() },
      );
    }

    if (!(profile?.email === email)) {
      const findUserByEmail = await usersRepository.findByEmail(email);

      if (findUserByEmail)
        throw Error('already exist user created with this email');

      await usersRepository.update({ id }, { email, updatedAt: new Date() });
    }

    const user = await usersRepository.findById(id);

    return user;
  }
}

export default AlterUserService;
