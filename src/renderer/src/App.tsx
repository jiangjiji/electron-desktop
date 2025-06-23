import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FencesBox, type Group } from "@/components/FencesBox";
import "./App.css";

function App() {
	const [groups, setGroups] = useState<Group[]>([]);

	useEffect(() => {
		window.api.getDesktopFiles().then((files) => {
			setGroups([
				{
					id: "default",
					name: "默认分组",
					files,
				},
			]);
		});
	}, []);

	// 只实现组内拖拽
	const moveFile = (from: number, to: number) => {
		setGroups((prev) => {
			const group = prev[0];
			const files = [...group.files];
			const [moved] = files.splice(from, 1);
			files.splice(to, 0, moved);
			return [{ ...group, files }];
		});
	};

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="min-h-svh bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center py-10">
				<div className="text-2xl font-bold mb-6">桌面图标盒子（Fences Box）</div>
				<div className="flex flex-wrap gap-8">
					{groups.map((group) => (
						<FencesBox key={group.id} group={group} moveFile={moveFile} />
					))}
				</div>
			</div>
		</DndProvider>
	);
}

export default App;
