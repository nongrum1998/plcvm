export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type UserResponse = {
  username: string;
};

export type LogoutResponse = {
  message: string;
  status: boolean;
};

export type LogoutRequest = {
  token: string;
};
