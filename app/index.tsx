import { useEffect } from "react";

import { useRouter } from "expo-router";

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
