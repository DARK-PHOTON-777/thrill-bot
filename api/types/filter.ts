export type FilterRule =
	| string[]
	| { min?: number; max?: number }
	| { [key: string]: FilterRule | undefined };
