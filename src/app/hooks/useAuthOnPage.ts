import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuthOnPage = () => {
    const { user, error, isLoading } = useUser();
    const router = useRouter();
    useEffect(() => {
        if (error) {
            console.error("Error in auth: ", error)
            return
        }
        if (!user && !isLoading) {
            router.push("/api/auth/login");
            return;
        }
    }, [user, isLoading, router, error]);
}