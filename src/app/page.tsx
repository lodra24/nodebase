import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Logout } from "./logout";

const Page = async () => {
  await requireAuth();
  const data = await caller.getUsers();

  return (
    <div>
      <h1 className="text-red-400">Protected Server Component</h1>
      <div className=" min-h-screen min-w-screen flex flex-col items-center justify-center">
        {JSON.stringify(data, null, 2)}
        <Logout />
      </div>
    </div>
  );
};

export default Page;
