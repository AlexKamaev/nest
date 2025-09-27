import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // create a fake copy of the users service
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("can create an instance of auth service", async () => {
    expect(service).toBeDefined();
  });

  it("creates a new user with a salted and hashed password", async () => {
    const user = await service.signup("custom@email.com", "custompassword");

    expect(user.password).not.toEqual("custompassword");
    const [salt, hash] = user.password.split(".");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("throws an error if user signs up with email that is in use", async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: "a", password: "1" }] as User[]);

    await expect(service.signup("test", "test")).rejects.toThrow(
      BadRequestException
    );
  });

  it("throws if signin is called with an unused email", async () => {
    await expect(service.signin("test", "test")).rejects.toThrow(
      NotFoundException
    );
  })

  it("throws if invalid password is provided", async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: "test@email.com", password: "pass" }] as User[]);

    await expect(service.signin("test@email.com", "wrongpassword")).rejects.toThrow(
      NotFoundException
    );
  });

  it('returns a user if correct password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: "test@email.com", password: "9d7d0b8912e21627.5f0b341918cdb677287549592b6b6b53bb47f8c528935d5c512527e3eddce16e" }] as User[]);

    const user = await service.signin("test@email.com", "pass");

    expect(user).toBeDefined();
  });
});
