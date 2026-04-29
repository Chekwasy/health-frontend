import Nav from "@/app/components/nav";
import Main from "@/app/components/main";

export default function Home() {
  return (
    <div className="bg-cover bg-white text-sm text-gray-900 bg-center h-screen w-screen">
      <Nav />
      <Main />

      <div className="text-center text-gray-400 p-2">
        &copy; 2025 Chekwasy Businesses. All rights reserved.
      </div>
    </div>
  );
}