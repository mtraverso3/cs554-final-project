import {Navbar} from "@/components/Navbar";

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar/>

            <div className="flex-grow mx-auto px-4 py-6 text-center">
                    <h1 className="text-4xl font-bold mb-4">CS554 Final Project</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        CS554 Final Project
                    </p>
            </div>
        </div>
    );
}