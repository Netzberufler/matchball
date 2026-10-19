import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    // Adds username to sign-up and signIn.username()
    plugins: [usernameClient({ displayUsername: false })],
});

export const { signIn, signUp, signOut, useSession } = authClient;
