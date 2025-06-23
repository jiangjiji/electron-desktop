import { useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card } from "@/components/ui/card";

export interface DesktopFile {
	name: string;
	path: string;
	isDirectory: boolean;
	isFile: boolean;
	ext: string;
	icon?: string;
}

export interface Group {
	id: string;
	name: string;
	files: DesktopFile[];
}

const ItemType = {
	FILE: "file",
};

function FileIcon({ file }: { file: DesktopFile }) {
	if (file.icon) {
		return (
			<div className="flex flex-col items-center w-20 cursor-pointer select-none">
				<img src={file.icon} alt="icon" className="w-10 h-10 mb-1" />
				<div className="text-xs text-center break-all max-w-16">{file.name}</div>
			</div>
		);
	}
	const icon = file.isDirectory ? "📁" : file.ext === "lnk" ? "🔗" : "📄";
	return (
		<div className="flex flex-col items-center w-20 cursor-pointer select-none">
			<div className="text-3xl mb-1">{icon}</div>
			<div className="text-xs text-center break-all max-w-16">{file.name}</div>
		</div>
	);
}

function DraggableFile({
	file,
	index,
	moveFile,
}: {
	file: DesktopFile;
	index: number;
	moveFile: (from: number, to: number) => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: ItemType.FILE,
			item: { index },
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
		}),
		[index],
	);

	const [, drop] = useDrop({
		accept: ItemType.FILE,
		hover: (item: { index: number }) => {
			if (item.index !== index) {
				moveFile(item.index, index);
				item.index = index;
			}
		},
	});

	useEffect(() => {
		if (ref.current) {
			drag(drop(ref.current));
		}
	}, [ref, drag, drop]);

	return (
		<div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
			<FileIcon file={file} />
		</div>
	);
}

export function FencesBox({ group, moveFile }: { group: Group; moveFile: (from: number, to: number) => void }) {
	return (
		<Card className="w-[380px] min-h-[220px] p-4 m-4 bg-white/80 shadow-lg border border-gray-200">
			<div className="font-bold mb-2">{group.name}</div>
			<div className="flex flex-wrap gap-2">
				{group.files.map((file, idx) => (
					<DraggableFile key={file.path} file={file} index={idx} moveFile={moveFile} />
				))}
			</div>
		</Card>
	);
}
