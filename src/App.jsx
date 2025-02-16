import MoviesTable from "./MoviesTable";
import AnimatedBackground from "./AnimatedBackground";

export default function App() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 text-gray-900">
      <AnimatedBackground />
      <h1 className="text-4xl font-bold mb-6 text-center z-10">
        Telugu Movie OTT Releases
      </h1>
      <MoviesTable />
    </div>
  );
}