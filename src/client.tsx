import { StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router";

const router = getRouter();

export default function Client() {
  return <StartClient router={router} />;
}
