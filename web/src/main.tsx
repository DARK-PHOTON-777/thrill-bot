import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FaGithub } from "react-icons/fa";
import { App } from "./App.tsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
			<footer className="fixed bottom-0 inset-x-0 flex items-center justify-center gap-2 md:gap-4 h-12 bg-[#0c0c0e]/90 backdrop-blur border-t border-white/[0.06] text-md tracking-wide text-white/60 z-50">
				<a
					href="https://github.com/DARK-PHOTON-777/thrill-bot"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
				>
					<FaGithub className="size-6" />
				</a>
				<span className="opacity-30">·</span>
				<a
					href="https://reno-warner.github.io/portfolio/"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-red-500 transition-colors"
				>
					Engineered by{" "}
					<strong className="text-white/80 font-semibold">
						RENO
					</strong>
				</a>
			</footer>
		</QueryClientProvider>
	</StrictMode>,
);
