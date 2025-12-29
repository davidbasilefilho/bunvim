import { useTerminalDimensions } from "@opentui/react";
import type React from "react";
import { useMemo } from "react";
import { EditorBuffer } from "./editor-buffer";

export type WindowAnchor =
	| "top-left"
	| "top-center"
	| "top-right"
	| "center-left"
	| "center"
	| "center-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right"
	| "free";

export type WindowType = "normal" | "floating" | "split";

export type Margins = {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
};

export interface WindowProps {
	id: number;
	type?: WindowType;
	anchor?: WindowAnchor;
	margins?: Margins;
	title?: string;
	width?: number | string;
	height?: number | string;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	zIndex?: number;
	focusable?: boolean;
	closable?: boolean;
	dim?: boolean;
	children?: React.ReactNode;
}

export interface BufferEntry {
	id: number;
	name: string;
	path?: string;
	modified?: boolean;
}

export interface WindowBufferProps extends WindowProps {
	buffers: BufferEntry[];
	activeBufferId: number;
	gutterWidth?: number;
	onTabClick?: (id: number) => void;
	onTabClose?: (id: number) => void;
	editorProps?: Record<string, unknown>;
}

function shortenPath(path: string, maxLen = 40): string {
	if (path.length <= maxLen) return path;
	const parts = path.split("/");
	if (parts.length <= 2) return path;
	const fileName = parts.pop() || "";
	const shortened = parts.map((p) => p[0] || "").join("/");
	return `${shortened}/${fileName}`;
}

function WindowHeader({
	buffers,
	activeBufferId,
	title,
	gutterWidth = 0,
	onTabClick,
	onTabClose,
}: {
	buffers: BufferEntry[];
	activeBufferId: number;
	title?: string;
	gutterWidth?: number;
	onTabClick?: (id: number) => void;
	onTabClose?: (id: number) => void;
}) {
	const gutterPadding =
		gutterWidth > 0 ? (
			<box style={{ width: gutterWidth, backgroundColor: "#1a1b26" }} />
		) : null;

	if (buffers.length === 0 && title) {
		return (
			<box
				flexDirection="row"
				style={{ height: 1, backgroundColor: "#1f2335" }}
			>
				{gutterPadding}
				<text fg="#545c7e" style={{ paddingLeft: 1, paddingRight: 1 }}>
					{title}
				</text>
			</box>
		);
	}

	if (buffers.length === 1) {
		const buf = buffers[0];
		if (!buf) return null;
		const displayName = buf.path
			? shortenPath(buf.path)
			: buf.name || "[No Name]";
		const modifiedIndicator = buf.modified ? " [+]" : "";
		return (
			<box
				flexDirection="row"
				style={{ height: 1, backgroundColor: "#1f2335" }}
			>
				{gutterPadding}
				<text fg="#c0caf5" style={{ paddingLeft: 1, paddingRight: 1 }}>
					{displayName}
					{modifiedIndicator}
				</text>
			</box>
		);
	}

	return (
		<box flexDirection="row" style={{ height: 1, backgroundColor: "#16161e" }}>
			{gutterPadding}
			{buffers.map((buf) => (
				<box
					role="button"
					key={buf.id}
					onMouseDown={(e: { button: number }) => {
						if (e.button === 0) onTabClick?.(buf.id);
						if (e.button === 1) onTabClose?.(buf.id);
					}}
					style={{
						paddingLeft: 1,
						paddingRight: 1,
						backgroundColor: buf.id === activeBufferId ? "#3b4261" : "#16161e",
					}}
				>
					<text fg={buf.id === activeBufferId ? "#7aa2f7" : "#545c7e"}>
						{buf.id === activeBufferId ? "■ " : ""}
						{buf.path ? shortenPath(buf.path, 20) : buf.name || "[No Name]"}
						{buf.modified ? " [+]" : ""}
					</text>
				</box>
			))}
		</box>
	);
}

function calculatePosition(
	anchor: WindowAnchor,
	width: number,
	height: number,
	termWidth: number,
	termHeight: number,
	margins: Margins,
): { x: number; y: number } {
	const mt = margins.top ?? 0;
	const mr = margins.right ?? 0;
	const mb = margins.bottom ?? 0;
	const ml = margins.left ?? 0;

	const availWidth = termWidth - ml - mr;
	const availHeight = termHeight - mt - mb;

	switch (anchor) {
		case "top-left":
			return { x: ml, y: mt };
		case "top-center":
			return { x: ml + Math.floor((availWidth - width) / 2), y: mt };
		case "top-right":
			return { x: termWidth - mr - width, y: mt };
		case "center-left":
			return { x: ml, y: mt + Math.floor((availHeight - height) / 2) };
		case "center":
			return {
				x: ml + Math.floor((availWidth - width) / 2),
				y: mt + Math.floor((availHeight - height) / 2),
			};
		case "center-right":
			return {
				x: termWidth - mr - width,
				y: mt + Math.floor((availHeight - height) / 2),
			};
		case "bottom-left":
			return { x: ml, y: termHeight - mb - height };
		case "bottom-center":
			return {
				x: ml + Math.floor((availWidth - width) / 2),
				y: termHeight - mb - height,
			};
		case "bottom-right":
			return { x: termWidth - mr - width, y: termHeight - mb - height };
		default:
			return { x: ml, y: mt };
	}
}

