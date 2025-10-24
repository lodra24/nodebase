"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export const Logout = () => {
  return (
    <Button
      onClick={() => {
        authClient.signOut();
      }}
    >
      Sign Out
    </Button>
  );
};
