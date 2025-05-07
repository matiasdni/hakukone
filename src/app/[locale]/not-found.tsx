import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-4xl font-bold text-slate-800">404</h2>
        <p className="mb-4 text-slate-500">Page not found</p>
        <Link href={{ pathname: "/" }}>
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  );
}
