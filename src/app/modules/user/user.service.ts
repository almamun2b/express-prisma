import { prisma } from "@/app/config/prisma";
import { UserConstants } from "./user.constants";

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    select: UserConstants.USER_SAFE_SELECT,
  });
  return result;
};

const getUserByIdFromDB = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return result;
};

export const UserServices = {
  getAllUsersFromDB,
  getUserByIdFromDB,
};
