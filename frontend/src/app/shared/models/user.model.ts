export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

export enum UserType {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export interface UserResponseDTO {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: Date; // or string if dates are serialized as strings
    gender: Gender;
    phone: string;
    email: string;
    username: string;
    avatarUrl?: string;
}

export interface UserCreationRequestDTO {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender: Gender;
    phone: string;
    email: string;
    username: string;
    password?: string; // Optional for updates if distinct types not used strictly
    type: UserType;
}

export interface UserUpdateDTO extends UserCreationRequestDTO {
    id: number;
}

export interface PwdChangeRequestDTO {
    id: number;
    oldPassword?: string;
    newPassword?: string;
}
