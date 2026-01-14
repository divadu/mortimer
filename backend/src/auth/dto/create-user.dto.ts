import { IsEmail, IsNotEmpty, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @IsString({ message: 'El rol debe ser texto' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  roleId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
