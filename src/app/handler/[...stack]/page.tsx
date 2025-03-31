import { stackServerApp } from "@/app/stack/server";
import { StackHandler } from "@stackframe/stack";

export default function Handler(props: { params: Promise<unknown>; searchParams: Promise<unknown> }) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
