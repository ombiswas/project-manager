import React from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Task Hub" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}


const Homepage = () => {
    return (
        <div><Button>Click Me!</Button></div>
    )
}

export default Homepage