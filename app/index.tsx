import { useRouter } from "expo-router";
import { useEffect } from "react";

function MainScreen() {
    const router = useRouter()

    useEffect(() => {
        requestAnimationFrame(() =>
            router.replace('/habits')
        );
    }, [])

    return null;
}

export default MainScreen;