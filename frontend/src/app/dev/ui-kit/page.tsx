import { notFound } from "next/navigation";
import { UiKit } from "./ui-kit";

export const metadata = { title: "UI kit (dev)" };

/** Developer-only component preview. Returns 404 in production and is not linked from the app. */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiKit />;
}
