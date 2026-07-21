import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './service/users.service';

@Module({
    //providers tell nest that it knows how to create userrepo
    providers: [
        UserRepository,
        UsersService,
    ],
    //any module which imports usermodule can also use userreop
    exports: [UserRepository],
})
export class UsersModule {};