function resolveSize(
	size: number | string | undefined,
	terminalSize: number,
	defaultSize: number,
): number {
	if (size === undefined) return defaultSize;
	if (typeof size === "number") return size;
	if (typeof size === "string" && size.endsWith("%")) {
		const percent = Number.parseFloat(size) / 100;
		return Math.floor(terminalSize * percent);
	}
	return Number.parseInt(size as string, 10) || defaultSize;
}

export function Window({
	type = "normal",
	anchor = "free",
	margins = {},
	title,
	width: widthProp,
	height: heightProp,
	minWidth,
	minHeight,
	maxWidth,
	maxHeight,
	zIndex = 0,
	dim = false,
	children,
}: WindowProps) {
	const { width: termWidth, height: termHeight } = useTerminalDimensions();

	const dimensions = useMemo(() => {
		let w = resolveSize(widthProp, termWidth, termWidth);
		let h = resolveSize(heightProp, termHeight, termHeight);

		if (minWidth !== undefined) w = Math.max(w, minWidth);
		if (maxWidth !== undefined) w = Math.min(w, maxWidth);
		if (minHeight !== undefined) h = Math.max(h, minHeight);
		if (maxHeight !== undefined) h = Math.min(h, maxHeight);

		return { width: w, height: h };
	}, [
		widthProp,
		heightProp,
		termWidth,
		termHeight,
		minWidth,
		maxWidth,
		minHeight,
		maxHeight,
	]);

	const position = useMemo(() => {
		if (type === "normal" || type === "split") {
			return { x: 0, y: 0 };
		}
		return calculatePosition(
			anchor,
			dimensions.width,
			dimensions.height,
			termWidth,
			termHeight,
			margins,
		);
	}, [type, anchor, dimensions, termWidth, termHeight, margins]);

	const containerStyle = useMemo(() => {
		const base: Record<string, unknown> = {
			width: dimensions.width,
			height: dimensions.height,
			backgroundColor: dim ? "#0f1014" : "#1a1b26",
		};

		if (type === "floating") {
			base.position = "absolute";
			base.left = position.x;
			base.top = position.y;
			base.zIndex = zIndex;
		}

		return base;
	}, [type, dimensions, position, zIndex, dim]);

	return (
		<box flexDirection="column" style={containerStyle}>
			{title && (
				<box
					flexDirection="row"
					style={{ height: 1, backgroundColor: "#1f2335" }}
				>
					<text fg="#545c7e" style={{ paddingLeft: 1, paddingRight: 1 }}>
						{title}
					</text>
				</box>
			)}
			<box flexDirection="column" flexGrow={1}>
				{children}
			</box>
			{dim && (
				<box
					position="absolute"
					left={0}
					top={0}
					width="100%"
					height="100%"
					backgroundColor="#000000"
					opacity={0.3}
				/>
			)}
		</box>
	);
}

export function BufferWindow({
	type = "normal",
	anchor = "free",
	margins = {},
	title,
	width: widthProp,
	height: heightProp,
	minWidth,
	minHeight,
	maxWidth,
	maxHeight,
	zIndex = 0,
	dim = false,
	buffers,
	activeBufferId,
	gutterWidth = 0,
	onTabClick,
	onTabClose,
	editorProps,
}: WindowBufferProps) {
	const { width: termWidth, height: termHeight } = useTerminalDimensions();

	const dimensions = useMemo(() => {
		let w = resolveSize(widthProp, termWidth, termWidth);
		let h = resolveSize(heightProp, termHeight, termHeight);

		if (minWidth !== undefined) w = Math.max(w, minWidth);
		if (maxWidth !== undefined) w = Math.min(w, maxWidth);
		if (minHeight !== undefined) h = Math.max(h, minHeight);
		if (maxHeight !== undefined) h = Math.min(h, maxHeight);

		return { width: w, height: h };
	}, [
		widthProp,
		heightProp,
		termWidth,
		termHeight,
		minWidth,
		maxWidth,
		minHeight,
		maxHeight,
	]);

	const position = useMemo(() => {
		if (type === "normal" || type === "split") {
			return { x: 0, y: 0 };
		}
		return calculatePosition(
			anchor,
			dimensions.width,
			dimensions.height,
			termWidth,
			termHeight,
			margins,
		);
	}, [type, anchor, dimensions, termWidth, termHeight, margins]);

	const containerStyle = useMemo(() => {
		const base: Record<string, unknown> = {
			width: dimensions.width,
			height: dimensions.height,
			backgroundColor: dim ? "#0f1014" : "#1a1b26",
		};

		if (type === "floating") {
			base.position = "absolute";
			base.left = position.x;
			base.top = position.y;
			base.zIndex = zIndex;
		}

		return base;
	}, [type, dimensions, position, zIndex, dim]);

	const hasHeader = buffers.length > 0 || title !== undefined;
	const contentHeight = hasHeader ? dimensions.height - 1 : dimensions.height;

	return (
		<box flexDirection="column" style={containerStyle}>
			<WindowHeader
				buffers={buffers}
				activeBufferId={activeBufferId}
				title={title}
				gutterWidth={gutterWidth}
				onTabClick={onTabClick}
				onTabClose={onTabClose}
			/>
			<box flexDirection="column" style={{ height: contentHeight }}>
				{editorProps && (
					<EditorBuffer
						{...editorProps}
						width={dimensions.width}
						height={contentHeight}
					/>
				)}
			</box>
			{dim && (
				<box
					position="absolute"
					left={0}
					top={0}
					width="100%"
					height="100%"
					backgroundColor="#000000"
					opacity={0.3}
				/>
			)}
		</box>
	);
}
