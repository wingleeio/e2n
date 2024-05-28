import { auth } from "@/lib/auth";
import { TestComponent } from "./TestComponent";

export default async function Home() {
    const session = auth();

    return <TestComponent />;
}
