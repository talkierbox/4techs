//@ts-ignore
import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import Calendar from "./components/Calendar";


gsap.registerPlugin(Draggable);
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
 
    </ConvexProvider>
  </React.StrictMode>
);
