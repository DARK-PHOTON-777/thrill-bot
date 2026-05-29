import { useMutation } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { API_URL } from "../../api/index.ts";
import { QuerySchema } from "../../api/schema/query.ts";
import { responseSchema } from "../../api/schema/response.ts";
import type { Response } from "../../api/types/response.ts";

const EXAMPLES = [
	"What's the fastest coaster in the state of Florida?",
	"Best kid coasters in the state Ohio?",
	"What's the longest rollercoaster that is launched?",
	"Tallest wood Coaster in the United States?",
];

const RCDB = "https://www.rcdb.com";

async function search(query: string): Promise<Response> {
	const body = QuerySchema.parse({ query });

	const res = await fetch(`${API_URL}/search`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!res.ok) throw new Error("Search failed");

	return responseSchema.parse(await res.json());
}

export const App = () => {
	const [input, setInput] = useState("");

	const { mutate, data, isPending, isError, reset } = useMutation({
		mutationFn: search,
	});

	const submit = () => {
		const q = input.trim();

		if (!q || isPending) return;

		reset();
		mutate(q);
	};

	const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	return (
		<div className="min-h-dvh max-w-3xl mx-auto text-white flex flex-col items-center p-4 gap-4 py-8">
			{/* Header */}
			<header className="flex flex-col items-center gap-1 text-center">
				<h1 className="text-6xl font-black uppercase text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
					ThrillBot
				</h1>
				<p className="text-sm font-semibold uppercase text-white/60">
					AI Roller Coaster Advisor
				</p>
			</header>
			<div
				className={`flex-1 flex flex-col items-center w-full transition-all duration-500 gap-8 ${
					data || isPending ? "justify-start" : "justify-end"
				}`}
			>
				{/* Input */}
				<div className="w-full max-w-md flex flex-col gap-8">
					{/* Examples — only when no result and not loading */}
					{!data && !isPending && (
						<div className="flex flex-wrap gap-2 justify-center">
							{EXAMPLES.map((ex) => (
								<button
									key={ex}
									type="button"
									onClick={() => setInput(ex)}
									className="text-sm text-cyan-400/70 border border-cyan-500/20 rounded-full px-3 py-1.5 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-300 transition-all duration-150"
								>
									{ex}
								</button>
							))}
						</div>
					)}

					{/* Textarea row */}
					<div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 focus-within:border-cyan-500/40 transition-colors duration-200">
						<textarea
							rows={1}
							value={input}
							onChange={(e) => {
								setInput(e.target.value);
								e.target.style.height = "auto";
								e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
							}}
							onKeyDown={handleKey}
							placeholder="Let me recommend you a Rollercoaster..."
							disabled={isPending}
							className="flex-1 resize-none bg-transparent outline-none text-md text-white placeholder:text-white/50 leading-relaxed disabled:opacity-50 [field-sizing:content] max-h-40 overflow-y-auto [scrollbar-width:none]"
						/>
						<button
							onClick={submit}
							type="button"
							disabled={!input.trim() || isPending}
							className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-500/55 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
						>
							<ArrowUp size={16} strokeWidth={2.5} />
						</button>
					</div>
				</div>

				{/* Result */}
				<div className="w-full max-w-md animate-fade-in">
					{/* Spinner */}
					{isPending && (
						<div className="flex items-center gap-2 text-white/40 text-sm px-1">
							<span className="w-4 h-4 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
							Searching coasters…
						</div>
					)}

					{/* Error */}
					{isError && (
						<p className="text-sm text-red-400/80 px-1">
							Something went wrong — try a different query.
						</p>
					)}

					{/* Data */}
					{data && (
						<div className="flex flex-col gap-4">
							{/* Response text */}
							<p className="text-md leading-relaxed text-white/80">
								{data.response.replace('"', "")}
							</p>

							{/* Coaster card */}
							<a
								href={`${RCDB}${data.coaster.link}`}
								target="_blank"
								rel="noopener noreferrer"
								className="group rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] hover:border-cyan-500/25 transition-colors duration-200"
							>
								{data.coaster.picture && (
									<img
										src={`${RCDB}${data.coaster.picture.url}`}
										alt={data.coaster.name}
										className="w-full h-44 object-cover"
									/>
								)}
								<div className="px-4 py-3 flex flex-col gap-1">
									<div className="flex items-baseline justify-between gap-2">
										<span className="font-black text-xl text-white leading-tight">
											{data.coaster.name}
										</span>
										<span className="text-md text-cyan-400/60 group-hover:text-cyan-400 transition-colors shrink-0">
											rcdb.com ↗
										</span>
									</div>
									<span className="text-md text-cyan-400/70">
										{data.coaster.park.name}
									</span>
									<span className="text-sm text-white/60 uppercase tracking-widest mt-0.5">
										{data.coaster.city},{" "}
										{data.coaster.state} ·{" "}
										{data.coaster.make ?? data.coaster.type}
									</span>
									{data.coaster.stats && (
										<div className="flex gap-5 mt-2.5 [&>div]:flex [&>div]:flex-col justify-around">
											{data.coaster.stats.speed && (
												<div>
													<span className="text-md uppercase tracking-widest text-white/60">
														Speed
													</span>
													<span className="text-lg font-semibold text-white/75">
														{Math.round(
															data.coaster.stats
																.speed * 0.621,
														)}{" "}
														mph
													</span>
												</div>
											)}
											{data.coaster.stats.height && (
												<div>
													<span className="text-md uppercase tracking-widest text-white/60">
														Height
													</span>
													<span className="text-lg font-semibold text-white/75">
														{Math.round(
															data.coaster.stats
																.height * 3.281,
														)}{" "}
														ft
													</span>
												</div>
											)}
											{data.coaster.stats.length && (
												<div>
													<span className="text-md uppercase tracking-widest text-white/60">
														Length
													</span>
													<span className="text-lg font-semibold text-white/75">
														{Math.round(
															data.coaster.stats
																.length * 3.281,
														).toLocaleString()}{" "}
														ft
													</span>
												</div>
											)}
										</div>
									)}
								</div>
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
