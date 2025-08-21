const BlockCard = ({ block, keyCount, onClick, isSelected = false }) => {
	const getBlockInfo = (block) => {
		const blockInfo = {
			"A": { name: "Block A", description: "Computer Science & Storage" },
			"B": { name: "Block B", description: "Physics & Chemistry Labs" },
			"C": { name: "Block C", description: "Biology & Research" },
			"D": { name: "Block D", description: "Library & Study Rooms" },
			"E": { name: "Block E", description: "Administration & Faculty" },
			"PG": { name: "Block PG", description: "Auditorium & Seminar Halls" },
		};
		return blockInfo[block] || { name: block, description: "Other Facilities" };
	};

	const { name, description } = getBlockInfo(block);

	return (
		<button
			onClick={onClick}
			className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
				isSelected
					? "bg-green-500/20 border-green-500"
					: "bg-white/5 hover:bg-white/10 border-white/20"
			} border`}
		>
			<div className="flex items-start justify-between">
				<div>
					<h4 className="text-white font-medium mb-1">{name}</h4>
					<p className="text-sm text-gray-400 line-clamp-2">{description}</p>
				</div>
				<span className="ml-2 px-2 py-1 bg-white/10 rounded text-xs text-white">
					{keyCount}
				</span>
			</div>
		</button>
	);
};

export default BlockCard;
