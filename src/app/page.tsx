import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LoginButton from "@/components/LoginButton";
import ClientWrapper from "@/components/ClientWrapper";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Meeting Note Taker AI Bot</h1>
      <LoginButton />
      {session && session.user?.name && (
        <ClientWrapper userName={session.user.name} />
      )}
    </main>
  );
}
