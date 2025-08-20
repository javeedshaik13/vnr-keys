import { useState } from "react";
import { ChevronLeft, Filter } from "lucide-react";
import KeyCard from "./KeyCard";

const matchesSearch = (key, query) => {
	if (!query.trim()) return true;
	const term = query.toLowerCase();
	return (
		key.keyName.toLowerCase().includes(term) ||
		String(key.keyNumber).toLowerCase().includes(term) ||
		(key.location || "").toLowerCase().includes(term)
	);
};

const applyAvailabilityFilter = (keys, filter) => {
	switch (filter) {
		case "available":
			return keys.filter((k) => k.status === "available");
		case "unavailable":
			return keys.filter((k) => k.status !== "available");
		default:
			return keys;
	}
};

const DepartmentView = ({
	department,
	keys,
	searchQuery,
	onRequestKey,
	onBack,
	userRole = "faculty"
}) => {
	const [availabilityFilter, setAvailabilityFilter] = useState("all");

	const departmentKeys = keys.filter(key => key.category === department);
	const filteredBySearch = departmentKeys.filter(key => matchesSearch(key, searchQuery));
	const finalKeys = applyAvailabilityFilter(filteredBySearch, availabilityFilter);

	const handleFilterChange = (filter) => {
		setAvailabilityFilter(filter);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<button
					onClick={onBack}
					className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
				>
					<ChevronLeft className="w-5 h-5 text-white" />
				</button>
				<div>
					<h2 className="text-2xl font-bold text-white">{department} Department</h2>
					<p className="text-gray-300">{finalKeys.length} keys available</p>
				</div>
			</div>

			{/* Filter Buttons */}
			<div className="flex items-center gap-2">
				<Filter className="w-4 h-4 text-gray-400" />
				<div className="flex gap-2 overflow-x-auto pb-2">
					<button
						onClick={() => handleFilterChange("all")}
						className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
							availabilityFilter === "all"
								? "bg-green-500 text-white"
								: "bg-white/10 text-gray-300 hover:bg-white/20"
						}`}
					>
						All
					</button>
					<button
						onClick={() => handleFilterChange("available")}
						className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
							availabilityFilter === "available"
								? "bg-green-500 text-white"
								: "bg-white/10 text-gray-300 hover:bg-white/20"
						}`}
					>
						Available
					</button>
					<button
						onClick={() => handleFilterChange("unavailable")}
						className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
							availabilityFilter === "unavailable"
								? "bg-green-500 text-white"
								: "bg-white/10 text-gray-300 hover:bg-white/20"
						}`}
					>
						Unavailable
					</button>

				</div>
			</div>

			{/* Keys List */}
			<div className="space-y-4">
				{finalKeys.length === 0 ? (
					<div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
						<p className="text-gray-400 text-lg">
							{searchQuery.trim() 
								? `No keys found matching "${searchQuery}"` 
								: "No keys available in this department"
							}
						</p>
					</div>
				) : (
					finalKeys.map((key) => (
						<KeyCard
							key={key.id}
							keyData={key}
							variant="default"
							onRequestKey={onRequestKey}
							userRole={userRole}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default DepartmentView;
